package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skills")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Skill extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;
    
    @Column(nullable = false, length = 50)
    private String name;
    
    @Column(length = 50)
    private String category;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SkillLevel level = SkillLevel.INTERMEDIATE;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    public void update(String name, String category, SkillLevel level) {
        this.name = name;
        this.category = category;
        this.level = level;
    }
    
    public void reorder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
