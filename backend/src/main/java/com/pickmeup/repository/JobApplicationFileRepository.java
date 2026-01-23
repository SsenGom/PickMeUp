package com.pickmeup.repository;

import com.pickmeup.domain.job.FileCategory;
import com.pickmeup.domain.job.JobApplicationFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationFileRepository extends JpaRepository<JobApplicationFile, Long> {
    
    List<JobApplicationFile> findByJobApplicationIdOrderByCreatedAtDesc(Long jobApplicationId);
    
    List<JobApplicationFile> findByJobApplicationIdAndFileCategoryOrderByCreatedAtDesc(
            Long jobApplicationId, FileCategory category);
}
