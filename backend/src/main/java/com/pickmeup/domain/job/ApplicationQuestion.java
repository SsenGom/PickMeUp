package com.pickmeup.domain.job;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * 지원서 질문/답변 기록
 */
@Entity
@Table(name = "application_questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ApplicationQuestion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id", nullable = false)
    private JobApplication jobApplication;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;  // 질문

    @Column(columnDefinition = "TEXT")
    private String answer;  // 답변

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;  // 정렬 순서

    public void update(String question, String answer, Integer displayOrder) {
        this.question = question;
        this.answer = answer;
        this.displayOrder = displayOrder;
    }
}
