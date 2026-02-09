package com.pickmeup.service;

import com.pickmeup.domain.message.Thread;
import com.pickmeup.domain.recruiter.ContactProposal;
import com.pickmeup.domain.recruiter.PickStatus;
import com.pickmeup.domain.recruiter.ProposalStatus;
import com.pickmeup.domain.recruiter.ResumePick;
import com.pickmeup.domain.resume.Resume;
import com.pickmeup.domain.user.User;
import com.pickmeup.domain.user.UserType;
import com.pickmeup.dto.recruiter.RecruiterDto.*;
import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import com.pickmeup.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 헤드헌터 기능 서비스
 * 
 * - 이력서 스와이프 피드
 * - Pick 관리
 * - 제안 발송 및 관리
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class RecruiterService {

    private final ResumeRepository resumeRepository;
    private final ResumePickRepository pickRepository;
    private final ContactProposalRepository proposalRepository;
    private final ThreadRepository threadRepository;
    private final MessageService messageService;

    // ==================== 이력서 피드 ====================

    /**
     * 공개 이력서 피드 조회 (스와이프용)
     * 
     * 알고리즘:
     * 1. 공개 설정된 이력서만
     * 2. 이미 픽한 이력서 제외
     * 3. 최신순 or 랜덤
     * 
     * 캐싱: 10분간 결과 캐시 (성능 최적화)
     */
    @org.springframework.cache.annotation.Cacheable(
        value = "resumeFeed",
        key = "#recruiter.id + '_' + #limit",
        unless = "#result.isEmpty()"
    )
    public List<ResumeFeedResponse> getResumeFeed(User recruiter, int limit) {
        // 헤드헌터 권한 체크
        if (!recruiter.isRecruiter()) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, "헤드헌터만 접근 가능합니다");
        }
        
        // 이미 픽한 이력서 ID 목록
        List<Long> pickedResumeIds = pickRepository.findPickedResumeIdsByRecruiter(recruiter);
        
        // 공개 이력서 중 픽하지 않은 것들 가져오기
        List<Resume> resumes = resumeRepository.findPublicResumesExcluding(
            pickedResumeIds, 
            PageRequest.of(0, limit)
        );
        
        return resumes.stream()
                .map(this::convertToFeedResponse)
                .collect(Collectors.toList());
    }
    
    private ResumeFeedResponse convertToFeedResponse(Resume resume) {
        // 경력 개월 수 계산
        int totalMonths = resume.getExperiences().stream()
                .mapToInt(exp -> {
                    try {
                        java.time.YearMonth start = java.time.YearMonth.parse(exp.getStartDate());
                        java.time.YearMonth end = exp.getEndDate() != null && !exp.getEndDate().isEmpty() 
                                ? java.time.YearMonth.parse(exp.getEndDate()) 
                                : java.time.YearMonth.now();
                        return (int) java.time.temporal.ChronoUnit.MONTHS.between(start, end);
                    } catch (Exception e) {
                        return 0;  // 파싱 실패 시 0
                    }
                })
                .sum();
        
        // 기술 스택 추출
        List<String> techStacks = resume.getSkills().stream()
                .map(s -> s.getName())
                .limit(10)
                .collect(Collectors.toList());
        
        // 경력 요약
        String experienceSummary = resume.getExperiences().isEmpty() ? "신입" :
                resume.getExperiences().get(0).getCompany() + " " + 
                (totalMonths / 12) + "년";
        
        // 학력 요약
        String educationSummary = resume.getEducations().isEmpty() ? "" :
                resume.getEducations().get(0).getSchoolName() + " " +
                resume.getEducations().get(0).getMajor();
        
        // 대표 프로젝트
        String featuredProject = resume.getProjects().isEmpty() ? "" :
                resume.getProjects().get(0).getTitle();
        
        return ResumeFeedResponse.builder()
                .resumeId(resume.getId())
                .userId(resume.getUser().getId())
                .name(resume.getUser().getName())
                .profileImageUrl(resume.getUser().getProfileImageUrl())
                .title(resume.getTitle())
                .bio(resume.getBio())
                .techStacks(techStacks)
                .keywords(List.of())  // TODO: 키워드 기능 추가 시
                .totalExperienceMonths(totalMonths)
                .experienceSummary(experienceSummary)
                .educationSummary(educationSummary)
                .featuredProject(featuredProject)
                .viewCount(Math.toIntExact(resume.getViewCount()))
                .pickCount(Math.toIntExact(pickRepository.countByResume(resume)))
                .publicUrl("/resume/" + resume.getSlug())
                .alreadyPicked(false)
                .build();
    }

    // ==================== Pick 관리 ====================

    /**
     * 이력서 Pick
     */
    @Transactional
    public PickResponse pickResume(User recruiter, Long resumeId, PickCreateRequest request) {
        if (!recruiter.isRecruiter()) {
            throw new BusinessException(ErrorCode.NOT_RECRUITER);
        }
        
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
        
        // 공개 이력서만 픽 가능
        if (!resume.getIsPublic()) {
            throw new BusinessException(ErrorCode.RESUME_NOT_PUBLIC);
        }
        
        // 중복 픽 방지
        if (pickRepository.existsByRecruiterAndResume(recruiter, resume)) {
            throw new BusinessException(ErrorCode.ALREADY_PICKED);
        }
        
        // 자기 자신은 픽 불가
        if (resume.getUser().getId().equals(recruiter.getId())) {
            throw new BusinessException(ErrorCode.CANNOT_PICK_OWN_RESUME);
        }
        
        ResumePick pick = ResumePick.builder()
                .recruiter(recruiter)
                .resume(resume)
                .memo(request.getMemo())
                .build();
        
        pickRepository.save(pick);
        
        // 구직자에게 실시간 알림 발송
        sendPickNotification(resume.getUser(), pick);
        
        log.info("Resume picked - recruiter: {}, resume: {}", recruiter.getId(), resumeId);
        
        return PickResponse.from(pick);
    }
    
    /**
     * 픽 알림 발송 (WebSocket)
     */
    private void sendPickNotification(User jobSeeker, ResumePick pick) {
        try {
            // TODO: WebSocket 알림 구현 시 주석 해제
            // messagingTemplate.convertAndSendToUser(
            //     jobSeeker.getId().toString(),
            //     "/queue/notifications",
            //     Map.of(
            //         "type", "PICKED",
            //         "title", "누군가 당신을 Pick 했어요! ✨",
            //         "message", "이력서가 주목받고 있습니다",
            //         "pickId", pick.getId()
            //     )
            // );
            
            log.info("Pick notification sent to user: {}", jobSeeker.getId());
        } catch (Exception e) {
            log.error("Failed to send pick notification", e);
            // 알림 실패해도 Pick은 저장됨
        }
    }
    
    /**
     * 내가 픽한 이력서 목록
     */
    public List<PickResponse> getMyPicks(User recruiter, PickStatus status) {
        if (!recruiter.isRecruiter()) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        List<ResumePick> picks = status == null ?
                pickRepository.findByRecruiterOrderByPickedAtDesc(recruiter) :
                pickRepository.findByRecruiterAndStatusOrderByPickedAtDesc(recruiter, status);
        
        return picks.stream()
                .map(PickResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * Pick 취소
     */
    @Transactional
    public void unpick(User recruiter, Long pickId) {
        ResumePick pick = pickRepository.findById(pickId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PICK_NOT_FOUND));
        
        if (!pick.getRecruiter().getId().equals(recruiter.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        pickRepository.delete(pick);
        log.info("Resume unpicked - pickId: {}", pickId);
    }

    // ==================== 제안 관리 ====================

    /**
     * 컨택 제안 보내기
     */
    @Transactional
    public ProposalResponse sendProposal(User recruiter, Long resumeId, ProposalCreateRequest request) {
        if (!recruiter.isRecruiter()) {
            throw new BusinessException(ErrorCode.NOT_RECRUITER);
        }
        
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
        
        User jobSeeker = resume.getUser();
        
        // Pick 기록 찾기 (있으면 연결)
        ResumePick pick = pickRepository.findByRecruiterAndResume(recruiter, resume)
                .orElse(null);
        
        // 회사명 자동 입력 (헤드헌터 프로필에서)
        String companyName = recruiter.getCompanyName() != null ? 
                recruiter.getCompanyName() : "익명 기업";
        
        ContactProposal proposal = ContactProposal.builder()
                .recruiter(recruiter)
                .jobSeeker(jobSeeker)
                .pick(pick)
                .companyName(companyName)
                .position(request.getPosition())
                .salaryRange(request.getSalaryRange())
                .location(request.getLocation())
                .workType(request.getWorkType())
                .message(request.getMessage())
                .expiresAt(LocalDateTime.now().plusDays(30))  // 30일 후 만료
                .build();
        
        proposalRepository.save(proposal);
        
        // Pick에 컨택 기록
        if (pick != null) {
            pick.recordContact("PROPOSAL");
        }
        
        // 구직자에게 제안 알림 발송
        sendProposalNotification(jobSeeker, proposal);
        
        log.info("Proposal sent - recruiter: {}, jobSeeker: {}", recruiter.getId(), jobSeeker.getId());
        
        return ProposalResponse.fromRecruiterView(proposal);
    }
    
    /**
     * 제안 알림 발송 (이메일 + WebSocket)
     */
    private void sendProposalNotification(User jobSeeker, ContactProposal proposal) {
        try {
            // TODO: 이메일 발송
            // messageService.sendProposalEmail(jobSeeker, proposal);
            
            // TODO: WebSocket 알림
            // messagingTemplate.convertAndSendToUser(
            //     jobSeeker.getId().toString(),
            //     "/queue/notifications",
            //     Map.of(
            //         "type", "PROPOSAL_RECEIVED",
            //         "title", proposal.getCompanyName() + "에서 면접 제안이 왔어요! 🎉",
            //         "message", proposal.getPosition() + " 포지션",
            //         "proposalId", proposal.getId()
            //     )
            // );
            
            log.info("Proposal notification sent to user: {}", jobSeeker.getId());
        } catch (Exception e) {
            log.error("Failed to send proposal notification", e);
        }
    }
    
    /**
     * 내가 보낸 제안 목록
     */
    public List<ProposalResponse> getMyProposals(User recruiter, ProposalStatus status) {
        if (!recruiter.isRecruiter()) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        List<ContactProposal> proposals = status == null ?
                proposalRepository.findByRecruiterOrderByProposedAtDesc(recruiter) :
                proposalRepository.findByRecruiterAndStatusOrderByProposedAtDesc(recruiter, status);
        
        return proposals.stream()
                .map(ProposalResponse::fromRecruiterView)
                .collect(Collectors.toList());
    }
    
    /**
     * 받은 제안 목록 (구직자용)
     */
    public List<ProposalResponse> getReceivedProposals(User jobSeeker, ProposalStatus status) {
        List<ContactProposal> proposals = status == null ?
                proposalRepository.findByJobSeekerOrderByProposedAtDesc(jobSeeker) :
                proposalRepository.findByJobSeekerAndStatusOrderByProposedAtDesc(jobSeeker, status);
        
        return proposals.stream()
                .map(ProposalResponse::fromJobSeekerView)
                .collect(Collectors.toList());
    }
    
    /**
     * 제안 수락 (구직자용)
     */
    @Transactional
    public ProposalResponse acceptProposal(User jobSeeker, Long proposalId) {
        ContactProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROPOSAL_NOT_FOUND));
        
        if (!proposal.getJobSeeker().getId().equals(jobSeeker.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new BusinessException(ErrorCode.PROPOSAL_ALREADY_RESPONDED);
        }
        
        if (proposal.isExpired()) {
            proposal.expire();
            throw new BusinessException(ErrorCode.PROPOSAL_EXPIRED);
        }
        
        // 1:1 채팅방 생성
        Thread thread = messageService.createProposalThread(proposal);
        
        // 제안 수락 처리
        proposal.accept(thread.getId());
        
        // TODO: 헤드헌터에게 알림 발송
        // messageService.sendProposalAcceptedEmail(proposal.getRecruiter(), proposal);
        // notificationService.notifyProposalAccepted(proposal.getRecruiter(), proposal);
        
        log.info("Proposal accepted - proposalId: {}, threadId: {}", proposalId, thread.getId());
        
        return ProposalResponse.fromJobSeekerView(proposal);
    }
    
    /**
     * 제안 거절 (구직자용)
     */
    @Transactional
    public void rejectProposal(User jobSeeker, Long proposalId, ProposalResponseRequest request) {
        ContactProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROPOSAL_NOT_FOUND));
        
        if (!proposal.getJobSeeker().getId().equals(jobSeeker.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new BusinessException(ErrorCode.PROPOSAL_ALREADY_RESPONDED);
        }
        
        proposal.reject(request.getResponseMessage());
        
        // TODO: 헤드헌터에게 알림 발송
        // notificationService.notifyProposalRejected(proposal.getRecruiter(), proposal);
        
        log.info("Proposal rejected - proposalId: {}", proposalId);
    }

    // ==================== 통계 ====================

    /**
     * 헤드헌터 통계
     */
    public RecruiterStatsResponse getRecruiterStats(User recruiter) {
        if (!recruiter.isRecruiter()) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        long totalPicks = pickRepository.countByRecruiter(recruiter);
        long pickedOnly = pickRepository.countByRecruiterAndStatus(recruiter, PickStatus.PICKED);
        long contacted = pickRepository.countByRecruiterAndStatus(recruiter, PickStatus.CONTACTED);
        long rejected = pickRepository.countByRecruiterAndStatus(recruiter, PickStatus.REJECTED);
        
        long totalProposals = proposalRepository.findByRecruiterOrderByProposedAtDesc(recruiter).size();
        long pending = proposalRepository.countByRecruiterAndStatus(recruiter, ProposalStatus.PENDING);
        long accepted = proposalRepository.countByRecruiterAndStatus(recruiter, ProposalStatus.ACCEPTED);
        long rejectedProposals = proposalRepository.countByRecruiterAndStatus(recruiter, ProposalStatus.REJECTED);
        
        double acceptanceRate = totalProposals > 0 ? (double) accepted / totalProposals * 100 : 0;
        double responseRate = totalProposals > 0 ? (double) (accepted + rejectedProposals) / totalProposals * 100 : 0;
        
        return RecruiterStatsResponse.builder()
                .totalPicks(totalPicks)
                .pickedOnly(pickedOnly)
                .contacted(contacted)
                .rejected(rejected)
                .totalProposals(totalProposals)
                .pendingProposals(pending)
                .acceptedProposals(accepted)
                .rejectedProposals(rejectedProposals)
                .proposalAcceptanceRate(acceptanceRate)
                .proposalResponseRate(responseRate)
                .build();
    }
    
    /**
     * 구직자 픽 통계 (이력서가 받은 픽)
     */
    public ResumePickStatsResponse getResumePickStats(User jobSeeker) {
        Resume resume = resumeRepository.findByUserIdWithDetails(jobSeeker.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND));
        
        long totalPicks = pickRepository.countByResume(resume);
        long thisWeekPicks = pickRepository.countByResumeAndPickedAtAfter(
            resume, 
            LocalDateTime.now().minusWeeks(1)
        );
        long thisMonthPicks = pickRepository.countByResumeAndPickedAtAfter(
            resume,
            LocalDateTime.now().minusMonths(1)
        );
        
        long totalProposals = proposalRepository.countByJobSeeker(jobSeeker);
        long pending = proposalRepository.countByJobSeekerAndProposedAtAfter(
            jobSeeker,
            LocalDateTime.now().minusMonths(1)
        );
        
        // 최근 픽한 회사들 (익명 처리)
        List<PickerInfo> recentPickers = pickRepository.findByResumeOrderByPickedAtDesc(resume)
                .stream()
                .limit(5)
                .map(pick -> PickerInfo.builder()
                        .companyName(pick.getRecruiter().getCompanyName() != null ? 
                                pick.getRecruiter().getCompanyName() : "익명 기업")
                        .pickedAt(pick.getPickedAt())
                        .build())
                .collect(Collectors.toList());
        
        return ResumePickStatsResponse.builder()
                .totalPicks(totalPicks)
                .thisWeekPicks(thisWeekPicks)
                .thisMonthPicks(thisMonthPicks)
                .totalProposals(totalProposals)
                .pendingProposals(pending)
                .acceptedProposals(0L)  // TODO
                .recentPickers(recentPickers)
                .build();
    }
}
