package com.pickmeup.domain.recruiter;

import com.pickmeup.domain.common.BaseEntity;
import com.pickmeup.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

/**
 * 채용담당자의 면접 제안
 */
@Entity
@Table(name = "contact_proposals")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ContactProposal extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_seeker_id", nullable = false)
    private User jobSeeker;

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @Column(nullable = false, length = 100)
    private String position;

    @Column(name = "salary_range", length = 100)
    private String salaryRange;

    @Column(length = 200)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private ProposalStatus status = ProposalStatus.PENDING;

    public enum ProposalStatus {
        PENDING,   // 대기
        ACCEPTED,  // 수락
        REJECTED   // 거절
    }
}
