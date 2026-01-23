package com.pickmeup.repository;

import com.pickmeup.domain.important.ImportantDate;
import com.pickmeup.domain.important.ImportantDateType;
import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ImportantDateRepository extends JpaRepository<ImportantDate, Long> {
    
    List<ImportantDate> findByUserAndIsActiveTrue(User user);
    
    List<ImportantDate> findByUserAndTypeAndIsActiveTrue(User user, ImportantDateType type);
    
    @Query("SELECT i FROM ImportantDate i WHERE i.user = :user " +
           "AND i.isActive = true AND i.targetDate BETWEEN :start AND :end")
    List<ImportantDate> findByUserAndDateRange(
            @Param("user") User user,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
    
    @Query("SELECT i FROM ImportantDate i WHERE i.isActive = true " +
           "AND i.targetDate = :date")
    List<ImportantDate> findByTargetDate(@Param("date") LocalDate date);
    
    @Query("SELECT i FROM ImportantDate i WHERE i.user = :user " +
           "AND i.isActive = true " +
           "ORDER BY i.targetDate ASC")
    List<ImportantDate> findUpcomingImportantDates(@Param("user") User user);
}
