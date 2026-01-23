package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "experiences")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Experience extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;
    
    @Column(nullable = false, length = 100)
    private String company;
    
    @Column(nullable = false, length = 100)
    private String position;
    
    @Column(name = "start_date", nullable = false, length = 7)
    private String startDate;
    
    @Column(name = "end_date", length = 7)
    private String endDate;
    
    @Column(name = "is_current")
    @Builder.Default
    private Boolean isCurrent = false;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    public void update(String company, String position, String startDate, 
                       String endDate, Boolean isCurrent, String description) {
        this.company = company;
        this.position = position;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isCurrent = isCurrent;
        this.description = description;
    }
    
    public void reorder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
