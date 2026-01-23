package com.pickmeup.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickmeup.domain.job.AIUsageType;
import com.pickmeup.domain.user.AiUsage;
import com.pickmeup.domain.user.User;
import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import com.pickmeup.repository.AiUsageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAIService {

    @Value("${openai.api-key:}")
    private String apiKey;

    private final AiUsageRepository aiUsageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // 동시 요청 방지를 위한 플래그
    private final AtomicBoolean isProcessing = new AtomicBoolean(false);

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final int CONNECT_TIMEOUT = 10000; // 10초
    private static final int READ_TIMEOUT = 30000; // 30초
    private static final int DAILY_LIMIT = 5;

    private RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT);
        factory.setReadTimeout(READ_TIMEOUT);
        return new RestTemplate(factory);
    }

    /**
     * API 키 설정 여부 확인
     */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && apiKey.startsWith("sk-");
    }

    /**
     * 일일 사용량 체크 및 증가
     */
    @Transactional
    public void checkAndIncrementUsage(User user, String usageType) {
        LocalDate today = LocalDate.now();
        
        AiUsage usage = aiUsageRepository.findByUserAndUsageDate(user, today)
                .orElseGet(() -> {
                    AiUsage newUsage = AiUsage.builder()
                            .user(user)
                            .usageDate(today)
                            .questionCount(0)
                            .feedbackCount(0)
                            .build();
                    return aiUsageRepository.save(newUsage);
                });

        if (usage.getTotalCount() >= DAILY_LIMIT) {
            throw new BusinessException(ErrorCode.AI_DAILY_LIMIT_EXCEEDED, 
                    String.format("오늘의 AI 사용 횟수(%d회)를 모두 소진했습니다. 내일 다시 이용해주세요.", DAILY_LIMIT));
        }

        if (AIUsageType.GENERATE_QUESTIONS.name().equals(usageType)) {
            usage.incrementQuestionCount();
        } else {
            usage.incrementFeedbackCount();
        }
    }

    /**
     * 남은 사용 횟수 조회
     */
    public int getRemainingUsage(User user, AIUsageType type) {
        LocalDate today = LocalDate.now();
        AiUsage usage = aiUsageRepository.findByUserAndUsageDate(user, today).orElse(null);
        int used = usage != null ? usage.getTotalCount() : 0;
        return Math.max(0, DAILY_LIMIT - used);
    }

    /**
     * 서류/면접 예상 질문 생성 (채용공고 + 회사정보 포함) + 모범답변 함께 생성
     * 토큰 효율화: 질문과 모범답변을 한번에 생성
     */
    public List<Map<String, String>> generateQuestionsWithAnswers(
            String companyName, 
            String position, 
            String jobType,
            String jobDescription,
            String companyInfo,
            String requiredSkills,
            String experienceRequired,
            boolean isInterview) {
        
        validateApiKey();
        
        // 동시 요청 방지
        if (!isProcessing.compareAndSet(false, true)) {
            log.warn("AI request already in progress, rejecting new request");
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "이미 AI 요청이 진행 중입니다. 잠시 후 다시 시도해주세요.");
        }

        try {
            String systemPrompt = isInterview 
                ? "당신은 채용 면접관이자 면접 코치입니다. 면접 질문과 그에 대한 모범답변을 생성해주세요."
                : "당신은 채용 담당자이자 자기소개서 컨설턴트입니다. 자기소개서 예상 질문과 모범답변을 생성해주세요.";

            StringBuilder contextBuilder = new StringBuilder();
            contextBuilder.append(String.format("회사: %s\n", companyName != null ? companyName : "미정"));
            contextBuilder.append(String.format("포지션: %s\n", position != null ? position : "미정"));
            contextBuilder.append(String.format("고용형태: %s\n", jobType != null ? jobType : "정규직"));
            
            if (experienceRequired != null && !experienceRequired.isEmpty()) {
                contextBuilder.append(String.format("요구 경력: %s\n", experienceRequired));
            }
            if (requiredSkills != null && !requiredSkills.isEmpty()) {
                contextBuilder.append(String.format("요구 기술: %s\n", requiredSkills));
            }
            if (jobDescription != null && !jobDescription.isEmpty()) {
                String desc = jobDescription.length() > 2000 ? jobDescription.substring(0, 2000) + "..." : jobDescription;
                contextBuilder.append(String.format("\n[채용공고 내용]\n%s\n", desc));
            }
            if (companyInfo != null && !companyInfo.isEmpty()) {
                String info = companyInfo.length() > 1000 ? companyInfo.substring(0, 1000) + "..." : companyInfo;
                contextBuilder.append(String.format("\n[회사 정보]\n%s\n", info));
            }

            String userPrompt = String.format("""
                %s
                
                위 정보를 바탕으로 이 회사와 포지션에 맞는 %s 예상 질문 5개와 각 질문에 대한 모범답변을 생성해주세요.
                
                %s
                
                각 질문은 구체적이고 실제로 자주 물어보는 질문이어야 합니다.
                모범답변은 STAR 기법이나 구체적인 예시를 포함하여 실제 합격자가 답변할 법한 수준으로 작성해주세요.
                
                반드시 아래 JSON 배열 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요:
                [
                    {"question": "질문1", "bestAnswer": "모범답변1"},
                    {"question": "질문2", "bestAnswer": "모범답변2"},
                    {"question": "질문3", "bestAnswer": "모범답변3"},
                    {"question": "질문4", "bestAnswer": "모범답변4"},
                    {"question": "질문5", "bestAnswer": "모범답변5"}
                ]
                """,
                contextBuilder.toString(),
                isInterview ? "면접" : "자기소개서",
                jobDescription != null ? "채용공고 내용을 분석하여 해당 직무에 특화된 질문과 답변을 만들어주세요." : ""
            );

            String response = callOpenAI(systemPrompt, userPrompt);
            List<Map<String, String>> results = parseQuestionsWithAnswers(response);
            
            if (results.isEmpty()) {
                log.error("Failed to generate questions with answers, empty result");
                throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "질문 생성에 실패했습니다. 다시 시도해주세요.");
            }
            
            // 최대 5개로 제한
            if (results.size() > 5) {
                results = results.subList(0, 5);
            }
            
            return results;
            
        } finally {
            isProcessing.set(false);
        }
    }

    /**
     * 서류/면접 예상 질문 생성 (기본) - 하위 호환성 유지
     */
    public List<String> generateQuestions(String companyName, String position, String jobType, boolean isInterview) {
        List<Map<String, String>> results = generateQuestionsWithAnswers(
            companyName, position, jobType, null, null, null, null, isInterview
        );
        return results.stream().map(m -> m.get("question")).toList();
    }

    /**
     * 서류/면접 예상 질문 생성 (채용공고 + 회사정보 포함) - 하위 호환성 유지
     */
    public List<String> generateQuestionsWithContext(
            String companyName, 
            String position, 
            String jobType,
            String jobDescription,
            String companyInfo,
            String requiredSkills,
            String experienceRequired,
            boolean isInterview) {
        
        List<Map<String, String>> results = generateQuestionsWithAnswers(
            companyName, position, jobType, jobDescription, companyInfo, 
            requiredSkills, experienceRequired, isInterview
        );
        return results.stream().map(m -> m.get("question")).toList();
    }

    /**
     * 답변에 대한 AI 피드백 생성
     */
    public Map<String, String> generateFeedback(String question, String myAnswer, boolean isInterview) {
        validateApiKey();
        
        // 동시 요청 방지
        if (!isProcessing.compareAndSet(false, true)) {
            log.warn("AI request already in progress, rejecting new request");
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "이미 AI 요청이 진행 중입니다. 잠시 후 다시 시도해주세요.");
        }

        try {
            // 답변이 없으면 에러
            if (myAnswer == null || myAnswer.trim().isEmpty()) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "답변을 먼저 작성해주세요.");
            }

            String systemPrompt = isInterview
                ? "당신은 경력 20년차 면접 코치입니다. 면접 답변에 대해 건설적인 피드백을 제공합니다."
                : "당신은 경력 20년차 자기소개서 컨설턴트입니다. 자기소개서 답변에 대해 건설적인 피드백을 제공합니다.";

            String userPrompt = String.format("""
                질문: %s
                
                지원자 답변:
                %s
                
                위 답변에 대해 피드백과 더 나은 예시 답변을 제공해주세요.
                
                반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요:
                {
                    "feedback": "잘한 점과 개선할 점을 포함한 구체적인 피드백",
                    "bestAnswer": "개선된 예시 답변"
                }
                """,
                question,
                myAnswer.length() > 2000 ? myAnswer.substring(0, 2000) + "..." : myAnswer // 답변 길이 제한
            );

            String response = callOpenAI(systemPrompt, userPrompt);
            Map<String, String> result = parseJsonObject(response);
            
            // 빈 결과 체크
            if (result.get("feedback").isEmpty() && result.get("bestAnswer").isEmpty()) {
                log.error("Failed to generate feedback, empty result");
                throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "피드백 생성에 실패했습니다. 다시 시도해주세요.");
            }
            
            return result;
            
        } finally {
            isProcessing.set(false);
        }
    }

    private void validateApiKey() {
        if (!isConfigured()) {
            log.error("OpenAI API key is not configured");
            throw new BusinessException(ErrorCode.AI_API_KEY_NOT_CONFIGURED);
        }
    }

    private String callOpenAI(String systemPrompt, String userPrompt) {
        try {
            RestTemplate restTemplate = createRestTemplate();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");
            requestBody.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            ));
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 2000);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            log.info("Calling OpenAI API...");
            ResponseEntity<String> response = restTemplate.exchange(
                OPENAI_API_URL,
                HttpMethod.POST,
                entity,
                String.class
            );
            log.info("OpenAI API response received");

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (RestClientException e) {
            log.error("OpenAI API call failed: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "AI 서비스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } catch (Exception e) {
            log.error("OpenAI API call failed", e);
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "AI 서비스 오류가 발생했습니다.");
        }
    }

    private List<String> parseJsonArray(String json) {
        try {
            // JSON 배열 부분만 추출
            int start = json.indexOf('[');
            int end = json.lastIndexOf(']') + 1;
            if (start >= 0 && end > start) {
                json = json.substring(start, end);
            }
            
            JsonNode node = objectMapper.readTree(json);
            List<String> result = new ArrayList<>();
            if (node.isArray()) {
                for (JsonNode item : node) {
                    String text = item.asText().trim();
                    if (!text.isEmpty()) {
                        result.add(text);
                    }
                }
            }
            return result;
        } catch (Exception e) {
            log.error("Failed to parse JSON array: {}", json, e);
            return List.of();
        }
    }

    private List<Map<String, String>> parseQuestionsWithAnswers(String json) {
        try {
            // JSON 배열 부분만 추출
            int start = json.indexOf('[');
            int end = json.lastIndexOf(']') + 1;
            if (start >= 0 && end > start) {
                json = json.substring(start, end);
            }
            
            JsonNode node = objectMapper.readTree(json);
            List<Map<String, String>> result = new ArrayList<>();
            if (node.isArray()) {
                for (JsonNode item : node) {
                    String question = item.path("question").asText("").trim();
                    String bestAnswer = item.path("bestAnswer").asText("").trim();
                    if (!question.isEmpty()) {
                        Map<String, String> qa = new HashMap<>();
                        qa.put("question", question);
                        qa.put("bestAnswer", bestAnswer);
                        result.add(qa);
                    }
                }
            }
            return result;
        } catch (Exception e) {
            log.error("Failed to parse questions with answers: {}", json, e);
            return List.of();
        }
    }

    private Map<String, String> parseJsonObject(String json) {
        try {
            // JSON 객체 부분만 추출
            int start = json.indexOf('{');
            int end = json.lastIndexOf('}') + 1;
            if (start >= 0 && end > start) {
                json = json.substring(start, end);
            }

            JsonNode node = objectMapper.readTree(json);
            Map<String, String> result = new HashMap<>();
            result.put("feedback", node.path("feedback").asText(""));
            result.put("bestAnswer", node.path("bestAnswer").asText(""));
            return result;
        } catch (Exception e) {
            log.error("Failed to parse JSON object: {}", json, e);
            return Map.of("feedback", "", "bestAnswer", "");
        }
    }

    /**
     * 이미지에서 채용공고 텍스트 추출 (OCR)
     */
    public String extractTextFromImage(String base64Image) {
        validateApiKey();

        try {
            RestTemplate restTemplate = createRestTemplate();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            // Vision API 요청
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4o-mini");  // Vision 지원 모델
            requestBody.put("messages", List.of(
                Map.of("role", "system", "content", 
                    "당신은 채용공고 이미지에서 텍스트를 추출하는 도우미입니다. " +
                    "이미지에서 모든 텍스트를 정확하게 추출하여 원본 형식을 최대한 유지하면서 반환해주세요. " +
                    "담당업무, 자격요건, 우대사항 등의 섹션이 있다면 구분해서 정리해주세요."),
                Map.of("role", "user", "content", List.of(
                    Map.of("type", "text", "text", "이 채용공고 이미지에서 모든 텍스트를 추출해주세요."),
                    Map.of("type", "image_url", "image_url", Map.of(
                        "url", "data:image/jpeg;base64," + base64Image
                    ))
                ))
            ));
            requestBody.put("max_tokens", 4000);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            log.info("Calling OpenAI Vision API for OCR...");
            ResponseEntity<String> response = restTemplate.exchange(
                OPENAI_API_URL,
                HttpMethod.POST,
                entity,
                String.class
            );
            log.info("OpenAI Vision API response received");

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (RestClientException e) {
            log.error("OpenAI Vision API call failed: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "이미지 텍스트 추출에 실패했습니다.");
        } catch (Exception e) {
            log.error("OpenAI Vision API call failed", e);
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "이미지 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * URL에서 채용공고 내용 분석 (URL 내용을 요약)
     */
    public String analyzeJobPostingFromUrl(String urlContent) {
        validateApiKey();

        try {
            String systemPrompt = "당신은 채용공고 분석 전문가입니다. 채용공고 내용을 정리하여 핵심 정보를 추출해주세요.";
            
            String userPrompt = String.format("""
                다음 채용공고 내용을 분석하여 아래 형식으로 정리해주세요:
                
                [담당업무]
                - 주요 업무 내용
                
                [자격요건]
                - 필수 요건
                
                [우대사항]
                - 우대 조건
                
                [기타 정보]
                - 근무조건, 복지 등
                
                채용공고 내용:
                %s
                """,
                urlContent.length() > 3000 ? urlContent.substring(0, 3000) + "..." : urlContent
            );

            return callOpenAI(systemPrompt, userPrompt);

        } catch (Exception e) {
            log.error("Failed to analyze job posting: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "채용공고 분석에 실패했습니다.");
        }
    }
}
