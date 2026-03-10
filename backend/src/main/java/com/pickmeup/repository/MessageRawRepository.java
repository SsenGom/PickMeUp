package com.pickmeup.repository;

import com.pickmeup.domain.message.MessageRaw;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MessageRawRepository extends JpaRepository<MessageRaw, Long> {

    Optional<MessageRaw> findByMysqlMessageId(Long mysqlMessageId);
}
