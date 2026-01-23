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
    
    public void update(String title, String description, String startDate, String endDate,
                       String projectUrl, String githubUrl, String thumbnailUrl, 
                       List<String> techStacks, Boolean isFeatured) {
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.projectUrl = projectUrl;
        this.githubUrl = githubUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.techStacks = techStacks;
        this.isFeatured = isFeatured;
    }
    
    public void reorder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
