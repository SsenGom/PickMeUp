package com.pickmeup.repository;

import com.pickmeup.domain.resume.Project;
import com.pickmeup.domain.resume.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByResumeOrderByDisplayOrderAsc(Resume resume);
    
    List<Project> findByResumeAndIsFeaturedTrueOrderByDisplayOrderAsc(Resume resume);
    
    void deleteByResume(Resume resume);
}
