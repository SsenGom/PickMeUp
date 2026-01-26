package com.pickmeup.repository;

import com.pickmeup.domain.resume.Experience;
import com.pickmeup.domain.resume.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    
    List<Experience> findByResumeOrderByDisplayOrderAsc(Resume resume);
    
    List<Experience> findByResumeIdOrderByDisplayOrderAsc(Long resumeId);
    
    void deleteByResume(Resume resume);
}
