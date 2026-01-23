package com.pickmeup.repository.mongo;

import com.pickmeup.domain.mongo.MessageRaw;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MessageRawRepository extends MongoRepository<MessageRaw, String> {
    
    Optional<MessageRaw> findByMysqlMessageId(Long mysqlMessageId);
}
