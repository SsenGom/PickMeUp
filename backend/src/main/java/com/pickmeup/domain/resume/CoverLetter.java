package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * 자기소개서 엔티티
 * 
 * 여러 버전의 자기소개서를 관리
 * - 회사별로 다른 자기소개서 작성 가능
 * - 공개/비공개 설정
 */
@Entity
@Table(name = "cover_letters")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CoverLetter extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;
    
    // 자기소개서 제목 (ex: "네이버용 자기소개서", "기본 자기소개서")
    @Column(length = 100, nullable = false)
    private String title;
    
    // 대상 회사명 (선택)
    @Column(name = "target_company", length = 100)
    private String targetCompany;
    
    // 자기소개서 본문 (HTML/Markdown)
    @Column(columnDefinition = "LONGTEXT")
    private String content;
    
    // 공개 여부 (공개 이력서에 포함할지)
    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = false;
    
    // 기본 자기소개서 여부
    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;
    
    // 정렬 순서
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    public void update(String title, String targetCompany, String content, Boolean isPublic) {
        this.title = title;
        this.targetCompany = targetCompany;
        this.content = content;
        this.isPublic = isPublic;
    }
    
    public void setDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }
    
    public void setDisplayOrder(int order) {
        this.displayOrder = order;
    }
}
