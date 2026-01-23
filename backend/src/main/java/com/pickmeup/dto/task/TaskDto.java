package com.pickmeup.dto.task;

import com.pickmeup.domain.task.Task;
import com.pickmeup.domain.task.TaskPriority;
import com.pickmeup.domain.task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Task DTO 클래스들
 * 
 * DTO (Data Transfer Object): 계층 간 데이터 전송용 객체
 * 
 * 왜 Entity를 직접 안 쓰고 DTO를 씀?
 * 1. 보안: Entity에 password 같은 민감 정보가 있으면 노출됨
 * 2. 순환참조 방지: User -> Tasks -> User 같은 무한루프 방지
 * 3. 유연성: 요청/응답에 필요한 필드만 포함
 * 4. 검증: @Valid로 입력값 검증 (@NotBlank 등)
 * 
 * 내부 static class로 그룹화:
 * - TaskDto.CreateRequest
 * - TaskDto.UpdateRequest
 * - TaskDto.Response
 * 
 * import 할 때: TaskDto.* 또는 TaskDto.CreateRequest
 */
public class TaskDto {
    
    /**
     * 할일 생성 요청 DTO
     * 
     * POST /api/tasks 요청 Body
     * {
     *   "title": "할일 제목",
     *   "description": "설명",
     *   "priority": "HIGH",
     *   "dueDate": "2024-01-20",
     *   "category": "업무"
     * }
     */
    @Getter
    @NoArgsConstructor   // 기본 생성자 (Jackson JSON 파싱에 필요)
    @AllArgsConstructor  // 모든 필드 생성자
    public static class CreateRequest {
        
        /**
         * 할일 제목 (필수)
         * 
         * @NotBlank: null, "", " " 모두 불가
         * message: 검증 실패 시 에러 메시지
         * 
         * @Valid와 함께 사용 (Controller에서)
         * 검증 실패 -> MethodArgumentNotValidException
         * -> GlobalExceptionHandler에서 처리
         */
        @NotBlank(message = "제목은 필수입니다")
        private String title;
        
        private String description;  // 설명 (선택)
        
        private TaskPriority priority = TaskPriority.MEDIUM;  // 우선순위 (기본값: 보통)
        
        private LocalDate dueDate;   // 마감일 (선택)
        
        private String category;     // 카테고리 (선택)
    }
    
    /**
     * 할일 수정 요청 DTO
     * 
     * PUT /api/tasks/{id} 요청 Body
     * 
     * 모든 필드 nullable:
     * - null이면 기존 값 유지
     * - 값이 있으면 해당 필드만 수정
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String title;
        private String description;
        private TaskPriority priority;
        private LocalDate dueDate;
        private String category;
    }
    
    /**
     * 상태 변경 요청 DTO
     * 
     * PATCH /api/tasks/{id}/status 요청 Body
     * { "status": "DONE" }
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private TaskStatus status;
    }
    
    /**
     * 할일 응답 DTO
     * 
     * API 응답에 사용
     * 
     * Entity -> Response 변환:
     * - Entity의 민감하지 않은 필드만 포함
     * - 계산된 필드 추가 (isOverdue)
     * 
     * 응답 예시:
     * {
     *   "id": 1,
     *   "title": "할일 제목",
     *   "status": "TODO",
     *   "priority": "HIGH",
     *   "isOverdue": false,
     *   ...
     * }
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder  // Response.builder().title(...).build()
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private TaskStatus status;
        private TaskPriority priority;
        private LocalDate dueDate;
        private LocalDateTime completedAt;
        private String category;
        private Integer displayOrder;
        private LocalDateTime createdAt;
        private Boolean isOverdue;  // 마감 지났는지 (계산된 필드)
        
        /**
         * Entity -> DTO 변환 (정적 팩토리 메서드)
         * 
         * 사용: Response.from(task)
         * 
         * 변환 로직:
         * 1. Entity 필드를 DTO 필드로 복사
         * 2. isOverdue 계산 (마감일 < 오늘 && 미완료)
         */
        public static Response from(Task task) {
            // 마감 여부 계산
            // 조건: 마감일 있음 AND 마감일 지남 AND 완료/취소 아님
            boolean isOverdue = task.getDueDate() != null 
                    && task.getDueDate().isBefore(LocalDate.now())
                    && task.getStatus() != TaskStatus.DONE 
                    && task.getStatus() != TaskStatus.CANCELLED;
            
            return Response.builder()
                    .id(task.getId())
                    .title(task.getTitle())
                    .description(task.getDescription())
                    .status(task.getStatus())
                    .priority(task.getPriority())
                    .dueDate(task.getDueDate())
                    .completedAt(task.getCompletedAt())
                    .category(task.getCategory())
                    .displayOrder(task.getDisplayOrder())
                    .createdAt(task.getCreatedAt())
                    .isOverdue(isOverdue)
                    .build();
        }
    }
}
