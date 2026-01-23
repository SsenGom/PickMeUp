package com.pickmeup.repository;

import com.pickmeup.domain.task.Task;
import com.pickmeup.domain.task.TaskStatus;
import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * Task Repository - DB 접근 담당
 * 
 * JpaRepository를 상속받으면:
 * 1. 기본 CRUD 메서드 자동 제공 (save, findById, findAll, delete 등)
 * 2. 메서드 이름만 정의하면 쿼리 자동 생성 (Query Method)
 * 3. @Query로 직접 JPQL/SQL 작성 가능
 * 
 * JpaRepository<Task, Long>
 *                ↑      ↑
 *           Entity    PK 타입
 * 
 * Spring Data JPA가 런타임에 구현체(Proxy)를 자동 생성해서 Bean으로 등록
 * → 인터페이스만 만들면 바로 사용 가능!
 */
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // ========== Query Method (메서드 이름으로 쿼리 생성) ==========
    
    /**
     * 사용자의 전체 할일 조회 (표시 순서로 정렬)
     * 
     * 메서드 이름 규칙:
     * findBy + 필드명 + OrderBy + 정렬필드 + Asc/Desc
     * 
     * 자동 생성되는 쿼리:
     * SELECT * FROM tasks WHERE user_id = ? ORDER BY display_order ASC
     */
    List<Task> findByUserOrderByDisplayOrderAsc(User user);
    
    /**
     * 사용자의 특정 상태 할일 조회
     * 
     * findBy + 필드1 + And + 필드2 + OrderBy...
     * 
     * SELECT * FROM tasks WHERE user_id = ? AND status = ? ORDER BY display_order ASC
     */
    List<Task> findByUserAndStatusOrderByDisplayOrderAsc(User user, TaskStatus status);
    
    // ========== @Query (직접 쿼리 작성) ==========
    
    /**
     * 활성 할일 조회 (완료/취소 제외)
     * 
     * @Query: JPQL(Java Persistence Query Language) 직접 작성
     * 
     * JPQL vs SQL:
     * - JPQL: 엔티티와 필드명 사용 (Task, user, status)
     * - SQL: 테이블과 컬럼명 사용 (tasks, user_id, status)
     * 
     * @Param: 쿼리의 :파라미터명과 메서드 파라미터 연결
     * 
     * 우선순위 높은 순 → 마감일 빠른 순 정렬
     * NULLS LAST: 마감일 없는 것은 맨 뒤로
     */
    @Query("SELECT t FROM Task t WHERE t.user = :user " +
           "AND t.status != 'DONE' AND t.status != 'CANCELLED' " +
           "ORDER BY t.priority DESC, t.dueDate ASC NULLS LAST")
    List<Task> findActiveTasks(@Param("user") User user);
    
    /**
     * 특정 날짜의 할일 조회
     */
    @Query("SELECT t FROM Task t WHERE t.user = :user " +
           "AND t.dueDate = :date ORDER BY t.priority DESC")
    List<Task> findByUserAndDueDate(
            @Param("user") User user,
            @Param("date") LocalDate date
    );
    
    /**
     * 지연된 할일 조회 (마감일 지났는데 미완료)
     * 
     * NOT IN: status가 DONE, CANCELLED가 아닌 것
     */
    @Query("SELECT t FROM Task t WHERE t.user = :user " +
           "AND t.dueDate < :today AND t.status NOT IN ('DONE', 'CANCELLED')")
    List<Task> findOverdueTasks(
            @Param("user") User user,
            @Param("today") LocalDate today
    );
    
    /**
     * 상태별 할일 개수
     * 
     * 반환 타입 Long: COUNT 쿼리 결과
     * 
     * SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status = ?
     */
    Long countByUserAndStatus(User user, TaskStatus status);
    
    // ========== 기본 제공 메서드 (JpaRepository) ==========
    // 아래 메서드들은 자동으로 제공됨 (작성할 필요 없음)
    //
    // Task save(Task task);                    // INSERT or UPDATE
    // Optional<Task> findById(Long id);        // SELECT WHERE id = ?
    // List<Task> findAll();                    // SELECT *
    // void delete(Task task);                  // DELETE
    // void deleteById(Long id);                // DELETE WHERE id = ?
    // long count();                            // SELECT COUNT(*)
    // boolean existsById(Long id);             // SELECT EXISTS(...)
}
