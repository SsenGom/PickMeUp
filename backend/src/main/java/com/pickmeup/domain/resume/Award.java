package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resume_awards")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Award extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;
    
    // 수상명
    @Column(nullable = false, length = 100)
    private String name;
    
    // 수여기관
    @Column(name = "organization", length = 100)
    private String organization;
    
    // 수상일
    @Column(name = "awarded_date", length = 10)
    private String awardedDate;
    
    // 상세내용
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    public void update(String name, String organization, 
                       String awardedDate, String description) {
        this.name = name;
        this.organization = organization;
        this.awardedDate = awardedDate;
        this.description = description;
    }
    
    public void setDisplayOrder(int order) {
        this.displayOrder = order;
    }
}
