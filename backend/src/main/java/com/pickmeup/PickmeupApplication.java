package com.pickmeup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.data.mongo.MongoRepositoriesAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * PickMeUp 애플리케이션 시작점 (Entry Point)
 * 
 * Spring Boot 애플리케이션은 이 main() 메서드에서 시작됨
 */
@SpringBootApplication(exclude = {
        MongoAutoConfiguration.class,
        MongoDataAutoConfiguration.class,
        MongoRepositoriesAutoConfiguration.class
})

@EnableJpaAuditing      // JPA Auditing 활성화
                        // @CreatedDate, @LastModifiedDate 어노테이션이 자동으로 날짜 채워줌
                        // BaseEntity의 createdAt, updatedAt 필드에 사용

@EnableScheduling       // 스케줄링 활성화
                        // @Scheduled 어노테이션으로 주기적 작업 실행 가능
                        // 예: @Scheduled(cron = "0 0 9 * * *") - 매일 9시에 실행

@EnableAsync            // 비동기 처리 활성화
                        // @Async 어노테이션이 붙은 메서드를 별도 스레드에서 실행
                        // 이메일 발송 등 시간이 걸리는 작업을 비동기로 처리
public class PickmeupApplication {
    
    /**
     * 애플리케이션 시작 메서드
     * 
     * SpringApplication.run()이 실행되면:
     * 1. Spring Container(ApplicationContext) 생성
     * 2. @ComponentScan으로 Bean들 찾아서 등록
     * 3. 의존성 주입 (DI) 수행
     * 4. 내장 Tomcat 서버 시작 (기본 포트 8080)
     */
    public static void main(String[] args) {
        var ctx = SpringApplication.run(PickmeupApplication.class, args);
        String openaiKey = ctx.getEnvironment().getProperty("openai.api-key");
        System.out.println("=== OPENAI KEY CHECK: " + 
            (openaiKey == null || openaiKey.isBlank() ? "❌ 비어있음" : "✅ 로드됨 (" + openaiKey.substring(0, 10) + "...)"));
    }
}
