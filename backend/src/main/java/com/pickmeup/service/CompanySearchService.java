package com.pickmeup.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickmeup.dto.job.JobApplicationDto.CompanyInfoResponse;
import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanySearchService {

    @Value("${serpapi.api-key:}")
    private String serpApiKey;

    @Value("${openai.api-key:}")
    private String openaiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private static final String SERPAPI_URL = "https://serpapi.com/search";
    private static final int CONNECT_TIMEOUT = 10000;
    private static final int READ_TIMEOUT = 30000;

    private RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT);
        factory.setReadTimeout(READ_TIMEOUT);
        return new RestTemplate(factory);
    }

    /**
     * SerpAPI를 사용한 회사 정보 검색
     */
    public CompanyInfoResponse searchCompanyInfo(String companyName) {
        if (serpApiKey == null || serpApiKey.isEmpty()) {
            log.warn("SerpAPI key is not configured, using AI-based search");
            return searchCompanyInfoWithAI(companyName);
        }

        try {
            RestTemplate restTemplate = createRestTemplate();
            
            // 1. 회사 기본 정보 검색
            String basicQuery = companyName + " 회사 정보 연봉 복지";
            String basicResult = callSerpApi(restTemplate, basicQuery);
            
            // 2. 면접 후기 검색
            String interviewQuery = companyName + " 면접 후기 잡플래닛";
            String interviewResult = callSerpApi(restTemplate, interviewQuery);
            
            // 3. 최근 뉴스 검색
            String newsQuery = companyName + " 채용 뉴스";
            String newsResult = callSerpApi(restTemplate, newsQuery);
            
            // AI로 정보 종합 및 요약
            return summarizeWithAI(companyName, basicResult, interviewResult, newsResult);
            
        } catch (Exception e) {
            log.error("Failed to search company info: {}", e.getMessage());
            return searchCompanyInfoWithAI(companyName);
        }
    }

    private String callSerpApi(RestTemplate restTemplate, String query) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(SERPAPI_URL)
                    .queryParam("q", query)
                    .queryParam("api_key", serpApiKey)
                    .queryParam("engine", "google")
                    .queryParam("hl", "ko")
                    .queryParam("gl", "kr")
                    .queryParam("num", "5")
                    .build()
                    .toUriString();

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("SerpAPI call failed: {}", e.getMessage());
            return "";
        }
    }

    /**
     * AI만으로 회사 정보 검색 (SerpAPI 키 없을 때)
     */
    private CompanyInfoResponse searchCompanyInfoWithAI(String companyName) {
        if (openaiApiKey == null || openaiApiKey.isEmpty() || !openaiApiKey.startsWith("sk-")) {
            throw new BusinessException(ErrorCode.AI_API_KEY_NOT_CONFIGURED);
        }

        try {
            String systemPrompt = "당신은 한국 기업 정보 전문가입니다. 회사에 대한 정보를 알려주세요.";
            String userPrompt = String.format("""
                회사명: %s
                
                이 회사에 대해 알고 있는 정보를 JSON 형식으로 알려주세요.
                정확히 알지 못하는 정보는 null로 표시하세요.
                
                반드시 아래 JSON 형식으로만 응답하세요:
                {
                    "overview": "회사 개요 (사업 분야, 주요 제품/서비스 등)",
                    "industry": "업종",
                    "employeeCount": "직원 수 (알 수 있다면)",
                    "foundedYear": "설립연도",
                    "culture": "회사 문화 특징",
                    "salaryInfo": "연봉 수준 (알 수 있다면)",
                    "interviewTips": "면접 시 주의사항이나 팁"
                }
                """, companyName);

            String response = callOpenAI(systemPrompt, userPrompt);
            return parseCompanyInfoResponse(companyName, response);
            
        } catch (Exception e) {
            log.error("AI company search failed: {}", e.getMessage());
            return CompanyInfoResponse.builder()
                    .companyName(companyName)
                    .overview("회사 정보를 찾을 수 없습니다.")
                    .build();
        }
    }

    /**
     * 검색 결과를 AI로 종합 요약
     */
    private CompanyInfoResponse summarizeWithAI(String companyName, String basicResult, 
                                                 String interviewResult, String newsResult) {
        try {
            String systemPrompt = "당신은 취업 준비생을 위한 기업 분석 전문가입니다.";
            String userPrompt = String.format("""
                회사명: %s
                
                아래 검색 결과를 분석하여 취업 준비생에게 유용한 정보를 JSON 형식으로 정리해주세요.
                
                [기본 정보 검색 결과]
                %s
                
                [면접 후기 검색 결과]
                %s
                
                [최근 뉴스]
                %s
                
                반드시 아래 JSON 형식으로만 응답하세요:
                {
                    "overview": "회사 개요 (사업 분야, 규모 등)",
                    "industry": "업종",
                    "employeeCount": "직원 수",
                    "foundedYear": "설립연도",
                    "recentNews": "최근 주요 뉴스나 동향 요약",
                    "interviewReviews": "면접 후기 요약 (분위기, 자주 나오는 질문 유형 등)",
                    "salaryInfo": "연봉/복지 정보",
                    "culture": "회사 문화 특징"
                }
                """, 
                companyName,
                truncate(basicResult, 2000),
                truncate(interviewResult, 2000),
                truncate(newsResult, 1000)
            );

            String response = callOpenAI(systemPrompt, userPrompt);
            return parseCompanyInfoResponse(companyName, response);
            
        } catch (Exception e) {
            log.error("AI summarize failed: {}", e.getMessage());
            return searchCompanyInfoWithAI(companyName);
        }
    }

    /**
     * 채용공고 URL에서 내용 크롤링
     */
    public String crawlJobPosting(String url) {
        try {
            log.info("Crawling job posting from: {}", url);
            
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(15000)
                    .get();

            StringBuilder content = new StringBuilder();
            
            // 주요 채용 사이트별 파싱
            if (url.contains("saramin.co.kr")) {
                content.append(parseSaramin(doc));
            } else if (url.contains("jobkorea.co.kr")) {
                content.append(parseJobKorea(doc));
            } else if (url.contains("wanted.co.kr")) {
                content.append(parseWanted(doc));
            } else if (url.contains("programmers.co.kr")) {
                content.append(parseProgrammers(doc));
            } else if (url.contains("jumpit.saramin.co.kr")) {
                content.append(parseJumpit(doc));
            } else {
                // 일반 크롤링
                content.append(parseGeneric(doc));
            }

            String result = content.toString().trim();
            if (result.isEmpty()) {
                throw new BusinessException(ErrorCode.CRAWL_FAILED, "채용공고 내용을 추출할 수 없습니다.");
            }
            
            log.info("Crawled content length: {}", result.length());
            return result;
            
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to crawl job posting: {}", e.getMessage());
            throw new BusinessException(ErrorCode.CRAWL_FAILED, "채용공고를 불러올 수 없습니다: " + e.getMessage());
        }
    }

    private String parseSaramin(Document doc) {
        StringBuilder sb = new StringBuilder();
        
        // 회사명
        Element company = doc.selectFirst(".company_name");
        if (company != null) sb.append("회사: ").append(company.text()).append("\n\n");
        
        // 포지션
        Element title = doc.selectFirst(".job_tit");
        if (title != null) sb.append("포지션: ").append(title.text()).append("\n\n");
        
        // 상세 내용
        Elements details = doc.select(".job_detail, .recruit_detail, .cont");
        for (Element detail : details) {
            sb.append(detail.text()).append("\n\n");
        }
        
        return sb.toString();
    }

    private String parseJobKorea(Document doc) {
        StringBuilder sb = new StringBuilder();
        
        Element title = doc.selectFirst(".title");
        if (title != null) sb.append("포지션: ").append(title.text()).append("\n\n");
        
        Elements details = doc.select(".tbRow, .detailContents");
        for (Element detail : details) {
            sb.append(detail.text()).append("\n\n");
        }
        
        return sb.toString();
    }

    private String parseWanted(Document doc) {
        StringBuilder sb = new StringBuilder();
        
        Element title = doc.selectFirst("h1");
        if (title != null) sb.append("포지션: ").append(title.text()).append("\n\n");
        
        Element company = doc.selectFirst("a[data-attribute-id='company__click']");
        if (company != null) sb.append("회사: ").append(company.text()).append("\n\n");
        
        Elements sections = doc.select("[class*='JobDescription'], [class*='job-description']");
        for (Element section : sections) {
            sb.append(section.text()).append("\n\n");
        }
        
        return sb.toString();
    }

    private String parseProgrammers(Document doc) {
        StringBuilder sb = new StringBuilder();
        
        Element title = doc.selectFirst("h2.title");
        if (title != null) sb.append("포지션: ").append(title.text()).append("\n\n");
        
        Elements sections = doc.select(".job-content, .description");
        for (Element section : sections) {
            sb.append(section.text()).append("\n\n");
        }
        
        return sb.toString();
    }

    private String parseJumpit(Document doc) {
        StringBuilder sb = new StringBuilder();
        
        Element title = doc.selectFirst("h1");
        if (title != null) sb.append("포지션: ").append(title.text()).append("\n\n");
        
        Elements sections = doc.select("[class*='position-'], [class*='description']");
        for (Element section : sections) {
            sb.append(section.text()).append("\n\n");
        }
        
        return sb.toString();
    }

    private String parseGeneric(Document doc) {
        StringBuilder sb = new StringBuilder();
        
        // 제목
        Element title = doc.selectFirst("h1, h2, .title, .job-title");
        if (title != null) sb.append("제목: ").append(title.text()).append("\n\n");
        
        // 본문 내용 추출 (광고, 네비게이션 제외)
        doc.select("nav, header, footer, script, style, .ad, .advertisement, .sidebar").remove();
        
        Elements mainContent = doc.select("main, article, .content, .job-content, .detail, .description");
        if (mainContent.isEmpty()) {
            mainContent = doc.select("body");
        }
        
        for (Element content : mainContent) {
            String text = content.text();
            if (text.length() > 100) {
                sb.append(text).append("\n\n");
            }
        }
        
        return sb.toString();
    }

    /**
     * 이미지에서 텍스트 추출 (OCR) - OpenAI Vision API 사용
     */
    public String extractTextFromImage(String base64Image) {
        if (openaiApiKey == null || openaiApiKey.isEmpty() || !openaiApiKey.startsWith("sk-")) {
            throw new BusinessException(ErrorCode.AI_API_KEY_NOT_CONFIGURED);
        }

        try {
            RestTemplate restTemplate = createRestTemplate();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            // Vision API 요청
            String requestBody = String.format("""
                {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "이 이미지는 채용공고입니다. 이미지에서 텍스트를 모두 추출해주세요. 담당업무, 자격요건, 우대사항, 복리후생 등의 섹션이 있다면 구분해서 정리해주세요. 텍스트만 출력하고 다른 설명은 하지 마세요."
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": "data:image/jpeg;base64,%s"
                                    }
                                }
                            ]
                        }
                    ],
                    "max_tokens": 4000
                }
                """, base64Image);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            
            log.info("Calling OpenAI Vision API for OCR...");
            ResponseEntity<String> response = restTemplate.exchange(
                "https://api.openai.com/v1/chat/completions",
                HttpMethod.POST,
                entity,
                String.class
            );
            
            JsonNode root = objectMapper.readTree(response.getBody());
            String extractedText = root.path("choices").get(0).path("message").path("content").asText();
            
            log.info("OCR completed, extracted {} characters", extractedText.length());
            return extractedText;
            
        } catch (Exception e) {
            log.error("OCR failed: {}", e.getMessage());
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "이미지에서 텍스트를 추출할 수 없습니다.");
        }
    }

    private String callOpenAI(String systemPrompt, String userPrompt) throws Exception {
        RestTemplate restTemplate = createRestTemplate();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        String requestBody = objectMapper.writeValueAsString(java.util.Map.of(
            "model", "gpt-3.5-turbo",
            "messages", List.of(
                java.util.Map.of("role", "system", "content", systemPrompt),
                java.util.Map.of("role", "user", "content", userPrompt)
            ),
            "temperature", 0.7,
            "max_tokens", 2000
        ));

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
        
        ResponseEntity<String> response = restTemplate.exchange(
            "https://api.openai.com/v1/chat/completions",
            HttpMethod.POST,
            entity,
            String.class
        );

        JsonNode root = objectMapper.readTree(response.getBody());
        return root.path("choices").get(0).path("message").path("content").asText();
    }

    private CompanyInfoResponse parseCompanyInfoResponse(String companyName, String jsonResponse) {
        try {
            // JSON 부분만 추출
            int start = jsonResponse.indexOf('{');
            int end = jsonResponse.lastIndexOf('}') + 1;
            if (start >= 0 && end > start) {
                jsonResponse = jsonResponse.substring(start, end);
            }

            JsonNode node = objectMapper.readTree(jsonResponse);
            
            return CompanyInfoResponse.builder()
                    .companyName(companyName)
                    .overview(node.path("overview").asText(null))
                    .industry(node.path("industry").asText(null))
                    .employeeCount(node.path("employeeCount").asText(null))
                    .foundedYear(node.path("foundedYear").asText(null))
                    .recentNews(node.path("recentNews").asText(null))
                    .interviewReviews(node.path("interviewReviews").asText(node.path("interviewTips").asText(null)))
                    .salaryInfo(node.path("salaryInfo").asText(null))
                    .culture(node.path("culture").asText(null))
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to parse company info response: {}", e.getMessage());
            return CompanyInfoResponse.builder()
                    .companyName(companyName)
                    .overview(jsonResponse)
                    .build();
        }
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength) + "..." : text;
    }
}
