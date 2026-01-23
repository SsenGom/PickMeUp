package com.pickmeup.domain.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "ai_usages", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "usage_date"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AiUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    @Column(name = "question_count")
    @Builder.Default
    private Integer questionCount = 0;

    @Column(name = "feedback_count")
    @Builder.Default
    private Integer feedbackCount = 0;

    public void incrementQuestionCount() {
        this.questionCount++;
    }

    public void incrementFeedbackCount() {
        this.feedbackCount++;
    }

    public int getTotalCount() {
        return questionCount + feedbackCount;
    }
}
