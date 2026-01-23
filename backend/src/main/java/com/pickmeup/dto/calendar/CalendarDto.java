package com.pickmeup.dto.calendar;

import com.pickmeup.domain.calendar.CalendarEvent;
import com.pickmeup.domain.calendar.RecurrenceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class CalendarDto {
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "제목은 필수입니다")
        private String title;
        private String description;
        @NotNull(message = "시작 시간은 필수입니다")
        private LocalDateTime startAt;
        @NotNull(message = "종료 시간은 필수입니다")
        private LocalDateTime endAt;
        private Boolean isAllDay = false;
        private String location;
        private String color = "#3B82F6";
        private RecurrenceType recurrenceType;
        private Integer recurrenceInterval;
        private LocalDateTime recurrenceEndAt;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String title;
        private String description;
        private LocalDateTime startAt;
        private LocalDateTime endAt;
        private Boolean isAllDay;
        private String location;
        private String color;
        private RecurrenceType recurrenceType;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private LocalDateTime startAt;
        private LocalDateTime endAt;
        private Boolean isAllDay;
        private String location;
        private String color;
        private RecurrenceType recurrenceType;
        private Integer recurrenceInterval;
        private LocalDateTime recurrenceEndAt;
        private Long parentEventId;
        private LocalDateTime createdAt;
        
        public static Response from(CalendarEvent event) {
            return Response.builder()
                    .id(event.getId())
                    .title(event.getTitle())
                    .description(event.getDescription())
                    .startAt(event.getStartAt())
                    .endAt(event.getEndAt())
                    .isAllDay(event.getIsAllDay())
                    .location(event.getLocation())
                    .color(event.getColor())
                    .recurrenceType(event.getRecurrenceType())
                    .recurrenceInterval(event.getRecurrenceInterval())
                    .recurrenceEndAt(event.getRecurrenceEndAt())
                    .parentEventId(event.getParentEventId())
                    .createdAt(event.getCreatedAt())
                    .build();
        }
    }
}
