package com.pickmeup.domain.job;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_application_qnas")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class JobApplicationQna extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id", nullable = false)
    private JobApplication jobApplication;

    @Enumerated(EnumType.STRING)
    @Column(name = "qna_type", nullable = false)
    private QnaType qnaType;

    @Enumerated(EnumType.STRING)
    @Column(name = "qna_mode", nullable = false)
    @Builder.Default
    private QnaMode qnaMode = QnaMode.EXPECTED;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "my_answer", columnDefinition = "TEXT")
    private String myAnswer;

    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;

    @Column(name = "best_answer", columnDefinition = "TEXT")
    private String bestAnswer;

    @Column(name = "ai_generated")
    @Builder.Default
    private Boolean aiGenerated = false;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    public void update(String question, String myAnswer, Integer displayOrder) {
        this.question = question;
        this.myAnswer = myAnswer;
        this.displayOrder = displayOrder;
    }

    public void updateAiFeedback(String aiFeedback, String bestAnswer) {
        this.aiFeedback = aiFeedback;
        this.bestAnswer = bestAnswer;
    }
}
