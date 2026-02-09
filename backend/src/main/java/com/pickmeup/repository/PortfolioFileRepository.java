package com.pickmeup.repository;

import com.pickmeup.domain.resume.PortfolioFile;
import com.pickmeup.domain.resume.PortfolioFileType;
import com.pickmeup.domain.resume.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PortfolioFileRepository extends JpaRepository<PortfolioFile, Long> {
    
    List<PortfolioFile> findByResumeOrderByDisplayOrderAsc(Resume resume);
    
    List<PortfolioFile> findByResumeAndIsPublicTrueOrderByDisplayOrderAsc(Resume resume);
    
    List<PortfolioFile> findByResumeAndFileTypeOrderByDisplayOrderAsc(Resume resume, PortfolioFileType fileType);
    
    List<PortfolioFile> findByResumeAndIsFeaturedTrueOrderByDisplayOrderAsc(Resume resume);
    
    @Query("SELECT pf FROM PortfolioFile pf WHERE pf.resume.id = :resumeId ORDER BY pf.displayOrder ASC")
    List<PortfolioFile> findByResumeId(@Param("resumeId") Long resumeId);
    
    int countByResume(Resume resume);
    
    @Query("SELECT SUM(pf.fileSize) FROM PortfolioFile pf WHERE pf.resume = :resume")
    Long getTotalFileSizeByResume(@Param("resume") Resume resume);
}
