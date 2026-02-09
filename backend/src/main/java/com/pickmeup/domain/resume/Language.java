package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resume_languages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Language extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;
    
    // 언어명 (영어, 일본어, 중국어 등)
    @Column(nullable = false, length = 50)
    private String name;
    
    // 시험명 (TOEIC, TOEFL, JLPT 등)
    @Column(name = "test_name", length = 50)
    private String testName;
    
    // 점수/등급
    @Column(length = 50)
    private String score;
    
    // 취득일
    @Column(name = "acquired_date", length = 10)
    private String acquiredDate;
    
    // 회화능력 (상/중/하)
    @Enumerated(EnumType.STRING)
    @Column(name = "speaking_level", length = 20)
    private LanguageLevel speakingLevel;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    public void update(String name, String testName, String score, 
                       String acquiredDate, LanguageLevel speakingLevel) {
        this.name = name;
        this.testName = testName;
        this.score = score;
        this.acquiredDate = acquiredDate;
        this.speakingLevel = speakingLevel;
    }
    
    public void setDisplayOrder(int order) {
        this.displayOrder = order;
    }
}
