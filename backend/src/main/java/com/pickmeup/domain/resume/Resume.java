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
    
    // 이력서 형식: FREE(자유양식), SARAMIN(사람인 방식)
    @Enumerated(EnumType.STRING)
    @Column(name = "resume_type", length = 20)
    @Builder.Default
    private ResumeType resumeType = ResumeType.SARAMIN;
    
    @Column(length = 100)
    private String title;
    
    // ========== 공통 기본 정보 ==========
    @Column(length = 50)
    private String name;
    
    @Column(length = 100)
    private String email;
    
    @Column(length = 20)
    private String phone;
    
    @Column(name = "birth_date", length = 20)
    private String birthDate;
    
    @Column(length = 10)
    private String gender;
    
    @Column(length = 200)
    private String address;
    
    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;
    
    // ========== 자유양식 전용 ==========
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    // 자유양식 본문 (마크다운 또는 HTML)
    @Column(name = "free_content", columnDefinition = "LONGTEXT")
    private String freeContent;
    
    // ========== 사람인 양식 전용 ==========
    // 학력, 경력, 자격증 등은 별도 테이블로 관리
    
    // ========== 링크 정보 ==========
    @Column(name = "github_url", length = 200)
    private String githubUrl;
    
    @Column(name = "linkedin_url", length = 200)
    private String linkedinUrl;
    
    @Column(name = "blog_url", length = 200)
    private String blogUrl;
    
    @Column(name = "portfolio_url", length = 200)
    private String portfolioUrl;
    
    // ========== 공개 설정 ==========
    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = false;
    
    @Column(name = "slug", unique = true, length = 50)
    private String slug;
    
    @Column(name = "current_version")
    @Builder.Default
    private Integer currentVersion = 1;
    
    // ========== 추가 공개 설정 ==========
    // 비밀번호 보호 (선택)
    @Column(name = "access_password", length = 100)
    private String accessPassword;
    
    // 공개 범위: PUBLIC(전체), LINK_ONLY(링크만), PRIVATE(비공개)
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", length = 20)
    @Builder.Default
    private ResumeVisibility visibility = ResumeVisibility.PRIVATE;
    
    // 연락처 공개 여부
    @Column(name = "show_contact")
    @Builder.Default
    private Boolean showContact = true;
    
    // 조회수
    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L;
    
    // ========== 한줄 소개 / 헤드라인 ==========
    @Column(length = 200)
    private String headline;
    
    // ========== 소셜/추가 링크 ==========
    @Column(name = "notion_url", length = 200)
    private String notionUrl;
    
    @Column(name = "figma_url", length = 200)
    private String figmaUrl;
    
    @Column(name = "behance_url", length = 200)
    private String behanceUrl;
    
    @Column(name = "dribbble_url", length = 200)
    private String dribbbleUrl;
    
    @Column(name = "youtube_url", length = 200)
    private String youtubeUrl;
    
    public void updateBasicInfo(String name, String email, String phone, 
                                 String birthDate, String gender, String address,
                                 String profileImageUrl, String bio) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.birthDate = birthDate;
        this.gender = gender;
        this.address = address;
        this.profileImageUrl = profileImageUrl;
        this.bio = bio;
    }
    
    public void updateLinks(String githubUrl, String linkedinUrl, 
                            String blogUrl, String portfolioUrl) {
        this.githubUrl = githubUrl;
        this.linkedinUrl = linkedinUrl;
        this.blogUrl = blogUrl;
        this.portfolioUrl = portfolioUrl;
    }
    
    public void updateFreeContent(String title, String bio, String freeContent) {
        this.title = title;
        this.bio = bio;
        this.freeContent = freeContent;
    }
    
    public void setResumeType(ResumeType resumeType) {
        this.resumeType = resumeType;
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
    
    public void incrementViewCount() {
        this.viewCount++;
    }
    
    public void updateVisibility(ResumeVisibility visibility, String accessPassword) {
        this.visibility = visibility;
        this.accessPassword = accessPassword;
    }
    
    public void updateHeadline(String headline) {
        this.headline = headline;
    }
    
    public void updateAllLinks(String githubUrl, String linkedinUrl, String blogUrl, 
                               String portfolioUrl, String notionUrl, String figmaUrl,
                               String behanceUrl, String dribbbleUrl, String youtubeUrl) {
        this.githubUrl = githubUrl;
        this.linkedinUrl = linkedinUrl;
        this.blogUrl = blogUrl;
        this.portfolioUrl = portfolioUrl;
        this.notionUrl = notionUrl;
        this.figmaUrl = figmaUrl;
        this.behanceUrl = behanceUrl;
        this.dribbbleUrl = dribbbleUrl;
        this.youtubeUrl = youtubeUrl;
    }
    
    public void setShowContact(boolean showContact) {
        this.showContact = showContact;
    }
}
