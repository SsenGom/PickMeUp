package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import com.pickmeup.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resumes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Resume extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(length = 100)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "github_url", length = 200)
    private String githubUrl;
    
    @Column(name = "linkedin_url", length = 200)
    private String linkedinUrl;
    
    @Column(name = "blog_url", length = 200)
    private String blogUrl;
    
    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true;
    
    @Column(name = "slug", unique = true, length = 50)
    private String slug;
    
    @Column(name = "current_version")
    @Builder.Default
    private Integer currentVersion = 1;
    
    public void update(String title, String bio, String githubUrl, 
                       String linkedinUrl, String blogUrl) {
        this.title = title;
        this.bio = bio;
        this.githubUrl = githubUrl;
        this.linkedinUrl = linkedinUrl;
        this.blogUrl = blogUrl;
    }
    
    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    public void setSlug(String slug) {
        this.slug = slug;
    }
    
    public void incrementVersion() {
        this.currentVersion++;
    }
}
