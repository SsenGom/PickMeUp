package com.pickmeup.dto.job;

import com.pickmeup.domain.job.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class JobApplicationDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "회사명은 필수입니다")
        private String companyName;
        private String position;
        private JobType jobType;
        private ApplicationStatus status;
        private String salary;
        private String bonus;
        private String workHours;
        private String location;
        private String distance;
        private String jobPostingUrl;
        private String notes;
        private LocalDate appliedAt;
        private LocalDateTime deadlineAt;
        private String color;
        private String jobDescription;
        private String requiredSkills;
        private String experienceRequired;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String companyName;
        private String position;
        private JobType jobType;
        private ApplicationStatus status;
        private String salary;
        private String bonus;
        private String workHours;
        private String location;
        private String distance;
        private String jobPostingUrl;
        private String notes;
        private LocalDate appliedAt;
        private LocalDateTime deadlineAt;
        private String color;
        private String jobDescription;
        private String companyInfo;
        private String requiredSkills;
        private String experienceRequired;
    }

    // 채용공고 텍스트 입력 요청
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobDescriptionRequest {
        private String jobDescription;  // 채용공고 텍스트 (복붙)
    }

    // 회사 정보 검색 요청
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanySearchRequest {
        private String companyName;
    }

    // 회사 정보 응답
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompanyInfoResponse {
        private String companyName;
        private String overview;          // 회사 개요
        private String industry;          // 업종
        private String employeeCount;     // 직원 수
        private String foundedYear;       // 설립연도
        private String recentNews;        // 최근 뉴스
        private String interviewReviews;  // 면접 후기 요약
        private String salaryInfo;        // 연봉 정보
        private String culture;           // 회사 문화
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private ApplicationStatus status;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String companyName;
        private String position;
        private JobType jobType;
        private ApplicationStatus status;
        private String salary;
        private String bonus;
        private String workHours;
        private String location;
        private String distance;
        private String jobPostingUrl;
        private String notes;
        private LocalDate appliedAt;
        private LocalDateTime deadlineAt;
        private String color;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(JobApplication job) {
            return Response.builder()
                    .id(job.getId())
                    .companyName(job.getCompanyName())
                    .position(job.getPosition())
                    .jobType(job.getJobType())
                    .status(job.getStatus())
                    .salary(job.getSalary())
                    .bonus(job.getBonus())
                    .workHours(job.getWorkHours())
                    .location(job.getLocation())
                    .distance(job.getDistance())
                    .jobPostingUrl(job.getJobPostingUrl())
                    .notes(job.getNotes())
                    .appliedAt(job.getAppliedAt())
                    .deadlineAt(job.getDeadlineAt())
                    .color(job.getColor())
                    .createdAt(job.getCreatedAt())
                    .updatedAt(job.getUpdatedAt())
                    .build();
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailResponse {
        private Long id;
        private String companyName;
        private String position;
        private JobType jobType;
        private ApplicationStatus status;
        private String salary;
        private String bonus;
        private String workHours;
        private String location;
        private String distance;
        private String jobPostingUrl;
        private String notes;
        private LocalDate appliedAt;
        private LocalDateTime deadlineAt;
        private String color;
        private String jobDescription;
        private String companyInfo;
        private String requiredSkills;
        private String experienceRequired;
        private List<EventResponse> events;
        private List<QnaResponse> qnas;
        private List<FileResponse> files;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static DetailResponse from(JobApplication job) {
            return DetailResponse.builder()
                    .id(job.getId())
                    .companyName(job.getCompanyName())
                    .position(job.getPosition())
                    .jobType(job.getJobType())
                    .status(job.getStatus())
                    .salary(job.getSalary())
                    .bonus(job.getBonus())
                    .workHours(job.getWorkHours())
                    .location(job.getLocation())
                    .distance(job.getDistance())
                    .jobPostingUrl(job.getJobPostingUrl())
                    .notes(job.getNotes())
                    .appliedAt(job.getAppliedAt())
                    .deadlineAt(job.getDeadlineAt())
                    .color(job.getColor())
                    .jobDescription(job.getJobDescription())
                    .companyInfo(job.getCompanyInfo())
                    .requiredSkills(job.getRequiredSkills())
                    .experienceRequired(job.getExperienceRequired())
                    .events(job.getEvents().stream().map(EventResponse::from).toList())
                    .qnas(job.getQnas().stream().map(QnaResponse::from).toList())
                    .files(job.getFiles().stream().map(FileResponse::from).toList())
                    .createdAt(job.getCreatedAt())
                    .updatedAt(job.getUpdatedAt())
                    .build();
        }

        public static DetailResponse from(JobApplication job, 
                                          List<JobApplicationEvent> events, 
                                          List<JobApplicationFile> files) {
            return DetailResponse.builder()
                    .id(job.getId())
                    .companyName(job.getCompanyName())
                    .position(job.getPosition())
                    .jobType(job.getJobType())
                    .status(job.getStatus())
                    .salary(job.getSalary())
                    .bonus(job.getBonus())
                    .workHours(job.getWorkHours())
                    .location(job.getLocation())
                    .distance(job.getDistance())
                    .jobPostingUrl(job.getJobPostingUrl())
                    .notes(job.getNotes())
                    .appliedAt(job.getAppliedAt())
                    .deadlineAt(job.getDeadlineAt())
                    .color(job.getColor())
                    .jobDescription(job.getJobDescription())
                    .companyInfo(job.getCompanyInfo())
                    .requiredSkills(job.getRequiredSkills())
                    .experienceRequired(job.getExperienceRequired())
                    .events(events.stream().map(EventResponse::from).toList())
                    .qnas(job.getQnas().stream().map(QnaResponse::from).toList())
                    .files(files.stream().map(FileResponse::from).toList())
                    .createdAt(job.getCreatedAt())
                    .updatedAt(job.getUpdatedAt())
                    .build();
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatsResponse {
        private long total;
        private long interested;
        private long applied;
        private long documentPassed;
        private long interviewing;
        private long finalPassed;
        private long rejected;
    }

    // Event DTOs
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventCreateRequest {
        private JobEventType eventType;
        private LocalDateTime eventDate;
        private String location;
        private String notes;
        private boolean syncToCalendar;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventUpdateRequest {
        private JobEventType eventType;
        private LocalDateTime eventDate;
        private String location;
        private String notes;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EventResponse {
        private Long id;
        private JobEventType eventType;
        private LocalDateTime eventDate;
        private String location;
        private String notes;
        private Long calendarEventId;
        private LocalDateTime createdAt;

        public static EventResponse from(JobApplicationEvent event) {
            return EventResponse.builder()
                    .id(event.getId())
                    .eventType(event.getEventType())
                    .eventDate(event.getEventDate())
                    .location(event.getLocation())
                    .notes(event.getNotes())
                    .calendarEventId(event.getCalendarEventId())
                    .createdAt(event.getCreatedAt())
                    .build();
        }
    }

    // QnA DTOs
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QnaCreateRequest {
        private QnaType qnaType;
        private QnaMode qnaMode;
        private String question;
        private String myAnswer;
        private Boolean aiGenerated;
        private Integer displayOrder;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QnaUpdateRequest {
        private String question;
        private String myAnswer;
        private String aiFeedback;
        private String bestAnswer;
        private Integer displayOrder;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QnaResponse {
        private Long id;
        private QnaType qnaType;
        private QnaMode qnaMode;
        private String question;
        private String myAnswer;
        private String aiFeedback;
        private String bestAnswer;
        private Boolean aiGenerated;
        private Integer displayOrder;
        private LocalDateTime createdAt;

        public static QnaResponse from(JobApplicationQna qna) {
            return QnaResponse.builder()
                    .id(qna.getId())
                    .qnaType(qna.getQnaType())
                    .qnaMode(qna.getQnaMode())
                    .question(qna.getQuestion())
                    .myAnswer(qna.getMyAnswer())
                    .aiFeedback(qna.getAiFeedback())
                    .bestAnswer(qna.getBestAnswer())
                    .aiGenerated(qna.getAiGenerated())
                    .displayOrder(qna.getDisplayOrder())
                    .createdAt(qna.getCreatedAt())
                    .build();
        }
    }

    // File DTOs
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FileResponse {
        private Long id;
        private FileCategory fileCategory;
        private String originalName;
        private String storedName;
        private Long fileSize;
        private String mimeType;
        private String description;
        private LocalDateTime createdAt;

        public static FileResponse from(JobApplicationFile file) {
            return FileResponse.builder()
                    .id(file.getId())
                    .fileCategory(file.getFileCategory())
                    .originalName(file.getOriginalName())
                    .storedName(file.getStoredName())
                    .fileSize(file.getFileSize())
                    .mimeType(file.getMimeType())
                    .description(file.getDescription())
                    .createdAt(file.getCreatedAt())
                    .build();
        }
    }

    // AI DTOs
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerateQuestionsRequest {
        private QnaType qnaType;  // DOCUMENT or INTERVIEW
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GenerateQuestionsResponse {
        private List<String> questions;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerateFeedbackRequest {
        private Long qnaId;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FeedbackResponse {
        private String feedback;
        private String bestAnswer;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AIUsageResponse {
        private int questionsRemaining;
        private int feedbackRemaining;
        private int dailyLimit;
    }

    // 이미지 텍스트 추출 요청
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExtractTextRequest {
        private String base64Image;  // Base64 인코딩된 이미지
        private String imageUrl;     // 또는 이미지 URL
    }

    // 이미지 텍스트 추출 응답
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExtractTextResponse {
        private String extractedText;
        private boolean success;
    }

    // 채용공고 URL 크롤링 요청
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CrawlJobPostingRequest {
        private String url;
    }

    // 채용공고 URL 크롤링 응답
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CrawlJobPostingResponse {
        private String content;
        private boolean success;
    }
}
