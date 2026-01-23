package com.pickmeup.dto.resume;

import com.pickmeup.domain.resume.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

public class ResumeDto {
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String title;
        private String bio;
        private String githubUrl;
        private String linkedinUrl;
        private String blogUrl;
        private String slug;
        private Boolean isPublic;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String email;
        private String profileImageUrl;
        private String title;
        private String bio;
        private String githubUrl;
        private String linkedinUrl;
        private String blogUrl;
        private String slug;
        private Boolean isPublic;
        private List<ExperienceResponse> experiences;
        private List<ProjectResponse> projects;
        private List<SkillResponse> skills;
        
        public static Response from(Resume resume, 
                                    List<Experience> experiences,
                                    List<Project> projects,
                                    List<Skill> skills) {
            return Response.builder()
                    .id(resume.getId())
                    .name(resume.getUser().getName())
                    .email(resume.getUser().getEmail())
                    .profileImageUrl(resume.getUser().getProfileImageUrl())
                    .title(resume.getTitle())
                    .bio(resume.getBio())
                    .githubUrl(resume.getGithubUrl())
                    .linkedinUrl(resume.getLinkedinUrl())
                    .blogUrl(resume.getBlogUrl())
                    .slug(resume.getSlug())
                    .isPublic(resume.getIsPublic())
                    .experiences(experiences.stream().map(ExperienceResponse::from).toList())
                    .projects(projects.stream().map(ProjectResponse::from).toList())
                    .skills(skills.stream().map(SkillResponse::from).toList())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExperienceCreateRequest {
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
    public static class ProjectCreateRequest {
        @NotBlank
        private String title;
        private String description;
        private String startDate;
        private String endDate;
        private String projectUrl;
        private String githubUrl;
        private String thumbnailUrl;
        private List<String> techStacks;
        private Boolean isFeatured = false;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectResponse {
        private Long id;
        private String title;
        private String description;
        private String startDate;
        private String endDate;
        private String projectUrl;
        private String githubUrl;
        private String thumbnailUrl;
        private List<String> techStacks;
        private Boolean isFeatured;
        private Integer displayOrder;
        
        public static ProjectResponse from(Project project) {
            return ProjectResponse.builder()
                    .id(project.getId())
                    .title(project.getTitle())
                    .description(project.getDescription())
                    .startDate(project.getStartDate())
                    .endDate(project.getEndDate())
                    .projectUrl(project.getProjectUrl())
                    .githubUrl(project.getGithubUrl())
                    .thumbnailUrl(project.getThumbnailUrl())
                    .techStacks(project.getTechStacks())
                    .isFeatured(project.getIsFeatured())
                    .displayOrder(project.getDisplayOrder())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillCreateRequest {
        @NotBlank
        private String name;
        private String category;
        private SkillLevel level = SkillLevel.INTERMEDIATE;
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
}
