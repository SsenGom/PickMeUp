package com.pickmeup.repository;

import com.pickmeup.domain.resume.CoverLetter;
import com.pickmeup.domain.resume.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CoverLetterRepository extends JpaRepository<CoverLetter, Long> {
    
    List<CoverLetter> findByResumeOrderByDisplayOrderAsc(Resume resume);
    
    List<CoverLetter> findByResumeAndIsPublicTrueOrderByDisplayOrderAsc(Resume resume);
    
    Optional<CoverLetter> findByResumeAndIsDefaultTrue(Resume resume);
    
    @Query("SELECT cl FROM CoverLetter cl WHERE cl.resume.id = :resumeId ORDER BY cl.displayOrder ASC")
    List<CoverLetter> findByResumeId(@Param("resumeId") Long resumeId);
    
    int countByResume(Resume resume);
}
