package com.pickmeup.domain.recruiter;

import com.pickmeup.domain.resume.Resume;
import com.pickmeup.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 이력서 픽 (헤드헌터가 구직자를 픽)
 * 
 * Tinder for Jobs - 헤드헌터가 공개 이력서를 보고 "Pick!"
 */
@Entity
@Table(name = "resume_picks", indexes = {
    @Index(name = "idx_recruiter_id", columnList = "recruiter_id"),
    @Index(name = "idx_resume_id", columnList = "resume_id"),
    @Index(name = "idx_picked_at", columnList = "picked_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ResumePick {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 누가 픽했는지 (헤드헌터/리크루터)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;
    
    /**
     * 어떤 이력서를 픽했는지
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;
    
    /**
     * 픽 당시 메모 (선택)
     * "개발 경력 좋음", "포트폴리오 인상적" 등
     */
    @Column(length = 500)
    private String memo;
    
    /**
     * 픽 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PickStatus status = PickStatus.PICKED;
    
    /**
     * 픽한 시간
     */
    @CreationTimestamp
    @Column(name = "picked_at", nullable = false, updatable = false)
    private LocalDateTime pickedAt;
    
    /**
     * 컨택한 시간 (제안 보낸 시간)
     */
    @Column(name = "contacted_at")
    private LocalDateTime contactedAt;
    
    /**
     * 컨택 방법
     */
    @Column(length = 50)
    private String contactMethod;  // PROPOSAL, DIRECT_MESSAGE
    
    // ==================== 비즈니스 로직 ====================
    
    /**
     * 컨택 기록
     */
    public void recordContact(String method) {
        this.contactedAt = LocalDateTime.now();
        this.contactMethod = method;
        this.status = PickStatus.CONTACTED;
    }
    
    /**
     * 패스 처리
     */
    public void markAsRejected() {
        this.status = PickStatus.REJECTED;
    }
    
    /**
     * 메모 수정
     */
    public void updateMemo(String memo) {
        this.memo = memo;
    }
}
