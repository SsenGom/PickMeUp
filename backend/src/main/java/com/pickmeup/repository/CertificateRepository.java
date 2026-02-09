package com.pickmeup.repository;

import com.pickmeup.domain.resume.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByResumeIdOrderByDisplayOrderAsc(Long resumeId);
    void deleteAllByResumeId(Long resumeId);
}
