package com.pickmeup.repository;

import com.pickmeup.domain.job.ApplicationStatus;
import com.pickmeup.domain.job.JobApplication;
import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserOrderByCreatedAtDesc(User user);

    List<JobApplication> findByUserAndStatusOrderByCreatedAtDesc(User user, ApplicationStatus status);

    @Query("SELECT DISTINCT j FROM JobApplication j LEFT JOIN FETCH j.qnas WHERE j.id = :id")
    Optional<JobApplication> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT DISTINCT j FROM JobApplication j LEFT JOIN FETCH j.events WHERE j.id = :id")
    Optional<JobApplication> findByIdWithEvents(@Param("id") Long id);

    @Query("SELECT DISTINCT j FROM JobApplication j LEFT JOIN FETCH j.files WHERE j.id = :id")
    Optional<JobApplication> findByIdWithFiles(@Param("id") Long id);

    @Query("SELECT j FROM JobApplication j WHERE j.user = :user AND j.status NOT IN ('FINAL_PASSED', 'REJECTED') ORDER BY j.deadlineAt ASC")
    List<JobApplication> findActiveApplications(@Param("user") User user);

    @Query("SELECT COUNT(j) FROM JobApplication j WHERE j.user = :user AND j.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") ApplicationStatus status);

    // ==================== 통계 쿼리 ====================
    
    /**
     * 전체 지원 수
     */
    long countByUser(User user);
    
    /**
     * 기간별 지원 수
     */
    @Query("SELECT COUNT(j) FROM JobApplication j WHERE j.user = :user " +
           "AND j.appliedAt >= :startDate AND j.appliedAt <= :endDate")
    long countByUserAndDateRange(
        @Param("user") User user, 
        @Param("startDate") java.time.LocalDate startDate,
        @Param("endDate") java.time.LocalDate endDate
    );
    
    /**
     * 월별 지원 현황
     * Object[]: [년월(String), 지원수(Long), 합격수(Long), 불합격수(Long)]
     */
    @Query("SELECT " +
           "FUNCTION('DATE_FORMAT', j.appliedAt, '%Y-%m') as month, " +
           "COUNT(j) as applicationCount, " +
           "SUM(CASE WHEN j.status IN ('DOCUMENT_PASSED', 'INTERVIEWING', 'FINAL_PASSED') THEN 1 ELSE 0 END) as passedCount, " +
           "SUM(CASE WHEN j.status = 'REJECTED' THEN 1 ELSE 0 END) as rejectedCount " +
           "FROM JobApplication j " +
           "WHERE j.user = :user " +
           "AND j.appliedAt IS NOT NULL " +
           "GROUP BY FUNCTION('DATE_FORMAT', j.appliedAt, '%Y-%m') " +
           "ORDER BY month DESC")
    List<Object[]> findMonthlyStats(@Param("user") User user);
    
    /**
     * 기간별 월별 지원 현황
     */
    @Query("SELECT " +
           "FUNCTION('DATE_FORMAT', j.appliedAt, '%Y-%m') as month, " +
           "COUNT(j) as applicationCount, " +
           "SUM(CASE WHEN j.status IN ('DOCUMENT_PASSED', 'INTERVIEWING', 'FINAL_PASSED') THEN 1 ELSE 0 END) as passedCount, " +
           "SUM(CASE WHEN j.status = 'REJECTED' THEN 1 ELSE 0 END) as rejectedCount " +
           "FROM JobApplication j " +
           "WHERE j.user = :user " +
           "AND j.appliedAt >= :startDate AND j.appliedAt <= :endDate " +
           "GROUP BY FUNCTION('DATE_FORMAT', j.appliedAt, '%Y-%m') " +
           "ORDER BY month DESC")
    List<Object[]> findMonthlyStatsByDateRange(
        @Param("user") User user,
        @Param("startDate") java.time.LocalDate startDate,
        @Param("endDate") java.time.LocalDate endDate
    );
    
    /**
     * 첫 지원 날짜
     */
    @Query("SELECT MIN(j.appliedAt) FROM JobApplication j WHERE j.user = :user AND j.appliedAt IS NOT NULL")
    java.time.LocalDate findFirstApplicationDate(@Param("user") User user);
    
    /**
     * 최근 지원 날짜
     */
    @Query("SELECT MAX(j.appliedAt) FROM JobApplication j WHERE j.user = :user AND j.appliedAt IS NOT NULL")
    java.time.LocalDate findLastApplicationDate(@Param("user") User user);
    
    /**
     * 진행 중인 지원 수 (관심~면접)
     */
    @Query("SELECT COUNT(j) FROM JobApplication j WHERE j.user = :user " +
           "AND j.status IN ('INTERESTED', 'APPLIED', 'DOCUMENT_PASSED', 'INTERVIEWING')")
    long countActiveApplications(@Param("user") User user);
    
    /**
     * 완료된 지원 수 (합격/불합격)
     */
    @Query("SELECT COUNT(j) FROM JobApplication j WHERE j.user = :user " +
           "AND j.status IN ('FINAL_PASSED', 'REJECTED')")
    long countCompletedApplications(@Param("user") User user);
}
