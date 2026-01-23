package com.pickmeup.domain.common;

import jakarta.persistence.*;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Base Entity - 모든 Entity의 공통 필드
 * 
 * 모든 Entity가 상속받아서 createdAt, updatedAt 필드를 가짐
 * 
 * 사용법:
 * @Entity
 * public class Task extends BaseEntity {
 *     // createdAt, updatedAt 자동 상속
 * }
 * 
 * JPA Auditing:
 * - @CreatedDate: 엔티티 최초 저장 시 자동으로 현재 시간 설정
 * - @LastModifiedDate: 엔티티 수정될 때마다 자동으로 현재 시간 갱신
 * 
 * 활성화 조건:
 * 1. PickmeupApplication에 @EnableJpaAuditing 추가
 * 2. BaseEntity에 @EntityListeners(AuditingEntityListener.class) 추가
 */
@Getter
@MappedSuperclass  // 이 클래스는 테이블을 생성하지 않음
                   // 상속받는 Entity에 필드만 추가됨
                   // BaseEntity 테이블 없고, Task 테이블에 created_at, updated_at 컬럼 생성
@EntityListeners(AuditingEntityListener.class)  // JPA Auditing 리스너
                                                // Entity 변경 감지해서 @CreatedDate, @LastModifiedDate 처리
public abstract class BaseEntity {  // abstract: 직접 인스턴스 생성 불가, 상속만 가능
    
    /**
     * 생성 일시
     * 
     * @CreatedDate: 엔티티가 처음 persist 될 때 자동 설정
     * updatable = false: 이후 수정해도 변경 안 됨
     * 
     * INSERT 시 자동:
     * INSERT INTO tasks (title, created_at, ...) VALUES ('할일', '2024-01-15 10:30:00', ...)
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * 수정 일시
     * 
     * @LastModifiedDate: 엔티티가 수정될 때마다 자동 갱신
     * 
     * UPDATE 시 자동:
     * UPDATE tasks SET title = '수정', updated_at = '2024-01-15 14:20:00' WHERE id = 1
     */
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
