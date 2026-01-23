package com.pickmeup.domain.mongo;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "resume_versions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ResumeVersion {
    
    @Id
    private String id;
    
    private Long resumeId;
    
    private Integer version;
    
    private String title;
    
    private String bio;
    
    private List<ExperienceSnapshot> experiences;
    
    private List<ProjectSnapshot> projects;
    
    private List<SkillSnapshot> skills;
    
    private String changeNote;
    
    private LocalDateTime createdAt;
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExperienceSnapshot {
        private String company;
        private String position;
        private String startDate;
        private String endDate;
        private Boolean isCurrent;
        private String description;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectSnapshot {
        private String title;
        private String description;
        private String startDate;
        private String endDate;
        private String projectUrl;
        private String githubUrl;
        private List<String> techStacks;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SkillSnapshot {
        private String name;
        private String category;
        private String level;
    }
}
