package com.pickmeup.domain.task;

import com.pickmeup.domain.common.BaseEntity;
import com.pickmeup.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 할일 Entity
 * 
 * 'tasks' 테이블과 매핑
 * +----+---------+-------+-------------+--------+----------+---------+
 * | id | user_id | title | description | status | priority | due_date|
 * +----+---------+-------+-------------+--------+----------+---------+
 * | 1  | 1       | 과제  | ...         | TODO   | HIGH     | 2024-01 |
 * +----+---------+-------+-------------+--------+----------+---------+
 * 
 * User와의 관계: N:1 (여러 할일이 한 사용자에게 속함)
 */
@Entity
@Table(name = "tasks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Task extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 할일 소유자 (N:1 관계)
     * 
     * @ManyToOne: 다대일 관계
     *   - Task(다) → User(일)
     *   - 여러 Task가 하나의 User에게 속함
     * 
     * @JoinColumn: 외래키 컬럼 지정
     *   - name = "user_id": tasks 테이블에 user_id 컬럼 생성
     *   - nullable = false: NOT NULL
     * 
     * FetchType.LAZY (지연 로딩):
     *   - Task 조회 시 User를 바로 가져오지 않음
     *   - task.getUser() 호출 시점에 추가 쿼리 실행
     *   - 불필요한 조회 방지 → 성능 최적화
     *   
     *   예시:
     *   Task task = taskRepository.findById(1L);  // SELECT * FROM tasks WHERE id = 1
     *   // 이 시점에서 user는 아직 조회 안 됨 (Proxy 객체)
     *   
     *   String name = task.getUser().getName();  // SELECT * FROM users WHERE id = ?
     *   // getUser() 호출 시 실제 쿼리 실행
     * 
     * FetchType.EAGER (즉시 로딩) - 비권장:
     *   - Task 조회 시 User도 함께 조회 (JOIN)
     *   - 필요 없을 때도 조회 → 성능 저하
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    /**
     * 할일 제목
     */
    @Column(nullable = false, length = 300)
    private String title;
    
    /**
     * 할일 설명
     * 
     * columnDefinition = "TEXT": DB의 TEXT 타입 사용
     * VARCHAR는 최대 65535자, TEXT는 더 긴 텍스트 저장 가능
     */
    @Column(columnDefinition = "TEXT")
    private String description;
    
    /**
     * 할일 상태
     * 
     * Enum 값: TODO(할일), IN_PROGRESS(진행중), DONE(완료)
     * DB에는 문자열로 저장 ("TODO", "IN_PROGRESS", "DONE")
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default  // Builder 패턴 사용 시 기본값
    private TaskStatus status = TaskStatus.TODO;
    
    /**
     * 우선순위
     * 
     * Enum 값: LOW(낮음), MEDIUM(보통), HIGH(높음), URGENT(긴급)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;
    
    /**
     * 마감일
     * 
     * LocalDate: 날짜만 (시간 없음) - 2024-01-15
     * LocalDateTime: 날짜 + 시간 - 2024-01-15T14:30:00
     */
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    /**
     * 완료 시간
     * 
     * 상태가 DONE으로 바뀔 때 자동 설정
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    /**
     * 카테고리 (선택)
     * 
     * 예: "업무", "개인", "공부" 등
     */
    @Column(length = 50)
    private String category;
    
    /**
     * 표시 순서
     * 
     * 드래그앤드롭으로 순서 변경 시 사용
     */
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    // ========== 비즈니스 메서드 ==========
    
    /**
     * 상태 변경
     * 
     * 완료(DONE)로 변경 시 completedAt 자동 설정
     * 다른 상태로 변경 시 completedAt null로 초기화
     * 
     * @param status 새로운 상태
     */
    public void updateStatus(TaskStatus status) {
        this.status = status;
        if (status == TaskStatus.DONE) {
            this.completedAt = LocalDateTime.now();
        } else {
            this.completedAt = null;
        }
    }
    
    /**
     * 할일 정보 수정
     */
    public void update(String title, String description, TaskPriority priority, 
                       LocalDate dueDate, String category) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.dueDate = dueDate;
        this.category = category;
    }
    
    /**
     * 표시 순서 변경
     */
    public void reorder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
