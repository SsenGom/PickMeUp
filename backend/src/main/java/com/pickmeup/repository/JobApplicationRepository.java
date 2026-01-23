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
}
