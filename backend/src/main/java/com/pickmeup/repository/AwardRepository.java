package com.pickmeup.repository;

import com.pickmeup.domain.resume.Award;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AwardRepository extends JpaRepository<Award, Long> {
    List<Award> findByResumeIdOrderByDisplayOrderAsc(Long resumeId);
    void deleteAllByResumeId(Long resumeId);
}
