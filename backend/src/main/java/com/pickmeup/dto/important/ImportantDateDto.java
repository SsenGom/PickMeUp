package com.pickmeup.dto.important;

import com.pickmeup.domain.important.ImportantDate;
import com.pickmeup.domain.important.ImportantDateType;
import com.pickmeup.domain.notification.NotificationChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

public class ImportantDateDto {
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "제목은 필수입니다")
        private String title;
        private String description;
        @NotNull(message = "날짜는 필수입니다")
        private LocalDate targetDate;
        @NotNull(message = "유형은 필수입니다")
        private ImportantDateType type;
        private Boolean isRecurring = false;
        private String color = "#EF4444";
        private List<NotificationRuleRequest> notificationRules;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationRuleRequest {
        private Integer daysBefore;
        private LocalTime notifyTime;
        private NotificationChannel channel;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String title;
        private String description;
        private LocalDate targetDate;
        private ImportantDateType type;
        private Boolean isRecurring;
        private String color;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private LocalDate targetDate;
        private ImportantDateType type;
        private Boolean isRecurring;
        private String color;
        private Long daysRemaining;
        private LocalDate nextOccurrence;
        
        public static Response from(ImportantDate importantDate) {
            LocalDate nextOccurrence = importantDate.getNextOccurrence();
            long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), nextOccurrence);
            
            return Response.builder()
                    .id(importantDate.getId())
                    .title(importantDate.getTitle())
                    .description(importantDate.getDescription())
                    .targetDate(importantDate.getTargetDate())
                    .type(importantDate.getType())
                    .isRecurring(importantDate.getIsRecurring())
                    .color(importantDate.getColor())
                    .daysRemaining(daysRemaining)
                    .nextOccurrence(nextOccurrence)
                    .build();
        }
    }
}
