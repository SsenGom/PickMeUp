package com.pickmeup.service;

import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public String store(MultipartFile file, String subDir) {
        try {
            if (file.isEmpty()) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "빈 파일입니다.");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String storedFilename = UUID.randomUUID().toString() + extension;
            
            Path uploadPath = Paths.get(uploadDir, subDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), filePath);

            log.info("File stored: {}", filePath);
            return subDir + "/" + storedFilename;
            
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "파일 저장 실패");
        }
    }

    public void delete(String filePath) {
        try {
            Path path = Paths.get(uploadDir, filePath);
            Files.deleteIfExists(path);
            log.info("File deleted: {}", path);
        } catch (IOException e) {
            log.error("Failed to delete file", e);
        }
    }

    public Path getFilePath(String filePath) {
        return Paths.get(uploadDir, filePath);
    }
}
