package com.pickmeup.service;

import com.pickmeup.domain.task.Task;
import com.pickmeup.domain.task.TaskStatus;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.task.TaskDto.*;
import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import com.pickmeup.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Task Service - 할일 비즈니스 로직 담당
 * 
 * Service 계층의 역할:
 * 1. 비즈니스 로직 처리 (규칙, 검증, 계산 등)
 * 2. 트랜잭션 관리
 * 3. 여러 Repository 조합
 * 4. DTO ↔ Entity 변환
 * 
 * Controller에서 직접 Repository 호출하면 안 되는 이유:
 * - 비즈니스 로직이 Controller에 흩어짐 → 중복, 유지보수 어려움
 * - 트랜잭션 관리 어려움
 * - 테스트하기 어려움
 */
@Service                    // Spring Bean 등록 (Service 계층임을 표시)
@RequiredArgsConstructor    // final 필드의 생성자 자동 생성 → 의존성 주입
@Transactional(readOnly = true)  // 클래스 전체에 읽기 전용 트랜잭션 적용
                                 // 각 메서드에서 @Transactional 붙이면 쓰기 트랜잭션으로 오버라이드
public class TaskService {
    
    private final TaskRepository taskRepository;  // DI: Spring이 자동 주입
    
    /**
     * 할일 생성
     * 
     * @Transactional: 쓰기 트랜잭션 (readOnly 오버라이드)
     * 
     * 트랜잭션이란?
     * - DB 작업을 하나로 묶음
     * - 모두 성공하면 커밋, 하나라도 실패하면 전체 롤백
     * - 예: 송금 = 출금 + 입금. 둘 다 성공해야 함
     * 
     * @param user 현재 로그인한 사용자 (Controller에서 @CurrentUser로 주입)
     * @param request 할일 생성 요청 DTO
     * @return 생성된 할일 응답 DTO
     */
    @Transactional  // readOnly = false (기본값)
    public Response createTask(User user, CreateRequest request) {
        // 1. Entity 생성 (Builder 패턴)
        Task task = Task.builder()
                .user(user)                         // 소유자 설정
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .dueDate(request.getDueDate())
                .category(request.getCategory())
                .build();
        
        // 2. DB 저장
        // save()는 INSERT 또는 UPDATE
        // - ID가 null이면 INSERT (새로 생성)
        // - ID가 있으면 UPDATE (기존 수정)
        taskRepository.save(task);
        
        // 3. Entity → Response DTO 변환해서 반환
        return Response.from(task);
    }
    
    /**
     * 전체 할일 조회
     * 
     * readOnly = true (클래스 레벨 설정 적용)
     * 읽기 전용 트랜잭션 장점:
     * - JPA가 변경 감지(Dirty Checking) 안 함 → 성능 향상
     * - 의도치 않은 수정 방지
     */
    public List<Response> getAllTasks(User user) {
        return taskRepository.findByUserOrderByDisplayOrderAsc(user)
                .stream()                    // List → Stream 변환
                .map(Response::from)         // 각 Task를 Response로 변환
                .toList();                   // 다시 List로
    }
    
    /**
     * 활성 할일 조회 (완료/취소 제외)
     */
    public List<Response> getActiveTasks(User user) {
        return taskRepository.findActiveTasks(user)
                .stream().map(Response::from).toList();
    }
    
    /**
     * 상태별 할일 조회
     */
    public List<Response> getTasksByStatus(User user, TaskStatus status) {
        return taskRepository.findByUserAndStatusOrderByDisplayOrderAsc(user, status)
                .stream().map(Response::from).toList();
    }
    
    /**
     * 지연된 할일 조회
     */
    public List<Response> getOverdueTasks(User user) {
        return taskRepository.findOverdueTasks(user, LocalDate.now())
                .stream().map(Response::from).toList();
    }
    
    /**
     * 할일 단건 조회
     */
    public Response getTask(User user, Long taskId) {
        return Response.from(findTaskWithAuth(user, taskId));
    }
    
    /**
     * 할일 수정
     * 
     * 변경 감지(Dirty Checking) 동작:
     * 1. findById()로 Entity 조회 → 영속성 컨텍스트에 저장
     * 2. task.update()로 필드 수정
     * 3. 트랜잭션 종료 시점에 변경 감지
     * 4. 변경된 필드가 있으면 자동으로 UPDATE 쿼리 실행
     * 
     * → save() 호출 안 해도 자동 저장!
     */
    @Transactional
    public Response updateTask(User user, Long taskId, UpdateRequest request) {
        Task task = findTaskWithAuth(user, taskId);
        
        // Entity 메서드로 수정 (null이면 기존 값 유지)
        task.update(
                request.getTitle() != null ? request.getTitle() : task.getTitle(),
                request.getDescription() != null ? request.getDescription() : task.getDescription(),
                request.getPriority() != null ? request.getPriority() : task.getPriority(),
                request.getDueDate() != null ? request.getDueDate() : task.getDueDate(),
                request.getCategory() != null ? request.getCategory() : task.getCategory()
        );
        
        // save() 없이도 트랜잭션 종료 시 자동 UPDATE됨 (Dirty Checking)
        return Response.from(task);
    }
    
    /**
     * 할일 상태 변경
     */
    @Transactional
    public Response updateTaskStatus(User user, Long taskId, TaskStatus status) {
        Task task = findTaskWithAuth(user, taskId);
        task.updateStatus(status);  // 상태 변경 + 완료 시간 자동 설정
        return Response.from(task);
    }
    
    /**
     * 할일 삭제
     */
    @Transactional
    public void deleteTask(User user, Long taskId) {
        taskRepository.delete(findTaskWithAuth(user, taskId));
    }
    
    /**
     * 할일 순서 변경 (드래그앤드롭)
     * 
     * @param taskIds 새로운 순서로 정렬된 ID 목록
     */
    @Transactional
    public void reorderTasks(User user, List<Long> taskIds) {
        for (int i = 0; i < taskIds.size(); i++) {
            findTaskWithAuth(user, taskIds.get(i)).reorder(i);
        }
        // 각 task의 displayOrder가 0, 1, 2, ... 로 설정됨
    }
    
    /**
     * 할일 통계 조회
     */
    public TaskStats getTaskStats(User user) {
        long todo = taskRepository.countByUserAndStatus(user, TaskStatus.TODO);
        long inProgress = taskRepository.countByUserAndStatus(user, TaskStatus.IN_PROGRESS);
        long done = taskRepository.countByUserAndStatus(user, TaskStatus.DONE);
        long overdue = taskRepository.findOverdueTasks(user, LocalDate.now()).size();
        return new TaskStats(todo, inProgress, done, overdue);
    }
    
    /**
     * 할일 조회 + 권한 확인
     * 
     * 공통 로직을 private 메서드로 추출:
     * 1. ID로 할일 조회
     * 2. 없으면 예외
     * 3. 다른 사용자의 할일이면 예외
     * 4. 본인 것이면 반환
     * 
     * @throws BusinessException TASK_NOT_FOUND: 할일 없음
     * @throws BusinessException ACCESS_DENIED: 권한 없음
     */
    private Task findTaskWithAuth(User user, Long taskId) {
        // 1. 할일 조회
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));
        
        // 2. 권한 확인 (본인 것인지)
        if (!task.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        return task;
    }
    
    /**
     * 통계 DTO (record)
     * 
     * Java 14+ record:
     * - 불변(immutable) 데이터 클래스
     * - 생성자, getter, equals, hashCode, toString 자동 생성
     * - 간단한 DTO에 적합
     */
    public record TaskStats(long todo, long inProgress, long done, long overdue) {}
}
