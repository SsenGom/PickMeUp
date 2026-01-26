package com.pickmeup.dto.resume;

import com.pickmeup.domain.resume.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

public class ResumeDto {
    
    // ==================== Request DTOs ====================
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateBasicInfoRequest {
        private String name;
        private String email;
        private String phone;
        private String birthDate;
        private String gender;
        private String address;
        private String profileImageUrl;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateLinksRequest {
        private String githubUrl;
        private String linkedinUrl;
        private String blogUrl;
        private String portfolioUrl;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateFreeContentRequest {
        private String title;
        private String bio;
        private String freeContent;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateSettingsRequest {
        private ResumeType resumeType;
        private Boolean isPublic;
        private String slug;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EducationRequest {
        @NotBlank
        private String schoolName;
        private String major;
        private EducationLevel level;
        private String startDate;
        private String endDate;
        private GraduationStatus graduationStatus;
        private String gpa;
        private String maxGpa;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExperienceRequest {
        @NotBlank
        private String company;
        @NotBlank
        private String position;
        @NotBlank
        private String startDate;
        private String endDate;
        private Boolean isCurrent = false;
        private String description;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectRequest {
        @NotBlank
        private String title;
        private String description;
        private String detailContent;
        private String role;
        private Integer teamSize;
        private String achievements;
        private String startDate;
        private String endDate;
        private String projectUrl;
        private String githubUrl;
        private String demoUrl;
        private String thumbnailUrl;
        private String screenshots;
        private List<String> techStacks;
        private Boolean isFeatured = false;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillRequest {
        @NotBlank
        private String name;
        private String category;
        private SkillLevel level = SkillLevel.INTERMEDIATE;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificateRequest {
        @NotBlank
        private String name;
        private String issuingOrganization;
        private String acquiredDate;
        private String grade;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LanguageRequest {
        @NotBlank
        private String name;
        private String testName;
        private String score;
        private String acquiredDate;
        private LanguageLevel speakingLevel;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AwardRequest {
        @NotBlank
        private String name;
        private String organization;
        private String awardedDate;
        private String description;
    }
    
    // ==================== Response DTOs ====================
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private ResumeType resumeType;
        private String title;
        
        // 기본 정보
        private String name;
        private String email;
        private String phone;
        private String birthDate;
        private String gender;
        private String address;
        private String profileImageUrl;
        
        // 자유양식 전용
        private String bio;
        private String freeContent;
        
        // 링크
        private String githubUrl;
        private String linkedinUrl;
        private String blogUrl;
        private String portfolioUrl;
        
        // 설정
        private String slug;
        private Boolean isPublic;
        
        // 사람인 양식 섹션들
        private List<EducationResponse> educations;
        private List<ExperienceResponse> experiences;
        private List<ProjectResponse> projects;
        private List<SkillResponse> skills;
        private List<CertificateResponse> certificates;
        private List<LanguageResponse> languages;
        private List<AwardResponse> awards;
        
        public static Response from(Resume resume,
                                    List<Education> educations,
                                    List<Experience> experiences,
                                    List<Project> projects,
                                    List<Skill> skills,
                                    List<Certificate> certificates,
                                    List<Language> languages,
                                    List<Award> awards) {
            return Response.builder()
                    .id(resume.getId())
                    .resumeType(resume.getResumeType())
                    .title(resume.getTitle())
                    .name(resume.getName() != null ? resume.getName() : resume.getUser().getName())
                    .email(resume.getEmail() != null ? resume.getEmail() : resume.getUser().getEmail())
                    .phone(resume.getPhone())
                    .birthDate(resume.getBirthDate())
                    .gender(resume.getGender())
                    .address(resume.getAddress())
                    .profileImageUrl(resume.getProfileImageUrl() != null ? resume.getProfileImageUrl() : resume.getUser().getProfileImageUrl())
                    .bio(resume.getBio())
                    .freeContent(resume.getFreeContent())
                    .githubUrl(resume.getGithubUrl())
                    .linkedinUrl(resume.getLinkedinUrl())
                    .blogUrl(resume.getBlogUrl())
                    .portfolioUrl(resume.getPortfolioUrl())
                    .slug(resume.getSlug())
                    .isPublic(resume.getIsPublic())
                    .educations(educations.stream().map(EducationResponse::from).toList())
                    .experiences(experiences.stream().map(ExperienceResponse::from).toList())
                    .projects(projects.stream().map(ProjectResponse::from).toList())
                    .skills(skills.stream().map(SkillResponse::from).toList())
                    .certificates(certificates.stream().map(CertificateResponse::from).toList())
                    .languages(languages.stream().map(LanguageResponse::from).toList())
                    .awards(awards.stream().map(AwardResponse::from).toList())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PublicResponse {
        private ResumeType resumeType;
        private String title;
        private String name;
        private String email;
        private String profileImageUrl;
        private String bio;
        private String freeContent;
        private String githubUrl;
        private String linkedinUrl;
        private String blogUrl;
        private String portfolioUrl;
        private List<EducationResponse> educations;
        private List<ExperienceResponse> experiences;
        private List<ProjectResponse> projects;
        private List<SkillResponse> skills;
        private List<CertificateResponse> certificates;
        private List<LanguageResponse> languages;
        private List<AwardResponse> awards;
        
        public static PublicResponse from(Resume resume,
                                          List<Education> educations,
                                          List<Experience> experiences,
                                          List<Project> projects,
                                          List<Skill> skills,
                                          List<Certificate> certificates,
                                          List<Language> languages,
                                          List<Award> awards) {
            return PublicResponse.builder()
                    .resumeType(resume.getResumeType())
                    .title(resume.getTitle())
                    .name(resume.getName() != null ? resume.getName() : resume.getUser().getName())
                    .email(resume.getEmail())
                    .profileImageUrl(resume.getProfileImageUrl() != null ? resume.getProfileImageUrl() : resume.getUser().getProfileImageUrl())
                    .bio(resume.getBio())
                    .freeContent(resume.getFreeContent())
                    .githubUrl(resume.getGithubUrl())
                    .linkedinUrl(resume.getLinkedinUrl())
                    .blogUrl(resume.getBlogUrl())
                    .portfolioUrl(resume.getPortfolioUrl())
                    .educations(educations.stream().map(EducationResponse::from).toList())
                    .experiences(experiences.stream().map(ExperienceResponse::from).toList())
                    .projects(projects.stream().map(ProjectResponse::from).toList())
                    .skills(skills.stream().map(SkillResponse::from).toList())
                    .certificates(certificates.stream().map(CertificateResponse::from).toList())
                    .languages(languages.stream().map(LanguageResponse::from).toList())
                    .awards(awards.stream().map(AwardResponse::from).toList())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EducationResponse {
        private Long id;
        private String schoolName;
        private String major;
        private EducationLevel level;
        private String startDate;
        private String endDate;
        private GraduationStatus graduationStatus;
        private String gpa;
        private String maxGpa;
        private Integer displayOrder;
        
        public static EducationResponse from(Education education) {
            return EducationResponse.builder()
                    .id(education.getId())
                    .schoolName(education.getSchoolName())
                    .major(education.getMajor())
                    .level(education.getLevel())
                    .startDate(education.getStartDate())
                    .endDate(education.getEndDate())
                    .graduationStatus(education.getGraduationStatus())
                    .gpa(education.getGpa())
                    .maxGpa(education.getMaxGpa())
                    .displayOrder(education.getDisplayOrder())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExperienceResponse {
        private Long id;
        private String company;
        private String position;
        private String startDate;
        private String endDate;
        private Boolean isCurrent;
        private String description;
        private Integer displayOrder;
        
        public static ExperienceResponse from(Experience experience) {
            return ExperienceResponse.builder()
                    .id(experience.getId())
                    .company(experience.getCompany())
                    .position(experience.getPosition())
                    .startDate(experience.getStartDate())
                    .endDate(experience.getEndDate())
                    .isCurrent(experience.getIsCurrent())
                    .description(experience.getDescription())
                    .displayOrder(experience.getDisplayOrder())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectResponse {
        private Long id;
        private String title;
        private String description;
        private String detailContent;
        private String role;
        private Integer teamSize;
        private String achievements;
        private String startDate;
        private String endDate;
        private String projectUrl;
        private String githubUrl;
        private String demoUrl;
        private String thumbnailUrl;
        private String screenshots;
        private List<String> techStacks;
        private Boolean isFeatured;
        private Integer displayOrder;
        
        public static ProjectResponse from(Project project) {
            return ProjectResponse.builder()
                    .id(project.getId())
                    .title(project.getTitle())
                    .description(project.getDescription())
                    .detailContent(project.getDetailContent())
                    .role(project.getRole())
                    .teamSize(project.getTeamSize())
                    .achievements(project.getAchievements())
                    .startDate(project.getStartDate())
                    .endDate(project.getEndDate())
                    .projectUrl(project.getProjectUrl())
                    .githubUrl(project.getGithubUrl())
                    .demoUrl(project.getDemoUrl())
                    .thumbnailUrl(project.getThumbnailUrl())
                    .screenshots(project.getScreenshots())
                    .techStacks(project.getTechStacks())
                    .isFeatured(project.getIsFeatured())
                    .displayOrder(project.getDisplayOrder())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SkillResponse {
        private Long id;
        private String name;
        private String category;
        private SkillLevel level;
        private Integer displayOrder;
        
        public static SkillResponse from(Skill skill) {
            return SkillResponse.builder()
                    .id(skill.getId())
                    .name(skill.getName())
                    .category(skill.getCategory())
                    .level(skill.getLevel())
                    .displayOrder(skill.getDisplayOrder())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CertificateResponse {
        private Long id;
        private String name;
        private String issuingOrganization;
        private String acquiredDate;
        private String grade;
        private Integer displayOrder;
        
        public static CertificateResponse from(Certificate certificate) {
            return CertificateResponse.builder()
                    .id(certificate.getId())
                    .name(certificate.getName())
                    .issuingOrganization(certificate.getIssuingOrganization())
                    .acquiredDate(certificate.getAcquiredDate())
                    .grade(certificate.getGrade())
                    .displayOrder(certificate.getDisplayOrder())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LanguageResponse {
        private Long id;
        private String name;
        private String testName;
        private String score;
        private String acquiredDate;
        private LanguageLevel speakingLevel;
        private Integer displayOrder;
        
        public static LanguageResponse from(Language language) {
            return LanguageResponse.builder()
                    .id(language.getId())
                    .name(language.getName())
                    .testName(language.getTestName())
                    .score(language.getScore())
                    .acquiredDate(language.getAcquiredDate())
                    .speakingLevel(language.getSpeakingLevel())
                    .displayOrder(language.getDisplayOrder())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AwardResponse {
        private Long id;
        private String name;
        private String organization;
        private String awardedDate;
        private String description;
        private Integer displayOrder;
        
        public static AwardResponse from(Award award) {
            return AwardResponse.builder()
                    .id(award.getId())
                    .name(award.getName())
                    .organization(award.getOrganization())
                    .awardedDate(award.getAwardedDate())
                    .description(award.getDescription())
                    .displayOrder(award.getDisplayOrder())
                    .build();
        }
    }
    
    // ==================== CoverLetter DTOs ====================
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverLetterRequest {
        @NotBlank
        private String title;
        private String targetCompany;
        private String content;
        private Boolean isPublic;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoverLetterResponse {
        private Long id;
        private String title;
        private String targetCompany;
        private String content;
        private Boolean isPublic;
        private Boolean isDefault;
        private Integer displayOrder;
        private String createdAt;
        private String updatedAt;
        
        public static CoverLetterResponse from(CoverLetter coverLetter) {
            return CoverLetterResponse.builder()
                    .id(coverLetter.getId())
                    .title(coverLetter.getTitle())
                    .targetCompany(coverLetter.getTargetCompany())
                    .content(coverLetter.getContent())
                    .isPublic(coverLetter.getIsPublic())
                    .isDefault(coverLetter.getIsDefault())
                    .displayOrder(coverLetter.getDisplayOrder())
                    .createdAt(coverLetter.getCreatedAt() != null ? coverLetter.getCreatedAt().toString() : null)
                    .updatedAt(coverLetter.getUpdatedAt() != null ? coverLetter.getUpdatedAt().toString() : null)
                    .build();
        }
    }
    
    // ==================== PortfolioFile DTOs ====================
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PortfolioFileRequest {
        private PortfolioFileType fileType;
        @NotBlank
        private String title;
        private String description;
        private String externalUrl;
        private String thumbnailUrl;
        private Boolean isPublic;
        private Boolean isFeatured;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PortfolioFileResponse {
        private Long id;
        private PortfolioFileType fileType;
        private String title;
        private String description;
        private String fileUrl;
        private String originalFilename;
        private Long fileSize;
        private String mimeType;
        private String externalUrl;
        private String thumbnailUrl;
        private Boolean isPublic;
        private Boolean isFeatured;
        private Integer displayOrder;
        private String createdAt;
        
        public static PortfolioFileResponse from(PortfolioFile portfolioFile) {
            return PortfolioFileResponse.builder()
                    .id(portfolioFile.getId())
                    .fileType(portfolioFile.getFileType())
                    .title(portfolioFile.getTitle())
                    .description(portfolioFile.getDescription())
                    .fileUrl(portfolioFile.getFileUrl())
                    .originalFilename(portfolioFile.getOriginalFilename())
                    .fileSize(portfolioFile.getFileSize())
                    .mimeType(portfolioFile.getMimeType())
                    .externalUrl(portfolioFile.getExternalUrl())
                    .thumbnailUrl(portfolioFile.getThumbnailUrl())
                    .isPublic(portfolioFile.getIsPublic())
                    .isFeatured(portfolioFile.getIsFeatured())
                    .displayOrder(portfolioFile.getDisplayOrder())
                    .createdAt(portfolioFile.getCreatedAt() != null ? portfolioFile.getCreatedAt().toString() : null)
                    .build();
        }
    }
    
    // ==================== View Stats DTOs ====================
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ViewStatsResponse {
        private Long totalViews;
        private Long last30DaysViews;
        private List<DailyViewStat> dailyViews;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyViewStat {
        private java.sql.Date date;
        private Long count;
    }
}
