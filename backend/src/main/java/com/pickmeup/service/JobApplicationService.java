package com.pickmeup.service;

import com.pickmeup.domain.calendar.CalendarEvent;
import com.pickmeup.domain.job.*;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.job.JobApplicationDto.*;
import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import com.pickmeup.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobApplicationEventRepository eventRepository;
    private final JobApplicationQnaRepository qnaRepository;
    private final JobApplicationFileRepository fileRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final FileStorageService fileStorageService;
    private final OpenAIService openAIService;
    private final CompanySearchService companySearchService;

    // ==================== Job Application CRUD ====================

    @Transactional
    public Response createApplication(User user, CreateRequest request) {
        JobApplication job = JobApplication.builder()
                .user(user)
                .companyName(request.getCompanyName())
                .position(request.getPosition())
                .jobType(request.getJobType())
                .status(request.getStatus() != null ? request.getStatus() : ApplicationStatus.INTERESTED)
                .salary(request.getSalary())
                .bonus(request.getBonus())
                .workHours(request.getWorkHours())
                .location(request.getLocation())
                .distance(request.getDistance())
                .jobPostingUrl(request.getJobPostingUrl())
                .notes(request.getNotes())
                .appliedAt(request.getAppliedAt())
                .deadlineAt(request.getDeadlineAt())
                .color(request.getColor() != null ? request.getColor() : "#3B82F6")
                .build();

        jobApplicationRepository.save(job);
        return Response.from(job);
    }

    public List<Response> getApplications(User user) {
        return jobApplicationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(Response::from).toList();
    }

    public List<Response> getApplicationsByStatus(User user, ApplicationStatus status) {
        return jobApplicationRepository.findByUserAndStatusOrderByCreatedAtDesc(user, status)
                .stream().map(Response::from).toList();
    }

    public DetailResponse getApplicationDetail(User user, Long id) {
        // 기본 정보 + qnas 조회
        JobApplication job = findWithAuthAndQnas(user, id);
        
        // events, files는 lazy loading으로 별도 조회 (Hibernate.initialize 대신 repository 사용)
        List<JobApplicationEvent> events = eventRepository.findByJobApplicationIdOrderByEventDateAsc(id);
        List<JobApplicationFile> files = fileRepository.findByJobApplicationIdOrderByCreatedAtDesc(id);
        
        return DetailResponse.from(job, events, files);
    }

    @Transactional
    public Response updateApplication(User user, Long id, UpdateRequest request) {
        JobApplication job = findWithAuth(user, id);

        job.update(
                request.getCompanyName() != null ? request.getCompanyName() : job.getCompanyName(),
                request.getPosition() != null ? request.getPosition() : job.getPosition(),
                request.getJobType() != null ? request.getJobType() : job.getJobType(),
                request.getStatus() != null ? request.getStatus() : job.getStatus(),
                request.getSalary() != null ? request.getSalary() : job.getSalary(),
                request.getBonus() != null ? request.getBonus() : job.getBonus(),
                request.getWorkHours() != null ? request.getWorkHours() : job.getWorkHours(),
                request.getLocation() != null ? request.getLocation() : job.getLocation(),
                request.getDistance() != null ? request.getDistance() : job.getDistance(),
                request.getJobPostingUrl() != null ? request.getJobPostingUrl() : job.getJobPostingUrl(),
                request.getNotes() != null ? request.getNotes() : job.getNotes(),
                request.getAppliedAt() != null ? request.getAppliedAt() : job.getAppliedAt(),
                request.getDeadlineAt() != null ? request.getDeadlineAt() : job.getDeadlineAt(),
                request.getColor() != null ? request.getColor() : job.getColor(),
                request.getJobDescription() != null ? request.getJobDescription() : job.getJobDescription(),
                request.getCompanyInfo() != null ? request.getCompanyInfo() : job.getCompanyInfo(),
                request.getRequiredSkills() != null ? request.getRequiredSkills() : job.getRequiredSkills(),
                request.getExperienceRequired() != null ? request.getExperienceRequired() : job.getExperienceRequired()
        );

        return Response.from(job);
    }

    // 채용공고 텍스트 저장
    @Transactional
    public DetailResponse saveJobDescription(User user, Long jobId, JobDescriptionRequest request) {
        JobApplication job = findWithAuth(user, jobId);
        job.updateJobDescription(request.getJobDescription());
        
        List<JobApplicationEvent> events = eventRepository.findByJobApplicationIdOrderByEventDateAsc(jobId);
        List<JobApplicationFile> files = fileRepository.findByJobApplicationIdOrderByCreatedAtDesc(jobId);
        
        return DetailResponse.from(job, events, files);
    }

    @Transactional
    public Response updateStatus(User user, Long id, StatusUpdateRequest request) {
        JobApplication job = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        if (!job.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        job.updateStatus(request.getStatus());
        return Response.from(job);
    }

    @Transactional
    public void deleteApplication(User user, Long id) {
        JobApplication job = findWithAuth(user, id);
        jobApplicationRepository.delete(job);
    }

    public StatsResponse getStats(User user) {
        return StatsResponse.builder()
                .total(jobApplicationRepository.findByUserOrderByCreatedAtDesc(user).size())
                .interested(jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.INTERESTED))
                .applied(jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.APPLIED))
                .documentPassed(jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.DOCUMENT_PASSED))
                .interviewing(
                        jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.FIRST_INTERVIEW) +
                        jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.SECOND_INTERVIEW)
                )
                .finalPassed(jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.FINAL_PASSED))
                .rejected(jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.REJECTED))
                .build();
    }

    // ==================== Event CRUD ====================

    @Transactional
    public EventResponse createEvent(User user, Long jobId, EventCreateRequest request) {
        JobApplication job = findWithAuth(user, jobId);

        JobApplicationEvent event = JobApplicationEvent.builder()
                .jobApplication(job)
                .eventType(request.getEventType())
                .eventDate(request.getEventDate())
                .location(request.getLocation())
                .notes(request.getNotes())
                .build();

        eventRepository.save(event);

        // 캘린더 연동
        if (request.isSyncToCalendar()) {
            CalendarEvent calendarEvent = CalendarEvent.builder()
                    .user(user)
                    .title("[" + job.getCompanyName() + "] " + getEventTypeLabel(request.getEventType()))
                    .description(request.getNotes())
                    .startAt(request.getEventDate())
                    .endAt(request.getEventDate().plusHours(2))
                    .isAllDay(false)
                    .location(request.getLocation())
                    .color(job.getColor())
                    .build();
            calendarEventRepository.save(calendarEvent);
            event.linkCalendarEvent(calendarEvent.getId());
        }

        return EventResponse.from(event);
    }

    @Transactional
    public EventResponse updateEvent(User user, Long jobId, Long eventId, EventUpdateRequest request) {
        findWithAuth(user, jobId); // 권한 체크
        
        JobApplicationEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));

        event.update(
                request.getEventType() != null ? request.getEventType() : event.getEventType(),
                request.getEventDate() != null ? request.getEventDate() : event.getEventDate(),
                request.getLocation() != null ? request.getLocation() : event.getLocation(),
                request.getNotes() != null ? request.getNotes() : event.getNotes()
        );

        return EventResponse.from(event);
    }

    @Transactional
    public void deleteEvent(User user, Long jobId, Long eventId) {
        findWithAuth(user, jobId);
        eventRepository.deleteById(eventId);
    }

    public List<EventResponse> getUpcomingEvents(User user) {
        return eventRepository.findUpcomingEvents(user, java.time.LocalDateTime.now())
                .stream().map(EventResponse::from).toList();
    }

    // ==================== QnA CRUD ====================

    @Transactional
    public QnaResponse createQna(User user, Long jobId, QnaCreateRequest request) {
        JobApplication job = findWithAuth(user, jobId);

        JobApplicationQna qna = JobApplicationQna.builder()
                .jobApplication(job)
                .qnaType(request.getQnaType())
                .qnaMode(request.getQnaMode() != null ? request.getQnaMode() : QnaMode.ACTUAL)
                .question(request.getQuestion())
                .myAnswer(request.getMyAnswer())
                .aiGenerated(request.getAiGenerated() != null ? request.getAiGenerated() : false)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();

        qnaRepository.save(qna);
        return QnaResponse.from(qna);
    }

    @Transactional
    public QnaResponse updateQna(User user, Long jobId, Long qnaId, QnaUpdateRequest request) {
        findWithAuth(user, jobId);

        JobApplicationQna qna = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        qna.update(
                request.getQuestion() != null ? request.getQuestion() : qna.getQuestion(),
                request.getMyAnswer() != null ? request.getMyAnswer() : qna.getMyAnswer(),
                request.getDisplayOrder() != null ? request.getDisplayOrder() : qna.getDisplayOrder()
        );

        // AI 피드백 업데이트
        if (request.getAiFeedback() != null || request.getBestAnswer() != null) {
            qna.updateAiFeedback(
                    request.getAiFeedback() != null ? request.getAiFeedback() : qna.getAiFeedback(),
                    request.getBestAnswer() != null ? request.getBestAnswer() : qna.getBestAnswer()
            );
        }

        return QnaResponse.from(qna);
    }

    @Transactional
    public void deleteQna(User user, Long jobId, Long qnaId) {
        findWithAuth(user, jobId);
        qnaRepository.deleteById(qnaId);
    }

    // ==================== File CRUD ====================

    @Transactional
    public FileResponse uploadFile(User user, Long jobId, MultipartFile file, 
                                   FileCategory category, String description) {
        JobApplication job = findWithAuth(user, jobId);

        String filePath = fileStorageService.store(file, "jobs/" + jobId);

        JobApplicationFile jobFile = JobApplicationFile.builder()
                .jobApplication(job)
                .fileCategory(category)
                .originalName(file.getOriginalFilename())
                .storedName(filePath.substring(filePath.lastIndexOf("/") + 1))
                .filePath(filePath)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .description(description)
                .build();

        fileRepository.save(jobFile);
        return FileResponse.from(jobFile);
    }

    public List<FileResponse> getFiles(User user, Long jobId, FileCategory category) {
        findWithAuth(user, jobId);
        
        if (category != null) {
            return fileRepository.findByJobApplicationIdAndFileCategoryOrderByCreatedAtDesc(jobId, category)
                    .stream().map(FileResponse::from).toList();
        }
        return fileRepository.findByJobApplicationIdOrderByCreatedAtDesc(jobId)
                .stream().map(FileResponse::from).toList();
    }

    public Pair<JobApplicationFile, Resource> downloadFile(User user, Long jobId, Long fileId) {
        findWithAuth(user, jobId);
        
        JobApplicationFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_FOUND));

        try {
            Resource resource = new UrlResource(fileStorageService.getFilePath(file.getFilePath()).toUri());
            if (!resource.exists()) {
                throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
            }
            return Pair.of(file, resource);
        } catch (MalformedURLException e) {
            throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
        }
    }

    @Transactional
    public void deleteFile(User user, Long jobId, Long fileId) {
        findWithAuth(user, jobId);
        
        JobApplicationFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_FOUND));

        fileStorageService.delete(file.getFilePath());
        fileRepository.delete(file);
    }

    // ==================== AI Features ====================

    @Transactional
    public GenerateQuestionsResponse generateAIQuestions(User user, Long jobId, GenerateQuestionsRequest request) {
        // 일일 사용량 체크 및 증가
        openAIService.checkAndIncrementUsage(user, AIUsageType.GENERATE_QUESTIONS.name());
        
        JobApplication job = findWithAuth(user, jobId);
        
        boolean isInterview = request.getQnaType() == QnaType.INTERVIEW;
        String jobType = job.getJobType() != null ? job.getJobType().name() : null;
        
        // 질문 + 모범답변 한번에 생성 (토큰 효율화)
        List<Map<String, String>> questionsWithAnswers = openAIService.generateQuestionsWithAnswers(
                job.getCompanyName(),
                job.getPosition(),
                jobType,
                job.getJobDescription(),
                job.getCompanyInfo(),
                job.getRequiredSkills(),
                job.getExperienceRequired(),
                isInterview
        );

        // 생성된 질문+답변을 DB에 저장 (최대 5개)
        List<String> questions = new ArrayList<>();
        int savedCount = 0;
        for (int i = 0; i < Math.min(questionsWithAnswers.size(), 5); i++) {
            Map<String, String> qa = questionsWithAnswers.get(i);
            String q = qa.get("question");
            String bestAnswer = qa.get("bestAnswer");
            
            if (q != null && !q.trim().isEmpty()) {
                JobApplicationQna qna = JobApplicationQna.builder()
                        .jobApplication(job)
                        .qnaType(request.getQnaType())
                        .qnaMode(QnaMode.EXPECTED)
                        .question(q.trim())
                        .bestAnswer(bestAnswer)  // 모범답변도 함께 저장
                        .aiGenerated(true)
                        .displayOrder(savedCount++)
                        .build();
                qnaRepository.save(qna);
                questions.add(q.trim());
            }
        }

        return GenerateQuestionsResponse.builder()
                .questions(questions)
                .build();
    }

    @Transactional
    public FeedbackResponse generateAIFeedback(User user, Long jobId, Long qnaId) {
        // 일일 사용량 체크 및 증가
        openAIService.checkAndIncrementUsage(user, AIUsageType.GENERATE_FEEDBACK.name());
        
        findWithAuth(user, jobId);
        
        JobApplicationQna qna = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 답변이 없으면 피드백 불가
        if (qna.getMyAnswer() == null || qna.getMyAnswer().trim().isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "답변을 먼저 작성해주세요.");
        }

        boolean isInterview = qna.getQnaType() == QnaType.INTERVIEW;
        
        Map<String, String> result = openAIService.generateFeedback(
                qna.getQuestion(),
                qna.getMyAnswer(),
                isInterview
        );

        // 피드백 저장
        qna.updateAiFeedback(result.get("feedback"), result.get("bestAnswer"));

        return FeedbackResponse.builder()
                .feedback(result.get("feedback"))
                .bestAnswer(result.get("bestAnswer"))
                .build();
    }

    public AIUsageResponse getAIUsageStatus(User user) {
        int questionsRemaining = openAIService.getRemainingUsage(user, AIUsageType.GENERATE_QUESTIONS);
        int feedbackRemaining = openAIService.getRemainingUsage(user, AIUsageType.GENERATE_FEEDBACK);
        
        return AIUsageResponse.builder()
                .questionsRemaining(questionsRemaining)
                .feedbackRemaining(feedbackRemaining)
                .dailyLimit(5)
                .build();
    }

    // 이미지에서 텍스트 추출 (OCR)
    @Transactional
    public ExtractTextResponse extractTextFromImage(User user, Long jobId, ExtractTextRequest request) {
        JobApplication job = findWithAuth(user, jobId);
        
        try {
            String extractedText;
            if (request.getBase64Image() != null && !request.getBase64Image().isEmpty()) {
                extractedText = openAIService.extractTextFromImage(request.getBase64Image());
            } else {
                return ExtractTextResponse.builder()
                        .success(false)
                        .extractedText("")
                        .build();
            }
            
            // 추출된 텍스트를 jobDescription에 저장
            if (extractedText != null && !extractedText.isEmpty()) {
                job.updateJobDescription(extractedText);
            }
            
            return ExtractTextResponse.builder()
                    .success(true)
                    .extractedText(extractedText)
                    .build();
        } catch (Exception e) {
            return ExtractTextResponse.builder()
                    .success(false)
                    .extractedText("")
                    .build();
        }
    }

    // 회사 정보 검색
    @Transactional
    public CompanyInfoResponse searchCompanyInfo(User user, Long jobId) {
        JobApplication job = findWithAuth(user, jobId);
        
        CompanyInfoResponse result = companySearchService.searchCompanyInfo(job.getCompanyName());
        
        // 검색 결과를 companyInfo에 저장
        StringBuilder companyInfoBuilder = new StringBuilder();
        if (result.getOverview() != null) {
            companyInfoBuilder.append("[회사 개요]\n").append(result.getOverview()).append("\n\n");
        }
        if (result.getRecentNews() != null) {
            companyInfoBuilder.append("[최근 뉴스]\n").append(result.getRecentNews()).append("\n\n");
        }
        if (result.getInterviewReviews() != null) {
            companyInfoBuilder.append("[면접 후기]\n").append(result.getInterviewReviews()).append("\n\n");
        }
        if (result.getSalaryInfo() != null) {
            companyInfoBuilder.append("[연봉 정보]\n").append(result.getSalaryInfo());
        }
        
        job.updateCompanyInfo(companyInfoBuilder.toString());
        
        return result;
    }

    // 채용공고 URL 크롤링
    @Transactional
    public CrawlJobPostingResponse crawlJobPosting(User user, Long jobId, CrawlJobPostingRequest request) {
        JobApplication job = findWithAuth(user, jobId);
        
        try {
            String content = companySearchService.crawlJobPosting(request.getUrl());
            
            // 크롤링 결과를 jobDescription에 저장
            job.updateJobDescription(content);
            
            // jobPostingUrl도 업데이트
            if (job.getJobPostingUrl() == null || job.getJobPostingUrl().isEmpty()) {
                job.update(
                    job.getCompanyName(), job.getPosition(), job.getJobType(),
                    job.getStatus(), job.getSalary(), job.getBonus(),
                    job.getWorkHours(), job.getLocation(), job.getDistance(),
                    request.getUrl(), job.getNotes(), job.getAppliedAt(),
                    job.getDeadlineAt(), job.getColor(),
                    content, job.getCompanyInfo(),
                    job.getRequiredSkills(), job.getExperienceRequired()
                );
            }
            
            return CrawlJobPostingResponse.builder()
                    .success(true)
                    .content(content)
                    .build();
        } catch (Exception e) {
            return CrawlJobPostingResponse.builder()
                    .success(false)
                    .content(e.getMessage())
                    .build();
        }
    }

    // ==================== Helper ====================

    private JobApplication findWithAuth(User user, Long id) {
        JobApplication job = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        if (!job.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        return job;
    }

    private JobApplication findWithAuthAndQnas(User user, Long id) {
        JobApplication job = jobApplicationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        if (!job.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        return job;
    }

    private String getEventTypeLabel(JobEventType type) {
        return switch (type) {
            case DEADLINE -> "서류 마감";
            case DOCUMENT_RESULT -> "서류 발표";
            case FIRST_INTERVIEW -> "1차 면접";
            case SECOND_INTERVIEW -> "2차 면접";
            case FINAL_INTERVIEW -> "최종 면접";
            case FINAL_RESULT -> "최종 발표";
            case ONBOARDING -> "입사일";
            case OTHER -> "기타";
        };
    }

    // ==================== 통계 ====================

    /**
     * 취업 활동 통계 조회
     */
    public com.pickmeup.dto.job.JobStatisticsDto.Response getStatistics(
            User user, 
            java.time.LocalDate startDate, 
            java.time.LocalDate endDate) {
        
        // 기간 설정 (없으면 전체)
        java.time.LocalDate start = startDate;
        java.time.LocalDate end = endDate != null ? endDate : java.time.LocalDate.now();
        
        // 전체 통계
        long totalApplications = start != null 
            ? jobApplicationRepository.countByUserAndDateRange(user, start, end)
            : jobApplicationRepository.countByUser(user);
        
        long activeApplications = jobApplicationRepository.countActiveApplications(user);
        long completedApplications = jobApplicationRepository.countCompletedApplications(user);
        
        java.time.LocalDate firstAppDate = jobApplicationRepository.findFirstApplicationDate(user);
        java.time.LocalDate lastAppDate = jobApplicationRepository.findLastApplicationDate(user);
        
        com.pickmeup.dto.job.JobStatisticsDto.OverallStats overallStats = 
            com.pickmeup.dto.job.JobStatisticsDto.OverallStats.builder()
                .totalApplications(totalApplications)
                .activeApplications(activeApplications)
                .completedApplications(completedApplications)
                .firstApplicationDate(firstAppDate)
                .lastApplicationDate(lastAppDate)
                .build();
        
        // 상태별 통계
        long interested = jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.INTERESTED);
        long applied = jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.APPLIED);
        long documentPassed = jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.DOCUMENT_PASSED);
        long firstInterview = jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.FIRST_INTERVIEW);
        long secondInterview = jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.SECOND_INTERVIEW);
        long finalPassed = jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.FINAL_PASSED);
        long rejected = jobApplicationRepository.countByUserAndStatus(user, ApplicationStatus.REJECTED);
        
        com.pickmeup.dto.job.JobStatisticsDto.StatusStats statusStats = 
            com.pickmeup.dto.job.JobStatisticsDto.StatusStats.builder()
                .interested(interested)
                .applied(applied)
                .documentPassed(documentPassed)
                .interviewing(firstInterview + secondInterview)
                .finalPassed(finalPassed)
                .rejected(rejected)
                .build();
        
        // 월별 추이
        List<Object[]> monthlyData = start != null
            ? jobApplicationRepository.findMonthlyStatsByDateRange(user, start, end)
            : jobApplicationRepository.findMonthlyStats(user);
        
        List<com.pickmeup.dto.job.JobStatisticsDto.MonthlyTrend> monthlyTrends = monthlyData.stream()
            .map(row -> com.pickmeup.dto.job.JobStatisticsDto.MonthlyTrend.builder()
                .month((String) row[0])
                .applicationCount(((Number) row[1]).longValue())
                .passedCount(((Number) row[2]).longValue())
                .rejectedCount(((Number) row[3]).longValue())
                .build())
            .toList();
        
        // 합격률 계산
        double documentPassRate = applied > 0 ? (double) documentPassed / applied * 100 : 0;
        double interviewPassRate = (firstInterview + secondInterview) > 0 
            ? (double) finalPassed / (firstInterview + secondInterview) * 100 : 0;
        double overallPassRate = applied > 0 ? (double) finalPassed / applied * 100 : 0;
        
        com.pickmeup.dto.job.JobStatisticsDto.SuccessRate successRate = 
            com.pickmeup.dto.job.JobStatisticsDto.SuccessRate.builder()
                .documentPassRate(documentPassRate)
                .interviewPassRate(interviewPassRate)
                .overallPassRate(overallPassRate)
                .totalApplied(applied)
                .documentPassed(documentPassed)
                .finalPassed(finalPassed)
                .build();
        
        // 평균 소요 시간 (현재는 null, 추후 구현 가능)
        com.pickmeup.dto.job.JobStatisticsDto.AverageTimeline averageTimeline = 
            com.pickmeup.dto.job.JobStatisticsDto.AverageTimeline.builder()
                .daysToDocumentResult(null)
                .daysToInterview(null)
                .daysToFinalResult(null)
                .totalDaysToComplete(null)
                .build();
        
        return com.pickmeup.dto.job.JobStatisticsDto.Response.builder()
                .overallStats(overallStats)
                .statusStats(statusStats)
                .monthlyTrends(monthlyTrends)
                .averageTimeline(averageTimeline)
                .successRate(successRate)
                .jobTypeStats(List.of())  // 추후 구현
                .build();
    }
}
