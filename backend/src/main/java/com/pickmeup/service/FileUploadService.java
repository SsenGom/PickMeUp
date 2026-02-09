package com.pickmeup.service;

import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * 파일 업로드 서비스
 * 
 * 로컬 파일 시스템에 저장 (추후 S3로 마이그레이션 가능)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {
    
    @Value("${app.upload.path:./uploads}")
    private String uploadPath;
    
    @Value("${app.upload.max-size:10485760}") // 10MB
    private long maxFileSize;
    
    // 허용 MIME 타입
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    
    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
        "application/pdf"
    );
    
    /**
     * 이미지 업로드 (프로필, 포트폴리오 이미지)
     */
    public String uploadImage(MultipartFile file, String subDirectory) {
        validateFile(file, ALLOWED_IMAGE_TYPES, maxFileSize);
        return saveFile(file, "images/" + subDirectory);
    }
    
    /**
     * PDF 업로드 (포트폴리오 PDF)
     */
    public String uploadPdf(MultipartFile file, String subDirectory) {
        validateFile(file, ALLOWED_DOCUMENT_TYPES, maxFileSize);
        return saveFile(file, "documents/" + subDirectory);
    }
    
    /**
     * 파일 삭제
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return;
        
        try {
            // URL에서 상대 경로 추출
            String relativePath = fileUrl.replace("/uploads/", "");
            Path filePath = Paths.get(uploadPath, relativePath);
            Files.deleteIfExists(filePath);
            log.info("File deleted: {}", filePath);
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", fileUrl, e);
        }
    }
    
    private void validateFile(MultipartFile file, Set<String> allowedTypes, long maxSize) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "파일이 없습니다.");
        }
        
        if (file.getSize() > maxSize) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, 
                "파일 크기가 너무 큽니다. 최대 " + (maxSize / 1024 / 1024) + "MB까지 허용됩니다.");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, 
                "허용되지 않는 파일 형식입니다. 허용: " + allowedTypes);
        }
    }
    
    private String saveFile(MultipartFile file, String subDirectory) {
        try {
            // 저장 디렉토리 생성
            Path directory = Paths.get(uploadPath, subDirectory);
            Files.createDirectories(directory);
            
            // 고유 파일명 생성
            String originalFilename = file.getOriginalFilename();
            String extension = getExtension(originalFilename);
            String newFilename = UUID.randomUUID().toString() + extension;
            
            // 파일 저장
            Path filePath = directory.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            log.info("File uploaded: {}", filePath);
            
            // URL 반환 (상대 경로)
            return "/uploads/" + subDirectory + "/" + newFilename;
            
        } catch (IOException e) {
            log.error("File upload failed", e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "파일 업로드에 실패했습니다.");
        }
    }
    
    private String getExtension(String filename) {
        if (filename == null) return "";
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex >= 0 ? filename.substring(dotIndex) : "";
    }
}
