package com.pickmeup.repository;

import com.pickmeup.domain.job.JobApplicationEvent;
import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface JobApplicationEventRepository extends JpaRepository<JobApplicationEvent, Long> {

    List<JobApplicationEvent> findByJobApplicationIdOrderByEventDateAsc(Long jobApplicationId);

    @Query("SELECT e FROM JobApplicationEvent e JOIN e.jobApplication j WHERE j.user = :user AND e.eventDate BETWEEN :start AND :end ORDER BY e.eventDate ASC")
    List<JobApplicationEvent> findByUserAndDateRange(@Param("user") User user, 
                                                      @Param("start") LocalDateTime start, 
                                                      @Param("end") LocalDateTime end);

    @Query("SELECT e FROM JobApplicationEvent e JOIN e.jobApplication j WHERE j.user = :user AND e.eventDate >= :now ORDER BY e.eventDate ASC")
    List<JobApplicationEvent> findUpcomingEvents(@Param("user") User user, @Param("now") LocalDateTime now);
}
