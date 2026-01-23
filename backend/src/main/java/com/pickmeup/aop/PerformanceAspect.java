package com.pickmeup.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * 성능 측정 AOP
 * 
 * Repository 계층의 쿼리 실행 시간을 측정
 * 느린 쿼리를 감지하여 성능 최적화에 활용
 * 
 * 임계값:
 * - 100ms 미만: DEBUG (로그 안 남김)
 * - 100ms 이상: INFO (일반 로그)
 * - 500ms 이상: WARN (경고 - 최적화 필요)
 * 
 * 출력 예시:
 * 📊 [Query] TaskRepository.findByUser(..) - 150ms
 * 🐢 [SLOW QUERY] UserRepository.findWithAllData(..) - 1200ms
 * 
 * 느린 쿼리 원인:
 * 1. 인덱스 미사용
 * 2. N+1 문제 (연관 엔티티 조회 시 쿼리 폭증)
 * 3. 대량 데이터 조회
 * 4. 복잡한 JOIN
 */
@Aspect
@Component
@Slf4j
public class PerformanceAspect {

    /**
     * Repository 패키지의 모든 메서드
     * 
     * Repository 메서드 = DB 쿼리 실행
     */
    @Pointcut("execution(* com.pickmeup.repository..*(..))")
    public void repositoryMethods() {}

    /**
     * 쿼리 실행 시간 측정
     * 
     * @Around: 메서드 실행 전후 모두 제어
     */
    @Around("repositoryMethods()")
    public Object measureQueryTime(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        
        // 시작 시간
        long startTime = System.currentTimeMillis();
        
        // 실제 쿼리 실행
        Object result = joinPoint.proceed();
        
        // 실행 시간 계산
        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        // 임계값에 따른 로깅
        if (executionTime > 500) {
            // 500ms 이상: 느린 쿼리 경고
            // 인덱스 추가, 쿼리 최적화, 캐싱 고려 필요
            log.warn("🐢 [SLOW QUERY] {} - {}ms", methodName, executionTime);
        } else if (executionTime > 100) {
            // 100ms 이상: 일반 로그
            log.info("📊 [Query] {} - {}ms", methodName, executionTime);
        }
        // 100ms 미만: 로그 안 남김 (정상 범위)

        return result;
    }
    
    /*
     * ========== 느린 쿼리 해결 방법 ==========
     * 
     * 1. 인덱스 추가
     *    @Column(nullable = false)
     *    @Index(name = "idx_email")
     *    private String email;
     * 
     * 2. N+1 문제 해결 - Fetch Join
     *    @Query("SELECT t FROM Task t JOIN FETCH t.user WHERE t.id = :id")
     *    Task findWithUser(@Param("id") Long id);
     * 
     * 3. Batch Size 설정
     *    @BatchSize(size = 100)
     *    @OneToMany(mappedBy = "user")
     *    private List<Task> tasks;
     * 
     * 4. 페이징
     *    Page<Task> findByUser(User user, Pageable pageable);
     * 
     * 5. DTO 프로젝션 (필요한 컬럼만 조회)
     *    @Query("SELECT new com.pickmeup.dto.TaskSummary(t.id, t.title) FROM Task t")
     *    List<TaskSummary> findAllSummary();
     */
}
