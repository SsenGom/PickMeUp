package com.pickmeup.controller;

import com.pickmeup.config.security.CurrentUser;
import com.pickmeup.domain.recruiter.PickStatus;
import com.pickmeup.domain.recruiter.ProposalStatus;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.common.ApiResponse;
import com.pickmeup.dto.recruiter.RecruiterDto.*;
import com.pickmeup.service.RecruiterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 헤드헌터 API
 * 
 * 헤드헌터 전용 기능:
 * - 이력서 스와이프 피드
 * - Pick 관리
 * - 컨택 제안 발송
 */
@Tag(name = "Recruiter", description = "헤드헌터 API")
@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
public class RecruiterController {

    private final RecruiterService recruiterService;

    // ==================== 이력서 스와이프 피드 ====================

    /**
     * 공개 이력서 피드 조회
     * 
     * GET /api/recruiter/feed?limit=20
     * 
     * 알고리즘:
     * - 공개(isPublic=true) 이력서만 조회
     * - 이미 픽한 이력서 제외
     * - 최신순 정렬
     */
    @Operation(summary = "이력서 스와이프 피드", description = "공개 이력서 목록 조회 (픽한 이력서 제외)")
    @GetMapping("/feed")
    public ApiResponse<List<ResumeFeedResponse>> getResumeFeed(
            @CurrentUser User user,
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.success(recruiterService.getResumeFeed(user, limit));
    }

    // ==================== Pick 관리 ====================

    /**
     * 이력서 Pick
     * 
     * POST /api/recruiter/pick/{resumeId}
     */
    @Operation(summary = "이력서 Pick", description = "마음에 드는 이력서를 픽 (저장)")
    @PostMapping("/pick/{resumeId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PickResponse> pickResume(
            @CurrentUser User user,
            @PathVariable Long resumeId,
            @RequestBody(required = false) PickCreateRequest request) {
        if (request == null) {
            request = new PickCreateRequest(null);
        }
        return ApiResponse.success(recruiterService.pickResume(user, resumeId, request));
    }

    /**
     * 내가 픽한 이력서 목록
     * 
     * GET /api/recruiter/picks?status=PICKED
     */
    @GetMapping("/picks")
    public ApiResponse<List<PickResponse>> getMyPicks(
            @CurrentUser User user,
            @RequestParam(required = false) PickStatus status) {
        return ApiResponse.success(recruiterService.getMyPicks(user, status));
    }

    /**
     * Pick 취소
     * 
     * DELETE /api/recruiter/pick/{pickId}
     */
    @DeleteMapping("/pick/{pickId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unpick(
            @CurrentUser User user,
            @PathVariable Long pickId) {
        recruiterService.unpick(user, pickId);
    }

    // ==================== 제안 관리 (헤드헌터) ====================

    /**
     * 컨택 제안 보내기
     * 
     * POST /api/recruiter/proposal/{resumeId}
     */
    @PostMapping("/proposal/{resumeId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProposalResponse> sendProposal(
            @CurrentUser User user,
            @PathVariable Long resumeId,
            @RequestBody ProposalCreateRequest request) {
        return ApiResponse.success(recruiterService.sendProposal(user, resumeId, request));
    }

    /**
     * 내가 보낸 제안 목록
     * 
     * GET /api/recruiter/proposals?status=PENDING
     */
    @GetMapping("/proposals")
    public ApiResponse<List<ProposalResponse>> getMyProposals(
            @CurrentUser User user,
            @RequestParam(required = false) ProposalStatus status) {
        return ApiResponse.success(recruiterService.getMyProposals(user, status));
    }

    /**
     * 헤드헌터 통계
     * 
     * GET /api/recruiter/statistics
     */
    @GetMapping("/statistics")
    public ApiResponse<RecruiterStatsResponse> getStats(
            @CurrentUser User user) {
        return ApiResponse.success(recruiterService.getRecruiterStats(user));
    }
}
