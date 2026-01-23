package com.pickmeup.repository;

import com.pickmeup.domain.calendar.CalendarEvent;
import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    
    List<CalendarEvent> findByUserOrderByStartAtAsc(User user);
    
    @Query("SELECT e FROM CalendarEvent e WHERE e.user = :user " +
           "AND e.startAt >= :start AND e.startAt < :end " +
           "ORDER BY e.startAt ASC")
    List<CalendarEvent> findByUserAndDateRange(
            @Param("user") User user,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
    
    @Query("SELECT e FROM CalendarEvent e WHERE e.user = :user " +
           "AND e.startAt >= :now AND e.parentEventId IS NULL " +
           "ORDER BY e.startAt ASC LIMIT 10")
    List<CalendarEvent> findUpcomingEvents(
            @Param("user") User user,
            @Param("now") LocalDateTime now
    );
    
    List<CalendarEvent> findByParentEventId(Long parentEventId);
}
