package com.pickmeup.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 웹 설정 - 정적 리소스 서빙
 * 
 * 업로드된 파일(이미지, PDF 등)을 /uploads/** URL로 접근 가능하게 함
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${app.upload.path:./uploads}")
    private String uploadPath;
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드 폴더의 절대 경로 구하기
        Path uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
        String uploadLocation = "file:" + uploadDir.toString() + "/";
        
        // /uploads/** 요청을 실제 파일 시스템의 uploads 폴더로 매핑
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation)
                .setCachePeriod(3600); // 1시간 캐시
    }
}
