package com.pickmeup.repository;

import com.pickmeup.domain.resume.Resume;
import com.pickmeup.domain.resume.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    
    List<Skill> findByResumeOrderByCategoryAscDisplayOrderAsc(Resume resume);
    
    List<Skill> findByResumeAndCategoryOrderByDisplayOrderAsc(Resume resume, String category);
    
    void deleteByResume(Resume resume);
}
