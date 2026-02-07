package com.pickmeup.repository;

import com.pickmeup.domain.resume.Resume;
import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    
    Optional<Resume> findByUser(User user);
    
    /**
     * 사용자 ID로 이력서 조회 (상세 정보 포함)
     */
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT r FROM Resume r " +
           "LEFT JOIN FETCH r.experiences " +
           "LEFT JOIN FETCH r.educations " +
           "LEFT JOIN FETCH r.projects " +
           "LEFT JOIN FETCH r.skills " +
           "WHERE r.user.id = :userId")
    Optional<Resume> findByUserIdWithDetails(@org.springframework.data.repository.query.Param("userId") Long userId);
    
    Optional<Resume> findBySlug(String slug);
    
    Optional<Resume> findBySlugAndIsPublicTrue(String slug);
    
    boolean existsBySlug(String slug);
    
    /**
     * 공개 이력서 조회 (특정 ID 제외, 페이징)
     * 헤드헌터 피드용
     */
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT r FROM Resume r " +
           "LEFT JOIN FETCH r.experiences " +
           "LEFT JOIN FETCH r.educations " +
           "LEFT JOIN FETCH r.projects " +
           "LEFT JOIN FETCH r.skills " +
           "WHERE r.isPublic = true " +
           "AND (:excludeIds IS NULL OR r.id NOT IN :excludeIds) " +
           "ORDER BY r.updatedAt DESC")
    java.util.List<Resume> findPublicResumesExcluding(
        @org.springframework.data.repository.query.Param("excludeIds") java.util.List<Long> excludeIds,
        org.springframework.data.domain.Pageable pageable
    );
}
