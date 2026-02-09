package com.pickmeup.repository;

import com.pickmeup.domain.resume.Education;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByResumeIdOrderByDisplayOrderAsc(Long resumeId);
    void deleteAllByResumeId(Long resumeId);
}
