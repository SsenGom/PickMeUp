package com.pickmeup.repository;

import com.pickmeup.domain.resume.Resume;
import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    
    Optional<Resume> findByUser(User user);
    
    Optional<Resume> findBySlug(String slug);
    
    Optional<Resume> findBySlugAndIsPublicTrue(String slug);
    
    boolean existsBySlug(String slug);
}
