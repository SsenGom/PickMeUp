package com.pickmeup.repository;

import com.pickmeup.domain.resume.Resume;
import com.pickmeup.domain.resume.ResumeView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ResumeViewRepository extends JpaRepository<ResumeView, Long> {
    
    List<ResumeView> findByResumeOrderByViewedAtDesc(Resume resume);
    
    @Query("SELECT rv FROM ResumeView rv WHERE rv.resume = :resume AND rv.viewedAt >= :since ORDER BY rv.viewedAt DESC")
    List<ResumeView> findRecentViews(@Param("resume") Resume resume, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(rv) FROM ResumeView rv WHERE rv.resume = :resume")
    long countByResume(@Param("resume") Resume resume);
    
    @Query("SELECT COUNT(rv) FROM ResumeView rv WHERE rv.resume = :resume AND rv.viewedAt >= :since")
    long countRecentViews(@Param("resume") Resume resume, @Param("since") LocalDateTime since);
    
    // 일별 조회수 통계
    @Query("SELECT DATE(rv.viewedAt), COUNT(rv) FROM ResumeView rv " +
           "WHERE rv.resume = :resume AND rv.viewedAt >= :since " +
           "GROUP BY DATE(rv.viewedAt) ORDER BY DATE(rv.viewedAt)")
    List<Object[]> getDailyViewStats(@Param("resume") Resume resume, @Param("since") LocalDateTime since);
    
    // 최근 방문자 IP로 중복 체크 (같은 IP는 1시간에 1회만 카운트)
    @Query("SELECT COUNT(rv) > 0 FROM ResumeView rv " +
           "WHERE rv.resume = :resume AND rv.viewerIp = :ip AND rv.viewedAt >= :since")
    boolean existsRecentViewByIp(@Param("resume") Resume resume, @Param("ip") String ip, @Param("since") LocalDateTime since);
}
