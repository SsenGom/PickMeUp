package com.pickmeup.repository;

import com.pickmeup.domain.job.InterviewRecord;
import com.pickmeup.domain.job.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewRecordRepository extends JpaRepository<InterviewRecord, Long> {

    List<InterviewRecord> findByJobApplicationOrderByDisplayOrderAsc(JobApplication jobApplication);

    void deleteByJobApplication(JobApplication jobApplication);
}
