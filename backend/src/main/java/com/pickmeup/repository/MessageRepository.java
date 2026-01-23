package com.pickmeup.repository;

import com.pickmeup.domain.message.Message;
import com.pickmeup.domain.message.Thread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByThreadOrderByCreatedAtAsc(Thread thread);
    
    Long countByThreadAndIsReadFalse(Thread thread);
}
