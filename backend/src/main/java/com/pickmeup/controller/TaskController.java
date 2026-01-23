package com.pickmeup.controller;

import com.pickmeup.config.security.CurrentUser;
import com.pickmeup.domain.task.TaskStatus;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.common.ApiResponse;
import com.pickmeup.dto.task.TaskDto.*;
import com.pickmeup.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Task Controller - 할일 API 엔드포인트
 * 
 * Controller 계층의 역할:
 * 1. HTTP 요청 수신 (URL, Method, Body, Header 등)
 * 2. 요청 파라미터 검증 (@Valid)
 * 3. 적절한 Service 메서드 호출
 * 4. 응답 반환
 * 
 * Controller에서 하면 안 되는 것:
 * - 비즈니스 로직 처리 → Service에서
 * - DB 직접 접근 → Repository에서
 * - 복잡한 데이터 변환 → Service나 DTO에서
 * 
 * REST API 설계 규칙:
 * - GET: 조회 (데이터 변경 없음)
 * - POST: 생성
 * - PUT: 전체 수정
 * - PATCH: 부분 수정
 * - DELETE: 삭제
 */
@RestController             // @Controller + @ResponseBody
                            // @Controller: MVC의 Controller
                            // @ResponseBody: 반환값을 JSON으로 자동 변환
@RequestMapping("/api/tasks")  // 이 Controller의 기본 URL 경로
                               // 모든 메서드의 URL 앞에 "/api/tasks" 붙음
@RequiredArgsConstructor    // 생성자 주입
public class TaskController {
    
    private final TaskService taskService;  // Service 주입
    
    /**
     * 할일 생성
     * 
     * POST /api/tasks
     * Body: {"title": "할일 제목", "priority": "HIGH", ...}
     * 
     * @CurrentUser User user
     *   - 커스텀 어노테이션
     *   - SecurityContext에서 현재 로그인한 사용자 추출
     *   - JwtAuthenticationFilter에서 설정한 인증 정보
     * 
     * @Valid @RequestBody CreateRequest request
     *   - @RequestBody: HTTP Body(JSON)를 객체로 변환
     *   - @Valid: DTO의 검증 어노테이션 실행 (@NotBlank, @Size 등)
     *     검증 실패 시 MethodArgumentNotValidException 발생
     *     → GlobalExceptionHandler에서 처리
     * 
     * @ResponseStatus(HttpStatus.CREATED)
     *   - 성공 시 HTTP 201 Created 응답
     *   - 기본값은 200 OK
     */
    @PostMapping  // POST /api/tasks
    @ResponseStatus(HttpStatus.CREATED)  // 201 응답
    public ApiResponse<Response> createTask(
            @CurrentUser User user, 
            @Valid @RequestBody CreateRequest request) {
        return ApiResponse.success(taskService.createTask(user, request));
    }
    
    /**
     * 전체 할일 조회
     * 
     * GET /api/tasks
     */
    @GetMapping  // GET /api/tasks
    public ApiResponse<List<Response>> getAllTasks(@CurrentUser User user) {
        return ApiResponse.success(taskService.getAllTasks(user));
    }
    
    /**
     * 활성 할일 조회
     * 
     * GET /api/tasks/active
     */
    @GetMapping("/active")
    public ApiResponse<List<Response>> getActiveTasks(@CurrentUser User user) {
        return ApiResponse.success(taskService.getActiveTasks(user));
    }
    
    /**
     * 상태별 할일 조회
     * 
     * GET /api/tasks/status/TODO
     * GET /api/tasks/status/IN_PROGRESS
     * GET /api/tasks/status/DONE
     * 
     * @PathVariable: URL 경로의 변수 추출
     *   /status/{status} → status 변수로 받음
     *   Spring이 자동으로 String → TaskStatus(Enum) 변환
     */
    @GetMapping("/status/{status}")
    public ApiResponse<List<Response>> getTasksByStatus(
            @CurrentUser User user, 
            @PathVariable TaskStatus status) {  // URL에서 추출
        return ApiResponse.success(taskService.getTasksByStatus(user, status));
    }
    
    /**
     * 지연된 할일 조회
     * 
     * GET /api/tasks/overdue
     */
    @GetMapping("/overdue")
    public ApiResponse<List<Response>> getOverdueTasks(@CurrentUser User user) {
        return ApiResponse.success(taskService.getOverdueTasks(user));
    }
    
    /**
     * 할일 단건 조회
     * 
     * GET /api/tasks/123
     */
    @GetMapping("/{taskId}")
    public ApiResponse<Response> getTask(
            @CurrentUser User user, 
            @PathVariable Long taskId) {
        return ApiResponse.success(taskService.getTask(user, taskId));
    }
    
    /**
     * 할일 수정
     * 
     * PUT /api/tasks/123
     * Body: {"title": "수정된 제목", ...}
     * 
     * PUT vs PATCH:
     * - PUT: 전체 수정 (모든 필드 교체)
     * - PATCH: 부분 수정 (일부 필드만)
     * 
     * 여기서는 null 체크로 부분 수정도 지원
     */
    @PutMapping("/{taskId}")
    public ApiResponse<Response> updateTask(
            @CurrentUser User user, 
            @PathVariable Long taskId, 
            @RequestBody UpdateRequest request) {
        return ApiResponse.success(taskService.updateTask(user, taskId, request));
    }
    
    /**
     * 할일 상태 변경
     * 
     * PATCH /api/tasks/123/status
     * Body: {"status": "DONE"}
     * 
     * PATCH: 부분 수정 (상태만 변경)
     */
    @PatchMapping("/{taskId}/status")
    public ApiResponse<Response> updateTaskStatus(
            @CurrentUser User user, 
            @PathVariable Long taskId, 
            @RequestBody StatusUpdateRequest request) {
        return ApiResponse.success(taskService.updateTaskStatus(user, taskId, request.getStatus()));
    }
    
    /**
     * 할일 삭제
     * 
     * DELETE /api/tasks/123
     * 
     * @ResponseStatus(HttpStatus.NO_CONTENT)
     *   - 204 No Content 응답
     *   - 삭제 성공했지만 반환할 데이터 없음
     */
    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)  // 204 응답
    public void deleteTask(@CurrentUser User user, @PathVariable Long taskId) {
        taskService.deleteTask(user, taskId);
    }
    
    /**
     * 할일 순서 변경
     * 
     * PUT /api/tasks/reorder
     * Body: [3, 1, 2]  (새로운 순서의 ID 목록)
     */
    @PutMapping("/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderTasks(
            @CurrentUser User user, 
            @RequestBody List<Long> taskIds) {  // JSON 배열 → List
        taskService.reorderTasks(user, taskIds);
    }
    
    /**
     * 할일 통계
     * 
     * GET /api/tasks/stats
     * 
     * 응답 예시:
     * {
     *   "success": true,
     *   "data": {"todo": 5, "inProgress": 3, "done": 10, "overdue": 2}
     * }
     */
    @GetMapping("/stats")
    public ApiResponse<TaskService.TaskStats> getTaskStats(@CurrentUser User user) {
        return ApiResponse.success(taskService.getTaskStats(user));
    }
}
