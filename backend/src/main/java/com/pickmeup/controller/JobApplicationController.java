package com.pickmeup.controller;

import com.pickmeup.config.security.CurrentUser;
import com.pickmeup.domain.job.ApplicationStatus;
import com.pickmeup.domain.job.FileCategory;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.common.ApiResponse;
import com.pickmeup.dto.job.JobApplicationDto.*;
import com.pickmeup.service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    // ==================== Job Application ====================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Response> createApplication(
            @CurrentUser User user,
            @Valid @RequestBody CreateRequest request) {
        return ApiResponse.success(jobApplicationService.createApplication(user, request));
    }

    @GetMapping
    public ApiResponse<List<Response>> getApplications(
            @CurrentUser User user,
            @RequestParam(required = false) ApplicationStatus status) {
        if (status != null) {
            return ApiResponse.success(jobApplicationService.getApplicationsByStatus(user, status));
        }
        return ApiResponse.success(jobApplicationService.getApplications(user));
    }

    @GetMapping("/{id}")
    public ApiResponse<DetailResponse> getApplicationDetail(
            @CurrentUser User user,
            @PathVariable Long id) {
        return ApiResponse.success(jobApplicationService.getApplicationDetail(user, id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Response> updateApplication(
            @CurrentUser User user,
            @PathVariable Long id,
            @RequestBody UpdateRequest request) {
        return ApiResponse.success(jobApplicationService.updateApplication(user, id, request));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<Response> updateStatus(
            @CurrentUser User user,
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        return ApiResponse.success(jobApplicationService.updateStatus(user, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteApplication(
            @CurrentUser User user,
            @PathVariable Long id) {
        jobApplicationService.deleteApplication(user, id);
    }

    @GetMapping("/stats")
    public ApiResponse<StatsResponse> getStats(@CurrentUser User user) {
        return ApiResponse.success(jobApplicationService.getStats(user));
    }

    // ==================== Events ====================

    @PostMapping("/{jobId}/events")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EventResponse> createEvent(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @RequestBody EventCreateRequest request) {
        return ApiResponse.success(jobApplicationService.createEvent(user, jobId, request));
    }

    @PutMapping("/{jobId}/events/{eventId}")
    public ApiResponse<EventResponse> updateEvent(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @PathVariable Long eventId,
            @RequestBody EventUpdateRequest request) {
        return ApiResponse.success(jobApplicationService.updateEvent(user, jobId, eventId, request));
    }

    @DeleteMapping("/{jobId}/events/{eventId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @PathVariable Long eventId) {
        jobApplicationService.deleteEvent(user, jobId, eventId);
    }

    @GetMapping("/events/upcoming")
    public ApiResponse<List<EventResponse>> getUpcomingEvents(@CurrentUser User user) {
        return ApiResponse.success(jobApplicationService.getUpcomingEvents(user));
    }

    // ==================== QnA ====================

    @PostMapping("/{jobId}/qnas")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<QnaResponse> createQna(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @RequestBody QnaCreateRequest request) {
        return ApiResponse.success(jobApplicationService.createQna(user, jobId, request));
    }

    @PutMapping("/{jobId}/qnas/{qnaId}")
    public ApiResponse<QnaResponse> updateQna(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @PathVariable Long qnaId,
            @RequestBody QnaUpdateRequest request) {
        return ApiResponse.success(jobApplicationService.updateQna(user, jobId, qnaId, request));
    }

    @DeleteMapping("/{jobId}/qnas/{qnaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQna(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @PathVariable Long qnaId) {
        jobApplicationService.deleteQna(user, jobId, qnaId);
    }

    // ==================== Files ====================

    @PostMapping("/{jobId}/files")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FileResponse> uploadFile(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") FileCategory category,
            @RequestParam(value = "description", required = false) String description) {
        return ApiResponse.success(jobApplicationService.uploadFile(user, jobId, file, category, description));
    }

    @GetMapping("/{jobId}/files")
    public ApiResponse<List<FileResponse>> getFiles(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @RequestParam(required = false) FileCategory category) {
        return ApiResponse.success(jobApplicationService.getFiles(user, jobId, category));
    }

    @GetMapping("/{jobId}/files/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @PathVariable Long fileId) {
        var result = jobApplicationService.downloadFile(user, jobId, fileId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(result.getFirst().getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + result.getFirst().getOriginalName() + "\"")
                .body(result.getSecond());
    }

    @DeleteMapping("/{jobId}/files/{fileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFile(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @PathVariable Long fileId) {
        jobApplicationService.deleteFile(user, jobId, fileId);
    }

    // ==================== AI ====================

    // 채용공고 텍스트 저장
    @PostMapping("/{jobId}/job-description")
    public ApiResponse<DetailResponse> saveJobDescription(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @RequestBody JobDescriptionRequest request) {
        return ApiResponse.success(jobApplicationService.saveJobDescription(user, jobId, request));
    }

    // 채용공고 URL 크롤링
    @PostMapping("/{jobId}/crawl-job-posting")
    public ApiResponse<CrawlJobPostingResponse> crawlJobPosting(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @RequestBody CrawlJobPostingRequest request) {
        return ApiResponse.success(jobApplicationService.crawlJobPosting(user, jobId, request));
    }

    // 이미지에서 텍스트 추출 (OCR)
    @PostMapping("/{jobId}/extract-text")
    public ApiResponse<ExtractTextResponse> extractTextFromImage(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @RequestBody ExtractTextRequest request) {
        return ApiResponse.success(jobApplicationService.extractTextFromImage(user, jobId, request));
    }

    // 회사 정보 검색
    @PostMapping("/{jobId}/search-company")
    public ApiResponse<CompanyInfoResponse> searchCompanyInfo(
            @CurrentUser User user,
            @PathVariable Long jobId) {
        return ApiResponse.success(jobApplicationService.searchCompanyInfo(user, jobId));
    }

    @PostMapping("/{jobId}/ai/generate-questions")
    public ApiResponse<GenerateQuestionsResponse> generateQuestions(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @RequestBody GenerateQuestionsRequest request) {
        return ApiResponse.success(jobApplicationService.generateAIQuestions(user, jobId, request));
    }

    @PostMapping("/{jobId}/ai/feedback/{qnaId}")
    public ApiResponse<FeedbackResponse> generateFeedback(
            @CurrentUser User user,
            @PathVariable Long jobId,
            @PathVariable Long qnaId) {
        return ApiResponse.success(jobApplicationService.generateAIFeedback(user, jobId, qnaId));
    }

    @GetMapping("/ai/usage")
    public ApiResponse<AIUsageResponse> getAIUsageStatus(@CurrentUser User user) {
        return ApiResponse.success(jobApplicationService.getAIUsageStatus(user));
    }
}
