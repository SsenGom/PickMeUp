package com.pickmeup.repository.mongo;

import com.pickmeup.domain.mongo.ResumeVersion;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeVersionRepository extends MongoRepository<ResumeVersion, String> {
    
    List<ResumeVersion> findByResumeIdOrderByVersionDesc(Long resumeId);
    
    Optional<ResumeVersion> findByResumeIdAndVersion(Long resumeId, Integer version);
    
    Optional<ResumeVersion> findTopByResumeIdOrderByVersionDesc(Long resumeId);
}
