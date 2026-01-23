package com.pickmeup.repository.mongo;

import com.pickmeup.domain.mongo.AiArtifact;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AiArtifactRepository extends MongoRepository<AiArtifact, String> {
    
    List<AiArtifact> findByUserIdAndTypeOrderByCreatedAtDesc(
            Long userId, AiArtifact.AiArtifactType type);
    
    List<AiArtifact> findBySourceTypeAndSourceIdOrderByCreatedAtDesc(
            String sourceType, String sourceId);
}
