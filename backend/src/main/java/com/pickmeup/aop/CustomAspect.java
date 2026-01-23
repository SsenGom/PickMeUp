package com.pickmeup.aop;

import com.pickmeup.aop.annotation.LogExecutionTime;
import com.pickmeup.aop.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * 커스텀 어노테이션 AOP
 * 
 * 개발자가 만든 어노테이션을 처리하는 Aspect
 * 
 * 지원 어노테이션:
 * - @LogExecutionTime: 메서드 실행 시간 로깅
 * - @Retry: 실패 시 자동 재시도
 * 
 * 사용 예시:
 * @Service
 * public class ExternalApiService {
 * 
 *     @LogExecutionTime  // 실행 시간 로깅
 *     @Retry(maxAttempts = 3, delay = 1000)  // 실패 시 3번 재시도, 1초 간격
 *     public ApiResponse callExternalApi() {
 *         // 외부 API 호출 (불안정할 수 있음)
 *     }
 * }
 */
@Aspect
@Component
@Slf4j
public class CustomAspect {

    /**
     * @LogExecutionTime 어노테이션 처리
     * 
     * 해당 어노테이션이 붙은 메서드의 실행 시간을 로깅
     * 
     * Pointcut 표현식: @annotation(logExecutionTime)
     * - @annotation: 특정 어노테이션이 붙은 메서드
     * - logExecutionTime: 파라미터 이름과 매핑 (어노테이션 정보 접근 가능)
     * 
     * 출력 예시:
     * ⏱ [ExecutionTime] ExternalApiService.callApi(..) - 850ms
     */
    @Around("@annotation(logExecutionTime)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint, LogExecutionTime logExecutionTime) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        
        long startTime = System.currentTimeMillis();
        Object result = joinPoint.proceed();  // 실제 메서드 실행
        long endTime = System.currentTimeMillis();
        
        log.info("⏱ [ExecutionTime] {} - {}ms", methodName, (endTime - startTime));
        return result;
    }

    /**
     * @Retry 어노테이션 처리 - 실패 시 자동 재시도
     * 
     * 외부 API 호출, 네트워크 요청 등 일시적 실패 가능한 작업에 유용
     * 
     * 동작:
     * 1. 메서드 실행
     * 2. 예외 발생 시 지정된 시간(delay) 대기
     * 3. 최대 시도 횟수(maxAttempts)까지 재시도
     * 4. 모두 실패하면 마지막 예외 던짐
     * 
     * 출력 예시:
     * ⚠ [Retry] callApi(..) 실패 (시도 1/3) - Connection timeout
     * 🔄 [Retry] callApi(..) - 시도 2/3
     * ⚠ [Retry] callApi(..) 실패 (시도 2/3) - Connection timeout
     * 🔄 [Retry] callApi(..) - 시도 3/3
     * ◀ 성공!
     */
    @Around("@annotation(retry)")
    public Object retry(ProceedingJoinPoint joinPoint, Retry retry) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        int maxAttempts = retry.maxAttempts();  // 어노테이션에서 설정값 가져오기
        long delay = retry.delay();
        
        Exception lastException = null;
        
        // 최대 시도 횟수만큼 반복
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                // 재시도 알림 (2번째부터)
                if (attempt > 1) {
                    log.info("🔄 [Retry] {} - 시도 {}/{}", methodName, attempt, maxAttempts);
                }
                
                // 메서드 실행 성공하면 바로 반환
                return joinPoint.proceed();
                
            } catch (Exception e) {
                lastException = e;
                log.warn("⚠ [Retry] {} 실패 (시도 {}/{}) - {}", 
                        methodName, attempt, maxAttempts, e.getMessage());
                
                // 마지막 시도가 아니면 대기 후 재시도
                if (attempt < maxAttempts) {
                    Thread.sleep(delay);
                }
            }
        }
        
        // 모든 시도 실패
        log.error("✖ [Retry] {} 최종 실패 - 모든 재시도 소진", methodName);
        throw lastException;
    }
}
