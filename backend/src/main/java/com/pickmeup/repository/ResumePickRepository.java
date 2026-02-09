package com.pickmeup.repository;

import com.pickmeup.domain.recruiter.PickStatus;
import com.pickmeup.domain.recruiter.ResumePick;
import com.pickmeup.domain.resume.Resume;
import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ResumePickRepository extends JpaRepository<ResumePick, Long> {

    /**
     * 헤드헌터가 특정 이력서를 이미 픽했는지 확인
     */
    boolean existsByRecruiterAndResume(User recruiter, Resume resume);
    
    /**
     * 헤드헌터가 픽한 이력서 목록 (최신순)
     */
    List<ResumePick> findByRecruiterOrderByPickedAtDesc(User recruiter);
    
    /**
     * 헤드헌터가 픽한 이력서 목록 (상태별)
     */
    List<ResumePick> findByRecruiterAndStatusOrderByPickedAtDesc(User recruiter, PickStatus status);
    
    /**
     * 특정 이력서가 받은 픽 목록
     */
    List<ResumePick> findByResumeOrderByPickedAtDesc(Resume resume);
    
    /**
     * 특정 이력서가 받은 총 픽 수
     */
    long countByResume(Resume resume);
    
    /**
     * 특정 이력서가 기간 내 받은 픽 수
     */
    @Query("SELECT COUNT(p) FROM ResumePick p WHERE p.resume = :resume AND p.pickedAt >= :since")
    long countByResumeAndPickedAtAfter(@Param("resume") Resume resume, @Param("since") LocalDateTime since);
    
    /**
     * 헤드헌터의 총 픽 수
     */
    long countByRecruiter(User recruiter);
    
    /**
     * 헤드헌터의 상태별 픽 수
     */
    long countByRecruiterAndStatus(User recruiter, PickStatus status);
    
    /**
     * 헤드헌터가 픽한 특정 이력서 찾기
     */
    Optional<ResumePick> findByRecruiterAndResume(User recruiter, Resume resume);
    
    /**
     * 헤드헌터가 이미 본 이력서 ID 목록
     */
    @Query("SELECT p.resume.id FROM ResumePick p WHERE p.recruiter = :recruiter")
    List<Long> findPickedResumeIdsByRecruiter(@Param("recruiter") User recruiter);
}
