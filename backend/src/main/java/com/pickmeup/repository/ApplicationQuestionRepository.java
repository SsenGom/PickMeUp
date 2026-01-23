package com.pickmeup.repository;

import com.pickmeup.domain.job.ApplicationQuestion;
import com.pickmeup.domain.job.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationQuestionRepository extends JpaRepository<ApplicationQuestion, Long> {

    List<ApplicationQuestion> findByJobApplicationOrderByDisplayOrderAsc(JobApplication jobApplication);

    void deleteByJobApplication(JobApplication jobApplication);
}
