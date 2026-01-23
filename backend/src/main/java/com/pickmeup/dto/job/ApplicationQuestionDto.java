package com.pickmeup.dto.job;

import com.pickmeup.domain.job.ApplicationQuestion;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

public class ApplicationQuestionDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "질문은 필수입니다")
        private String question;
        private String answer;
        private Integer displayOrder;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String question;
        private String answer;
        private Integer displayOrder;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String question;
        private String answer;
        private Integer displayOrder;
        private LocalDateTime createdAt;

        public static Response from(ApplicationQuestion entity) {
            return Response.builder()
                    .id(entity.getId())
                    .question(entity.getQuestion())
                    .answer(entity.getAnswer())
                    .displayOrder(entity.getDisplayOrder())
                    .createdAt(entity.getCreatedAt())
                    .build();
        }
    }
}
