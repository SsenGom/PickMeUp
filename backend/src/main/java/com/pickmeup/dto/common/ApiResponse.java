package com.pickmeup.dto.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 통일된 API 응답 DTO
 * 
// * 모든 API 응답을 이 형식으로 반환해서 일관성 유지
 * 
 * 성공 응답:
 * {
 *   "success": true,
 *   "message": null,
 *   "data": { ... }
 * }
 * 
 * 에러 응답:
 * {
 *   "success": false,
 *   "message": "에러 메시지",
 *   "data": null
 * }
 * 
 * Generic <T>:
 * data 필드의 타입을 유연하게 지정
 * - ApiResponse<TaskResponse> → data가 TaskResponse
 * - ApiResponse<List<TaskResponse>> → data가 List<TaskResponse>
 * - ApiResponse<Void> → data가 null (에러 응답 등)
 */
@Getter                    // getter 자동 생성
@NoArgsConstructor         // 기본 생성자 (Jackson JSON 변환에 필요)
@AllArgsConstructor        // 모든 필드 생성자
@Builder                   // Builder 패턴
public class ApiResponse<T> {
    
    /**
     * 성공 여부
     * true: 요청 성공
     * false: 요청 실패 (에러)
     */
    private boolean success;
    
    /**
     * 메시지
     * 성공 시: 선택적 (보통 null)
     * 실패 시: 에러 메시지
     */
    private String message;
    
    /**
     * 응답 데이터
     * 성공 시: 실제 데이터
     * 실패 시: null
     */
    private T data;
    
    // ========== 정적 팩토리 메서드 ==========
    // new 대신 ApiResponse.success(...) 형태로 생성
    // 의도가 명확하고 가독성 좋음
    
    /**
     * 성공 응답 (데이터 포함)
     * 
     * 사용: ApiResponse.success(taskList)
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }
    
    /**
     * 성공 응답 (메시지 + 데이터)
     * 
     * 사용: ApiResponse.success("생성 완료", task)
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }
    
    /**
     * 성공 응답 (메시지만, 데이터 없음)
     * 
     * 사용: ApiResponse.success("삭제 완료")
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }
    
    /**
     * 에러 응답
     * 
     * 사용: ApiResponse.error("할일을 찾을 수 없습니다")
     * 
     * 주로 GlobalExceptionHandler에서 사용
     */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}
