package com.pickmeup.repository;

import com.pickmeup.domain.recruiter.ContactProposal;
import com.pickmeup.domain.recruiter.ProposalStatus;
import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ContactProposalRepository extends JpaRepository<ContactProposal, Long> {

    /**
     * 헤드헌터가 보낸 제안 목록
     */
    List<ContactProposal> findByRecruiterOrderByProposedAtDesc(User recruiter);
    
    /**
     * 헤드헌터가 보낸 제안 목록 (상태별)
     */
    List<ContactProposal> findByRecruiterAndStatusOrderByProposedAtDesc(User recruiter, ProposalStatus status);
    
    /**
     * 구직자가 받은 제안 목록
     */
    List<ContactProposal> findByJobSeekerOrderByProposedAtDesc(User jobSeeker);
    
    /**
     * 구직자가 받은 제안 목록 (상태별)
     */
    List<ContactProposal> findByJobSeekerAndStatusOrderByProposedAtDesc(User jobSeeker, ProposalStatus status);
    
    /**
     * 헤드헌터의 상태별 제안 수
     */
    long countByRecruiterAndStatus(User recruiter, ProposalStatus status);
    
    /**
     * 구직자가 받은 제안 수
     */
    long countByJobSeeker(User jobSeeker);
    
    /**
     * 구직자가 기간 내 받은 제안 수
     */
    @Query("SELECT COUNT(p) FROM ContactProposal p WHERE p.jobSeeker = :jobSeeker AND p.proposedAt >= :since")
    long countByJobSeekerAndProposedAtAfter(@Param("jobSeeker") User jobSeeker, @Param("since") LocalDateTime since);
    
    /**
     * 만료된 제안 목록 (배치 처리용)
     */
    @Query("SELECT p FROM ContactProposal p WHERE p.status = 'PENDING' AND p.expiresAt < :now")
    List<ContactProposal> findExpiredProposals(@Param("now") LocalDateTime now);
    
    /**
     * 헤드헌터 → 구직자 제안 이력 확인
     */
    boolean existsByRecruiterAndJobSeeker(User recruiter, User jobSeeker);
}
