package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Project extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;
    
    @Column(nullable = false, length = 100)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    // 프로젝트 상세 설명 (마크다운 - README 수준)
    @Column(name = "detail_content", columnDefinition = "LONGTEXT")
    private String detailContent;
    
    // 프로젝트 역할 (개인/팀, 본인 역할)
    @Column(length = 100)
    private String role;
    
    // 팀 규모
    @Column(name = "team_size")
    private Integer teamSize;
    
    // 주요 성과/결과
    @Column(columnDefinition = "TEXT")
    private String achievements;
    
    // 데모 영상 URL
    @Column(name = "demo_url", length = 500)
    private String demoUrl;
    
    // 스크린샷 URLs (JSON array)
    @Column(name = "screenshots", columnDefinition = "TEXT")
    private String screenshots;
    
    @Column(name = "start_date", length = 7)
    private String startDate;
    
    @Column(name = "end_date", length = 7)
    private String endDate;
    
    @Column(name = "project_url", length = 200)
    private String projectUrl;
    
    @Column(name = "github_url", length = 200)
    private String githubUrl;
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    
    @ElementCollection
    @CollectionTable(name = "project_tech_stacks", 
                     joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "tech_stack")
    @Builder.Default
    private List<String> techStacks = new ArrayList<>();
    
    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    public void update(String title, String description, String detailContent,
                       String role, Integer teamSize, String achievements,
                       String startDate, String endDate,
                       String projectUrl, String githubUrl, String demoUrl,
                       String thumbnailUrl, String screenshots,
                       List<String> techStacks, Boolean isFeatured) {
        this.title = title;
        this.description = description;
        this.detailContent = detailContent;
        this.role = role;
        this.teamSize = teamSize;
        this.achievements = achievements;
        this.startDate = startDate;
        this.endDate = endDate;
        this.projectUrl = projectUrl;
        this.githubUrl = githubUrl;
        this.demoUrl = demoUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.screenshots = screenshots;
        this.techStacks = techStacks;
        this.isFeatured = isFeatured;
    }
    
    public void reorder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
