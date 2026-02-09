package com.pickmeup.dto.recruiter;

import com.pickmeup.domain.recruiter.PickStatus;
import com.pickmeup.domain.recruiter.ProposalStatus;
import com.pickmeup.domain.recruiter.ResumePick;
import com.pickmeup.domain.recruiter.ContactProposal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 헤드헌터 관련 DTO
 */
public class RecruiterDto {

    // ==================== 이력서 스와이프 피드 ====================
    
    /**
     * 이력서 피드 응답 (스와이프용 간소화 버전)
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResumeFeedResponse {
        private Long resumeId;
        private Long userId;
        private String name;
        private String profileImageUrl;
        
        // 핵심 정보
        private String title;                   // "3년차 백엔드 개발자"
        private String bio;                     // 한줄 소개
        private List<String> techStacks;        // ["Java", "Spring", "AWS"]
        private List<String> keywords;          // ["빠른 성장", "스타트업"]
        
        // 경력 요약
        private Integer totalExperienceMonths;  // 36개월 (3년)
        private String experienceSummary;       // "카카오 3년"
        
        // 학력
        private String educationSummary;        // "서울대 컴퓨터공학과"
        
        // 프로젝트 대표작
        private String featuredProject;         // "대규모 트래픽 처리 시스템 구축"
        
        // 통계
        private Integer viewCount;              // 조회수
        private Integer pickCount;              // 픽 받은 횟수
        
        // 공개 URL
        private String publicUrl;               // "/resume/john-doe"
        
        // 픽 여부
        private Boolean alreadyPicked;          // 이미 픽했는지
    }
    
    // ==================== Pick 관련 ====================
    
    /**
     * Pick 생성 요청
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PickCreateRequest {
        private String memo;  // 선택
    }
    
    /**
     * Pick 응답
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PickResponse {
        private Long id;
        private Long resumeId;
        private String name;
        private String title;
        private String profileImageUrl;
        private List<String> techStacks;
        private Integer experienceYears;
        private String memo;
        private PickStatus status;
        private LocalDateTime pickedAt;
        private LocalDateTime contactedAt;
        private String publicUrl;
        
        // 제안 정보 (있으면)
        private ProposalInfo proposal;
        
        public static PickResponse from(ResumePick pick) {
            var resume = pick.getResume();
            return PickResponse.builder()
                    .id(pick.getId())
                    .resumeId(resume.getId())
                    .name(resume.getUser().getName())
                    .title(resume.getTitle())
                    .profileImageUrl(resume.getUser().getProfileImageUrl())
                    .techStacks(resume.getSkills().stream()
                            .map(s -> s.getName())
                            .limit(5)
                            .collect(java.util.stream.Collectors.toList()))
                    .experienceYears(resume.getExperiences().stream()
                            .mapToInt(e -> {
                                try {
                                    java.time.YearMonth start = java.time.YearMonth.parse(e.getStartDate());
                                    java.time.YearMonth end = e.getEndDate() != null && !e.getEndDate().isEmpty()
                                            ? java.time.YearMonth.parse(e.getEndDate())
                                            : java.time.YearMonth.now();
                                    return (int) java.time.temporal.ChronoUnit.MONTHS.between(start, end) / 12;
                                } catch (Exception ex) {
                                    return 0;
                                }
                            })
                            .sum())
                    .memo(pick.getMemo())
                    .status(pick.getStatus())
                    .pickedAt(pick.getPickedAt())
                    .contactedAt(pick.getContactedAt())
                    .publicUrl("/resume/" + resume.getSlug())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProposalInfo {
        private Long proposalId;
        private ProposalStatus status;
        private LocalDateTime proposedAt;
        private Long threadId;  // 채팅방 ID (수락 시)
    }
    
    // ==================== 제안 관련 ====================
    
    /**
     * 제안 생성 요청
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProposalCreateRequest {
        private String position;          // 필수
        private String salaryRange;       // 선택
        private String location;          // 선택
        private String workType;          // 선택
        private String message;           // 필수
    }
    
    /**
     * 제안 응답
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProposalResponse {
        private Long id;
        private String companyName;
        private String position;
        private String salaryRange;
        private String location;
        private String workType;
        private String message;
        private ProposalStatus status;
        private LocalDateTime proposedAt;
        private LocalDateTime respondedAt;
        private String responseMessage;
        private LocalDateTime expiresAt;
        
        // 구직자 정보 (헤드헌터가 보낸 제안 조회 시)
        private JobSeekerInfo jobSeeker;
        
        // 헤드헌터 정보 (구직자가 받은 제안 조회 시)
        private RecruiterInfo recruiter;
        
        // 채팅방 ID (수락 시)
        private Long threadId;
        
        public static ProposalResponse fromRecruiterView(ContactProposal proposal) {
            return ProposalResponse.builder()
                    .id(proposal.getId())
                    .companyName(proposal.getCompanyName())
                    .position(proposal.getPosition())
                    .salaryRange(proposal.getSalaryRange())
                    .location(proposal.getLocation())
                    .workType(proposal.getWorkType())
                    .message(proposal.getMessage())
                    .status(proposal.getStatus())
                    .proposedAt(proposal.getProposedAt())
                    .respondedAt(proposal.getRespondedAt())
                    .responseMessage(proposal.getResponseMessage())
                    .expiresAt(proposal.getExpiresAt())
                    .threadId(proposal.getThreadId())
                    .jobSeeker(JobSeekerInfo.builder()
                            .userId(proposal.getJobSeeker().getId())
                            .name(proposal.getJobSeeker().getName())
                            .email(proposal.getJobSeeker().getEmail())
                            .profileImageUrl(proposal.getJobSeeker().getProfileImageUrl())
                            .build())
                    .build();
        }
        
        public static ProposalResponse fromJobSeekerView(ContactProposal proposal) {
            return ProposalResponse.builder()
                    .id(proposal.getId())
                    .companyName(proposal.getCompanyName())
                    .position(proposal.getPosition())
                    .salaryRange(proposal.getSalaryRange())
                    .location(proposal.getLocation())
                    .workType(proposal.getWorkType())
                    .message(proposal.getMessage())
                    .status(proposal.getStatus())
                    .proposedAt(proposal.getProposedAt())
                    .respondedAt(proposal.getRespondedAt())
                    .expiresAt(proposal.getExpiresAt())
                    .threadId(proposal.getThreadId())
                    .recruiter(RecruiterInfo.builder()
                            .companyName(proposal.getRecruiter().getCompanyName())
                            .position(proposal.getRecruiter().getPosition())
                            .build())
                    .build();
        }
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobSeekerInfo {
        private Long userId;
        private String name;
        private String email;
        private String profileImageUrl;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecruiterInfo {
        private String companyName;
        private String position;
        // 개인 정보는 숨김 (이메일, 이름 등)
    }
    
    /**
     * 제안 응답 요청 (수락/거절)
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProposalResponseRequest {
        private String responseMessage;  // 거절 시 사유 (선택)
    }
    
    // ==================== 통계 ====================
    
    /**
     * 헤드헌터 통계
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecruiterStatsResponse {
        // Pick 통계
        private Long totalPicks;
        private Long pickedOnly;          // 픽만 한 것
        private Long contacted;           // 컨택한 것
        private Long rejected;            // 패스한 것
        
        // 제안 통계
        private Long totalProposals;
        private Long pendingProposals;
        private Long acceptedProposals;
        private Long rejectedProposals;
        
        // 성공률
        private Double proposalAcceptanceRate;  // 수락률
        private Double proposalResponseRate;    // 응답률
    }
    
    /**
     * 구직자 픽 통계 (이력서가 받은 픽)
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResumePickStatsResponse {
        private Long totalPicks;
        private Long thisWeekPicks;
        private Long thisMonthPicks;
        
        // 제안 통계
        private Long totalProposals;
        private Long pendingProposals;
        private Long acceptedProposals;
        
        // 최근 픽한 회사들 (개인정보 보호)
        private List<PickerInfo> recentPickers;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PickerInfo {
        private String companyName;      // "카카오"
        private LocalDateTime pickedAt;  // 언제
        // 헤드헌터 개인정보는 숨김
    }
}
