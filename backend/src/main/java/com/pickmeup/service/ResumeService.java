package com.pickmeup.service;

import com.pickmeup.domain.resume.*;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.resume.ResumeDto.*;
import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import com.pickmeup.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ExperienceRepository experienceRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final com.pickmeup.repository.AIUsageLogRepository aiUsageLogRepository;

    @org.springframework.beans.factory.annotation.Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private final FileUploadService fileUploadService;

    @org.springframework.beans.factory.annotation.Value("${openai.api-key:}")
    private String openAiApiKey;

    @org.springframework.beans.factory.annotation.Value("${admin.email:admin@pickmeup.com}")
    private String ADMIN_EMAIL;

    // ─── 조회 ──────────────────────────────────────────────

    public Response getMyResume(User user) {
        Resume resume = getOrCreateResume(user);
        return buildResponse(resume);
    }

    public PublicResponse getPublicResume(String slug) {
        Resume resume = resumeRepository.findBySlugAndIsPublicTrue(slug)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
        resume.incrementViewCount();
        resumeRepository.save(resume);
        return buildPublicResponse(resume);
    }

    // ─── 설정 ──────────────────────────────────────────────

    @Transactional
    public Response updateSettings(User user, UpdateSettingsRequest req) {
        Resume resume = getOrCreateResume(user);
        if (req.getSlug() != null && !req.getSlug().isBlank()) {
            resumeRepository.findBySlug(req.getSlug()).ifPresent(other -> {
                if (!other.getId().equals(resume.getId())) {
                    throw new BusinessException(ErrorCode.DUPLICATE_SLUG);
                }
            });
            resume.setSlug(req.getSlug());
        }
        if (req.getResumeType() != null) resume.setResumeType(req.getResumeType());
        if (req.getLayoutType() != null) resume.setLayoutType(req.getLayoutType());
        if (req.getIsPublic() != null) resume.setPublic(req.getIsPublic());
        return buildResponse(resumeRepository.save(resume));
    }

    // ─── 기본 정보 ─────────────────────────────────────────

    @Transactional
    public Response updateBasicInfo(User user, UpdateBasicInfoRequest req) {
        Resume resume = getOrCreateResume(user);
        resume.updateBasicInfo(req.getName(), req.getEmail(), req.getPhone(),
                req.getBirthDate(), req.getGender(), req.getAddress(),
                req.getProfileImageUrl(), req.getBio());
        return buildResponse(resumeRepository.save(resume));
    }

    @Transactional
    public Response updateLinks(User user, UpdateLinksRequest req) {
        Resume resume = getOrCreateResume(user);
        resume.updateLinks(req.getGithubUrl(), req.getLinkedinUrl(),
                req.getBlogUrl(), req.getPortfolioUrl());
        return buildResponse(resumeRepository.save(resume));
    }

    @Transactional
    public Response updateFreeContent(User user, UpdateFreeContentRequest req) {
        Resume resume = getOrCreateResume(user);
        resume.updateFreeContent(req.getTitle(), req.getBio(), req.getFreeContent());
        return buildResponse(resumeRepository.save(resume));
    }

    // ─── 학력 ──────────────────────────────────────────────

    @Transactional
    public Response addEducation(User user, EducationRequest req) {
        Resume resume = getOrCreateResume(user);
        Education edu = Education.builder()
                .resume(resume)
                .schoolName(req.getSchoolName())
                .major(req.getMajor())
                .level(req.getLevel())
                .institutionType(req.getInstitutionType() != null ? req.getInstitutionType() : "SCHOOL")
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .graduationStatus(req.getGraduationStatus())
                .gpa(req.getGpa())
                .maxGpa(req.getMaxGpa())
                .courseName(req.getCourseName())
                .instructor(req.getInstructor())
                .build();
        resume.getEducations().add(edu);
        return buildResponse(resumeRepository.save(resume));
    }

    @Transactional
    public Response updateEducation(User user, Long educationId, EducationRequest req) {
        Resume resume = getOrCreateResume(user);
        Education edu = resume.getEducations().stream()
                .filter(e -> e.getId().equals(educationId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        resume.getEducations().remove(edu);
        Education updated = Education.builder()
                .resume(resume)
                .schoolName(req.getSchoolName())
                .major(req.getMajor())
                .level(req.getLevel())
                .institutionType(req.getInstitutionType() != null ? req.getInstitutionType() : "SCHOOL")
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .graduationStatus(req.getGraduationStatus())
                .gpa(req.getGpa())
                .maxGpa(req.getMaxGpa())
                .courseName(req.getCourseName())
                .instructor(req.getInstructor())
                .build();
        resume.getEducations().add(updated);
        return buildResponse(resumeRepository.save(resume));
    }

    @Transactional
    public Response deleteEducation(User user, Long educationId) {
        Resume resume = getOrCreateResume(user);
        resume.getEducations().removeIf(e -> e.getId().equals(educationId));
        return buildResponse(resumeRepository.save(resume));
    }

    // ─── 경력 ──────────────────────────────────────────────

    @Transactional
    public Response addExperience(User user, ExperienceRequest req) {
        Resume resume = getOrCreateResume(user);
        Experience exp = Experience.builder()
                .resume(resume)
                .company(req.getCompany())
                .position(req.getPosition())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .isCurrent(req.getIsCurrent() != null && req.getIsCurrent())
                .description(req.getDescription())
                .build();
        resume.getExperiences().add(exp);
        return buildResponse(resumeRepository.save(resume));
    }

    @Transactional
    public Response updateExperience(User user, Long experienceId, ExperienceRequest req) {
        Resume resume = getOrCreateResume(user);
        resume.getExperiences().removeIf(e -> e.getId().equals(experienceId));
        Experience updated = Experience.builder()
                .resume(resume)
                .company(req.getCompany())
                .position(req.getPosition())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .isCurrent(req.getIsCurrent() != null && req.getIsCurrent())
                .description(req.getDescription())
                .build();
        resume.getExperiences().add(updated);
        return buildResponse(resumeRepository.save(resume));
    }

    @Transactional
    public Response deleteExperience(User user, Long experienceId) {
        Resume resume = getOrCreateResume(user);
        resume.getExperiences().removeIf(e -> e.getId().equals(experienceId));
        return buildResponse(resumeRepository.save(resume));
    }

    // ─── 프로젝트 ───────────────────────────────────────────

    @Transactional
    public Response addProject(User user, ProjectRequest req) {
        Resume resume = getOrCreateResume(user);
        Project proj = Project.builder()
                .resume(resume)
                .title(req.getTitle())
                .description(req.getDescription())
                .detailContent(req.getDetailContent())
                .role(req.getRole())
                .teamSize(req.getTeamSize())
                .achievements(req.getAchievements())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .projectUrl(req.getProjectUrl())
                .githubUrl(req.getGithubUrl())
                .demoUrl(req.getDemoUrl())
                .thumbnailUrl(req.getThumbnailUrl())
                .techStacks(req.getTechStacks() != null ? req.getTechStacks() : List.of())
                .isFeatured(req.getIsFeatured() != null && req.getIsFeatured())
                .build();
        resume.getProjects().add(proj);
        return buildResponse(resumeRepository.save(resume));
    }

    @Transactional
    public Response updateProject(User user, Long projectId, ProjectRequest req) {
        Project proj = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        proj.update(
                req.getTitle(), req.getDescription(), req.getDetailContent(),
                req.getRole(), req.getTeamSize(), req.getAchievements(),
                req.getStartDate(), req.getEndDate(),
                req.getProjectUrl(), req.getGithubUrl(), req.getDemoUrl(),
                req.getThumbnailUrl(), null,
                req.getTechStacks() != null ? req.getTechStacks() : List.of(),
                req.getIsFeatured() != null && req.getIsFeatured()
        );
        projectRepository.save(proj);
        Resume resume = getOrCreateResume(user);
        return buildResponse(resumeRepository.save(resume));
    }

    @Transactional
    public Response deleteProject(User user, Long projectId) {
        Resume resume = getOrCreateResume(user);
        resume.getProjects().removeIf(p -> p.getId().equals(projectId));
        return buildResponse(resumeRepository.save(resume));
    }

    // ─── 기술 ──────────────────────────────────────────────

    @Transactional
    public Response addSkill(User user, SkillRequest req) {
        Resume resume = getOrCreateResume(user);
        Skill skill = Skill.builder()
                .resume(resume)
                .name(req.getName())
                .category(req.getCategory())
                .level(req.getLevel() != null ? req.getLevel() : SkillLevel.INTERMEDIATE)
                .build();
        resume.getSkills().add(skill);
        return buildResponse(resumeRepository.save(resume));
    }

    @Transactional
    public Response deleteSkill(User user, Long skillId) {
        Resume resume = getOrCreateResume(user);
        resume.getSkills().removeIf(s -> s.getId().equals(skillId));
        return buildResponse(resumeRepository.save(resume));
    }

    // ─── 유틸 ──────────────────────────────────────────────

    private Resume getOrCreateResume(User user) {
        return resumeRepository.findByUser(user).orElseGet(() -> {
            Resume newResume = Resume.builder().user(user).build();
            return resumeRepository.save(newResume);
        });
    }

    private Response buildResponse(Resume resume) {
        return Response.from(
                resume,
                resume.getEducations() != null ? resume.getEducations() : List.of(),
                resume.getExperiences() != null ? resume.getExperiences() : List.of(),
                resume.getProjects() != null ? resume.getProjects() : List.of(),
                resume.getSkills() != null ? resume.getSkills() : List.of(),
                List.of(),
                List.of(),
                List.of()
        );
    }

    private PublicResponse buildPublicResponse(Resume resume) {
        return PublicResponse.from(
                resume,
                resume.getEducations() != null ? resume.getEducations() : List.of(),
                resume.getExperiences() != null ? resume.getExperiences() : List.of(),
                resume.getProjects() != null ? resume.getProjects() : List.of(),
                resume.getSkills() != null ? resume.getSkills() : List.of(),
                List.of(), List.of(), List.of()
        );
    }

    // ─── 파일 업로드 ────────────────────────────────────────

    @Transactional
    public String uploadProfileImage(User user, org.springframework.web.multipart.MultipartFile file) {
        String url = fileUploadService.uploadImage(file, "profile");
        Resume resume = getOrCreateResume(user);
        resume.updateBasicInfo(resume.getName(), resume.getEmail(), resume.getPhone(),
                resume.getBirthDate(), resume.getGender(), resume.getAddress(), url, resume.getBio());
        resumeRepository.save(resume);
        return url;
    }

    @Transactional
    public String uploadProjectImage(User user, org.springframework.web.multipart.MultipartFile file) {
        return fileUploadService.uploadImage(file, "project");
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ResumeService.class);

    private String saveFile(org.springframework.web.multipart.MultipartFile file, String prefix) {
        throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
    }

    // ─── AI 내용 정리 (A안/B안) ──────────────────────────────

    private static final int REFINE_DAILY_LIMIT = 5;
    private static final int DIAGRAM_DAILY_LIMIT = 3;

    private boolean isAdmin(User user) {
        return ADMIN_EMAIL.equals(user.getEmail());
    }

    @Transactional
    public java.util.Map<String, Object> refineContent(User user, String content, String projectTitle) {
        if (content == null || content.isBlank())
            throw new BusinessException(ErrorCode.INVALID_INPUT, "내용을 먼저 작성해주세요.");

        boolean admin = isAdmin(user);
        java.time.LocalDate today = java.time.LocalDate.now();

        com.pickmeup.domain.job.AIUsageLog usageLog = null;
        if (!admin) {
            usageLog = aiUsageLogRepository
                    .findByUserAndUsageDateAndUsageType(user, today, com.pickmeup.domain.job.AIUsageType.DIAGRAM_GENERATION)
                    .orElseGet(() -> aiUsageLogRepository.save(
                            com.pickmeup.domain.job.AIUsageLog.builder()
                                    .user(user).usageDate(today)
                                    .usageType(com.pickmeup.domain.job.AIUsageType.DIAGRAM_GENERATION)
                                    .build()));
            if (!usageLog.canUse(REFINE_DAILY_LIMIT))
                throw new BusinessException(ErrorCode.AI_USAGE_LIMIT_EXCEEDED);
        }

        java.util.Map<String, String> result = callOpenAIForRefine(content, projectTitle);

        if (!admin && usageLog != null) {
            usageLog.incrementCount();
            aiUsageLogRepository.save(usageLog);
        }

        int remaining = admin ? 999 : (REFINE_DAILY_LIMIT - (usageLog != null ? usageLog.getUsageCount() : 0));
        return java.util.Map.of(
                "planA", result.getOrDefault("planA", ""),
                "planB", result.getOrDefault("planB", ""),
                "remaining", remaining
        );
    }

    public java.util.Map<String, Object> getRefineUsage(User user) {
        if (isAdmin(user)) return java.util.Map.of("used", 0, "limit", 999, "remaining", 999);
        java.time.LocalDate today = java.time.LocalDate.now();
        int used = aiUsageLogRepository
                .findByUserAndUsageDateAndUsageType(user, today, com.pickmeup.domain.job.AIUsageType.DIAGRAM_GENERATION)
                .map(com.pickmeup.domain.job.AIUsageLog::getUsageCount).orElse(0);
        return java.util.Map.of("used", used, "limit", REFINE_DAILY_LIMIT, "remaining", REFINE_DAILY_LIMIT - used);
    }

    private java.util.Map<String, String> callOpenAIForRefine(String content, String projectTitle) {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            return java.util.Map.of(
                    "planA", "<p>OpenAI API 키가 설정되지 않았습니다.</p>",
                    "planB", "<p>OpenAI API 키가 설정되지 않았습니다.</p>"
            );
        }
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();

            String systemPrompt = """
                당신은 개발자 포트폴리오/이력서 전문 컨설턴트입니다.
                사용자가 작성한 프로젝트 상세 설명을 두 가지 다른 스타일로 깔끔하게 정리해줍니다.
                
                규칙:
                1. 반드시 JSON 형식으로만 응답: {"planA": "...", "planB": "..."}
                2. 두 안 모두 성과, 역할, 기술 스택, 구현 과정을 포함해야 함
                3. A안과 B안은 같은 내용을 다른 구성/흐름/표현으로 정리한 것
                4. 각 안은 HTML 형식으로 작성 (h3, ul, li, strong, p 태그 사용)
                5. 각 안은 300~500자 내외로 간결하고 임팩트 있게
                6. 기술 스택은 <strong> 태그로 강조
                7. 불필요한 내용 제거, 핵심만 남기기
                8. 원문 내용을 기반으로 정리 (내용 추가/날조 금지)
                """;

            String plainText = content.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
            String title = projectTitle != null ? projectTitle : "프로젝트";

            String userPrompt = String.format("""
                프로젝트명: %s
                
                작성한 내용:
                %s
                
                위 내용을 A안(성과 중심)과 B안(역할 중심) 두 가지로 정리해주세요.
                반드시 JSON 형식으로만 응답하세요.
                """, title, plainText.length() > 3000 ? plainText.substring(0, 3000) : plainText);

            var body = java.util.Map.of(
                    "model", "gpt-4o-mini",
                    "messages", java.util.List.of(
                            java.util.Map.of("role", "system", "content", systemPrompt),
                            java.util.Map.of("role", "user", "content", userPrompt)),
                    "max_tokens", 1500,
                    "temperature", 0.5);

            var conn = (java.net.HttpURLConnection)
                    new java.net.URL("https://api.openai.com/v1/chat/completions").openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setRequestProperty("Authorization", "Bearer " + openAiApiKey);
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(30000);
            conn.setDoOutput(true);
            conn.getOutputStream().write(mapper.writeValueAsBytes(body));

            if (conn.getResponseCode() != 200) {
                log.error("[Refine] OpenAI error {}", conn.getResponseCode());
                throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "AI 서비스 오류가 발생했습니다.");
            }

            String raw = new String(conn.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            var res = mapper.readTree(raw);
            String text = res.path("choices").get(0).path("message").path("content").asText().trim();

            int start = text.indexOf('{');
            int end = text.lastIndexOf('}') + 1;
            if (start >= 0 && end > start) text = text.substring(start, end);

            var parsed = mapper.readTree(text);
            return java.util.Map.of(
                    "planA", parsed.path("planA").asText(""),
                    "planB", parsed.path("planB").asText("")
            );

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("[Refine] failed: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.AI_SERVICE_ERROR, "AI 정리 중 오류가 발생했습니다.");
        }
    }

    @Transactional
    public java.util.Map<String, Object> generateDiagram(User user, String description, String diagramType) {
        boolean admin = isAdmin(user);
        java.time.LocalDate today = java.time.LocalDate.now();

        com.pickmeup.domain.job.AIUsageLog usageLog = null;
        if (!admin) {
            usageLog = aiUsageLogRepository
                    .findByUserAndUsageDateAndUsageType(user, today, com.pickmeup.domain.job.AIUsageType.DIAGRAM_GENERATION)
                    .orElseGet(() -> aiUsageLogRepository.save(
                            com.pickmeup.domain.job.AIUsageLog.builder()
                                    .user(user).usageDate(today)
                                    .usageType(com.pickmeup.domain.job.AIUsageType.DIAGRAM_GENERATION)
                                    .build()));
            if (!usageLog.canUse(DIAGRAM_DAILY_LIMIT))
                throw new BusinessException(ErrorCode.AI_USAGE_LIMIT_EXCEEDED);
        }

        String mermaidCode = callOpenAIForDiagram(description, diagramType);

        if (!admin && usageLog != null) {
            usageLog.incrementCount();
            aiUsageLogRepository.save(usageLog);
        }

        int remaining = admin ? 999 : (DIAGRAM_DAILY_LIMIT - (usageLog != null ? usageLog.getUsageCount() : 0));
        return java.util.Map.of(
                "mermaidCode", mermaidCode,
                "remaining", remaining,
                "type", diagramType
        );
    }

    public java.util.Map<String, Object> getDiagramUsage(User user) {
        if (isAdmin(user)) {
            return java.util.Map.of("used", 0, "limit", 999, "remaining", 999);
        }
        java.time.LocalDate today = java.time.LocalDate.now();
        int used = aiUsageLogRepository
                .findByUserAndUsageDateAndUsageType(user, today, com.pickmeup.domain.job.AIUsageType.DIAGRAM_GENERATION)
                .map(com.pickmeup.domain.job.AIUsageLog::getUsageCount).orElse(0);
        return java.util.Map.of("used", used, "limit", DIAGRAM_DAILY_LIMIT, "remaining", DIAGRAM_DAILY_LIMIT - used);
    }

    private String callOpenAIForDiagram(String description, String type) {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            return buildFallbackDiagram(type);
        }
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();

            String systemPrompt = """
                You are an expert software architecture diagram creator using Mermaid.js v10.
                
                STRICT RULES:
                1. Return ONLY raw Mermaid syntax. No code fences, no markdown, no explanation.
                2. ALL text MUST be English only. No Korean, no non-ASCII characters.
                3. Max 12 nodes. Keep it simple and clean.
                4. NEVER use fa: icons or any icon syntax whatsoever.
                5. Node labels must contain ONLY: letters, numbers, spaces, hyphens, underscores, forward-slashes.
                6. For flowchart: use --> arrows. Edge labels use |text| syntax.
                7. Prefer flowchart TD for architecture. Use sequenceDiagram for API call flows.
                8. Translate all Korean concepts to concise English equivalents.
                9. NEVER use unicode arrows like → ➜ ➡ in node labels. Use plain ASCII only.
                10. Do NOT use special characters: & / \\ * @ # % in labels.
                """;

            String userPrompt = "Create a " + type + " diagram for this project:\n" + description
                    + "\n\nRemember: English only, no Korean text.";

            var body = java.util.Map.of(
                    "model", "gpt-4o-mini",
                    "messages", java.util.List.of(
                            java.util.Map.of("role", "system", "content", systemPrompt),
                            java.util.Map.of("role", "user", "content", userPrompt)),
                    "max_tokens", 800,
                    "temperature", 0.1);

            var conn = (java.net.HttpURLConnection)
                    new java.net.URL("https://api.openai.com/v1/chat/completions").openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setRequestProperty("Authorization", "Bearer " + openAiApiKey);
            conn.setDoOutput(true);
            conn.getOutputStream().write(mapper.writeValueAsBytes(body));

            int responseCode = conn.getResponseCode();
            if (responseCode != 200) {
                String errorBody = new String(conn.getErrorStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                log.error("[Diagram] OpenAI error {}: {}", responseCode, errorBody);
                return buildFallbackDiagram(type);
            }

            String raw = new String(conn.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            var res = mapper.readTree(raw);
            String code = res.path("choices").get(0).path("message").path("content").asText().trim();

            code = code.replaceAll("(?s)^```(?:mermaid)?\\s*", "").replaceAll("\\s*```$", "").trim();
            code = code.replaceAll("[\\uAC00-\\uD7A3]+", "");
            code = code.replaceAll("fa:fa-[a-zA-Z0-9_-]+\\s*", "");
            code = code.replaceAll("[→➜➡⟶⇒]", "->");
            code = code.replaceAll("\\(([^)]{0,30})\\)", "$1");

            log.info("[Diagram] Generated mermaid ({} chars)", code.length());
            return code;

        } catch (Exception e) {
            log.error("[Diagram] OpenAI call failed: {}", e.getMessage());
            return buildFallbackDiagram(type);
        }
    }

    private String buildFallbackDiagram(String type) {
        return switch (type) {
            case "sequence" -> """
                sequenceDiagram
                    participant U as User
                    participant A as API Server
                    participant D as Database
                    U->>A: HTTP Request
                    A->>D: Query
                    D-->>A: Result
                    A-->>U: JSON Response""";
            case "classDiagram" -> """
                classDiagram
                    class Service {
                        +create()
                        +update()
                        +delete()
                    }
                    class Repository {
                        +save()
                        +findById()
                    }
                    Service --> Repository""";
            case "erDiagram" -> """
                erDiagram
                    USER ||--o{ POST : creates
                    POST ||--o{ COMMENT : has
                    USER {
                        int id
                        string email
                        string name
                    }""";
            default -> """
                flowchart TD
                    U([User]) --> FE[Frontend]
                    FE --> API[API Server]
                    API --> AUTH[Auth]
                    API --> DB[(Database)]
                    API --> CACHE[(Cache)]""";
        };
    }
}
