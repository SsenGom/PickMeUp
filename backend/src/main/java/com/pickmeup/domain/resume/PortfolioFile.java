package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * 포트폴리오 파일 엔티티
 * 
 * PDF, 이미지 등 포트폴리오 파일 관리
 * - PDF 포트폴리오
 * - 프로젝트 썸네일/스크린샷
 * - 외부 링크 (Notion, Figma, Behance 등)
 */
@Entity
@Table(name = "portfolio_files")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PortfolioFile extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;
    
    // 파일 타입
    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", length = 20, nullable = false)
    private PortfolioFileType fileType;
    
    // 표시 제목
    @Column(length = 100, nullable = false)
    private String title;
    
    // 설명
    @Column(length = 500)
    private String description;
    
    // 실제 파일 URL (S3 등)
    @Column(name = "file_url", length = 500)
    private String fileUrl;
    
    // 원본 파일명
    @Column(name = "original_filename", length = 200)
    private String originalFilename;
    
    // 파일 크기 (bytes)
    @Column(name = "file_size")
    private Long fileSize;
    
    // MIME 타입
    @Column(name = "mime_type", length = 100)
    private String mimeType;
    
    // 외부 링크 (Notion, Figma 등)
    @Column(name = "external_url", length = 500)
    private String externalUrl;
    
    // 썸네일 URL
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    
    // 공개 여부
    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true;
    
    // 대표 포트폴리오 여부
    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;
    
    // 정렬 순서
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    public void update(String title, String description, Boolean isPublic, Boolean isFeatured) {
        this.title = title;
        this.description = description;
        this.isPublic = isPublic;
        this.isFeatured = isFeatured;
    }
    
    public void setDisplayOrder(int order) {
        this.displayOrder = order;
    }
    
    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }
}
