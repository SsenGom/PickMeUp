package com.pickmeup.domain.recruiter;

import com.pickmeup.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 컨택 제안 (헤드헌터 → 구직자)
 * 
 * 헤드헌터가 구직자에게 보내는 면접/채용 제안서
 */
@Entity
@Table(name = "contact_proposals", indexes = {
    @Index(name = "idx_recruiter_id", columnList = "recruiter_id"),
    @Index(name = "idx_job_seeker_id", columnList = "job_seeker_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_proposed_at", columnList = "proposed_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ContactProposal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 누가 보냈는지 (헤드헌터)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;
    
    /**
     * 누구에게 (구직자)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_seeker_id", nullable = false)
    private User jobSeeker;
    
    /**
     * Pick 기록 (선택 - Pick 없이 바로 제안도 가능)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pick_id")
    private ResumePick pick;
    
    // ==================== 제안 내용 ====================
    
    /**
     * 회사명
     */
    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;
    
    /**
     * 포지션
     */
    @Column(nullable = false, length = 100)
    private String position;
    
    /**
     * 급여 범위
     */
    @Column(name = "salary_range", length = 100)
    private String salaryRange;
    
    /**
     * 근무지
     */
    @Column(length = 100)
    private String location;
    
    /**
     * 고용 형태 (정규직/계약직/인턴)
     */
    @Column(name = "work_type", length = 50)
    private String workType;
    
    /**
     * 제안 메시지
     */
    @Column(length = 2000, nullable = false)
    private String message;
    
    // ==================== 상태 관리 ====================
    
    /**
     * 제안 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProposalStatus status = ProposalStatus.PENDING;
    
    /**
     * 제안 발송 시간
     */
    @CreationTimestamp
    @Column(name = "proposed_at", nullable = false, updatable = false)
    private LocalDateTime proposedAt;
    
    /**
     * 응답 시간
     */
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
    
    /**
     * 구직자 응답 메시지 (거절 사유 등)
     */
    @Column(name = "response_message", length = 1000)
    private String responseMessage;
    
    /**
     * 만료 시간 (30일)
     */
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    /**
     * 채팅방 ID (수락 시 생성)
     */
    @Column(name = "thread_id")
    private Long threadId;
    
    // ==================== 비즈니스 로직 ====================
    
    /**
     * 제안 수락
     */
    public void accept(Long threadId) {
        this.status = ProposalStatus.ACCEPTED;
        this.respondedAt = LocalDateTime.now();
        this.threadId = threadId;
    }
    
    /**
     * 제안 거절
     */
    public void reject(String responseMessage) {
        this.status = ProposalStatus.REJECTED;
        this.respondedAt = LocalDateTime.now();
        this.responseMessage = responseMessage;
    }
    
    /**
     * 제안 만료
     */
    public void expire() {
        this.status = ProposalStatus.EXPIRED;
    }
    
    /**
     * 만료 여부 확인
     */
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    /**
     * Pick과 연결
     */
    public void linkPick(ResumePick pick) {
        this.pick = pick;
    }
}
