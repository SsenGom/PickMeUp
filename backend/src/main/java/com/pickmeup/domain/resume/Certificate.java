package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resume_certificates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Certificate extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;
    
    // 자격증명
    @Column(nullable = false, length = 100)
    private String name;
    
    // 발급기관
    @Column(name = "issuing_organization", length = 100)
    private String issuingOrganization;
    
    // 취득일
    @Column(name = "acquired_date", length = 10)
    private String acquiredDate;
    
    // 합격등급/점수
    @Column(length = 50)
    private String grade;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    public void update(String name, String issuingOrganization, 
                       String acquiredDate, String grade) {
        this.name = name;
        this.issuingOrganization = issuingOrganization;
        this.acquiredDate = acquiredDate;
        this.grade = grade;
    }
    
    public void setDisplayOrder(int order) {
        this.displayOrder = order;
    }
}
