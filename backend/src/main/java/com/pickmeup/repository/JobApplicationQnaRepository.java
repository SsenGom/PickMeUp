package com.pickmeup.repository;

import com.pickmeup.domain.job.JobApplicationQna;
import com.pickmeup.domain.job.QnaType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationQnaRepository extends JpaRepository<JobApplicationQna, Long> {

    List<JobApplicationQna> findByJobApplicationIdOrderByDisplayOrderAsc(Long jobApplicationId);

    List<JobApplicationQna> findByJobApplicationIdAndQnaTypeOrderByDisplayOrderAsc(Long jobApplicationId, QnaType qnaType);
}
