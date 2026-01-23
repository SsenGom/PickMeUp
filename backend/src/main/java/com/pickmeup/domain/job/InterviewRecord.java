package com.pickmeup.domain.job;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 면접 기록
 */
@Entity
@Table(name = "interview_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class InterviewRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id", nullable = false)
    private JobApplication jobApplication;

    @Column(nullable = false, length = 100)
    private String title;  // 면접 제목 (예: 1차 실무면접)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewType type;  // 면접 유형

    @Column(name = "interview_at")
    private LocalDateTime interviewAt;  // 면접 일시

    @Column(length = 200)
    private String location;  // 면접 장소

    @Column(columnDefinition = "TEXT")
    private String questions;  // 면접 질문들 (줄바꿈으로 구분)

    @Column(columnDefinition = "TEXT")
    private String answers;  // 내 답변들

    @Column(columnDefinition = "TEXT")
    private String feedback;  // 면접 후 피드백/느낀점

    @Column(name = "is_passed")
    private Boolean isPassed;  // 통과 여부

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    public void update(String title, InterviewType type, LocalDateTime interviewAt,
                       String location, String questions, String answers, 
                       String feedback, Boolean isPassed, Integer displayOrder) {
        this.title = title;
        this.type = type;
        this.interviewAt = interviewAt;
        this.location = location;
        this.questions = questions;
        this.answers = answers;
        this.feedback = feedback;
        this.isPassed = isPassed;
        this.displayOrder = displayOrder;
    }
}
