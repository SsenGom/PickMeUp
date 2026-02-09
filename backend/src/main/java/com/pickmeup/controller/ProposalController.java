package com.pickmeup.controller;

import com.pickmeup.config.security.CurrentUser;
import com.pickmeup.domain.recruiter.ProposalStatus;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.common.ApiResponse;
import com.pickmeup.dto.recruiter.RecruiterDto.*;
import com.pickmeup.service.RecruiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 제안 관리 API (구직자용)
 */
@RestController
@RequestMapping("/api/proposals")
@RequiredArgsConstructor
public class ProposalController {

    private final RecruiterService recruiterService;

    /**
     * 받은 제안 목록
     * 
     * GET /api/proposals?status=PENDING
     */
    @GetMapping
    public ApiResponse<List<ProposalResponse>> getProposals(
            @CurrentUser User user,
            @RequestParam(required = false) ProposalStatus status) {
        return ApiResponse.success(recruiterService.getReceivedProposals(user, status));
    }

    /**
     * 제안 상세 조회
     * 
     * GET /api/proposals/{proposalId}
     */
    @GetMapping("/{proposalId}")
    public ApiResponse<ProposalResponse> getProposal(
            @CurrentUser User user,
            @PathVariable Long proposalId) {
        // TODO: 상세 조회 메서드 추가
        return ApiResponse.success(null);
    }

    /**
     * 제안 수락
     * 
     * POST /api/proposals/{proposalId}/accept
     */
    @PostMapping("/{proposalId}/accept")
    public ApiResponse<ProposalResponse> acceptProposal(
            @CurrentUser User user,
            @PathVariable Long proposalId) {
        return ApiResponse.success(recruiterService.acceptProposal(user, proposalId));
    }

    /**
     * 제안 거절
     * 
     * POST /api/proposals/{proposalId}/reject
     */
    @PostMapping("/{proposalId}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rejectProposal(
            @CurrentUser User user,
            @PathVariable Long proposalId,
            @RequestBody(required = false) ProposalResponseRequest request) {
        if (request == null) {
            request = new ProposalResponseRequest(null);
        }
        recruiterService.rejectProposal(user, proposalId, request);
    }

    /**
     * 내 이력서 픽 통계
     * 
     * GET /api/proposals/pick-stats
     */
    @GetMapping("/pick-stats")
    public ApiResponse<ResumePickStatsResponse> getPickStats(
            @CurrentUser User user) {
        return ApiResponse.success(recruiterService.getResumePickStats(user));
    }
}
