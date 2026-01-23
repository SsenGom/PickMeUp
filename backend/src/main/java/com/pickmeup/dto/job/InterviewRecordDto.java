package com.pickmeup.dto.job;

import com.pickmeup.domain.job.InterviewRecord;
import com.pickmeup.domain.job.InterviewType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class InterviewRecordDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "면접 제목은 필수입니다")
        private String title;
        @NotNull(message = "면접 유형은 필수입니다")
        private InterviewType type;
        private LocalDateTime interviewAt;
        private String location;
        private String questions;
        private String answers;
        private String feedback;
        private Boolean isPassed;
        private Integer displayOrder;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String title;
        private InterviewType type;
        private LocalDateTime interviewAt;
        private String location;
        private String questions;
        private String answers;
        private String feedback;
        private Boolean isPassed;
        private Integer displayOrder;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private InterviewType type;
        private LocalDateTime interviewAt;
        private String location;
        private String questions;
        private String answers;
        private String feedback;
        private Boolean isPassed;
        private Integer displayOrder;
        private LocalDateTime createdAt;

        public static Response from(InterviewRecord entity) {
            return Response.builder()
                    .id(entity.getId())
                    .title(entity.getTitle())
                    .type(entity.getType())
                    .interviewAt(entity.getInterviewAt())
                    .location(entity.getLocation())
                    .questions(entity.getQuestions())
                    .answers(entity.getAnswers())
                    .feedback(entity.getFeedback())
                    .isPassed(entity.getIsPassed())
                    .displayOrder(entity.getDisplayOrder())
                    .createdAt(entity.getCreatedAt())
                    .build();
        }
    }
}
