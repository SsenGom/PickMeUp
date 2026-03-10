package com.pickmeup.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
import java.util.Map;
import java.util.UUID;

/**
 * 파일 업로드 서비스
 * - Cloudinary 환경변수 있으면 Cloudinary 사용
 * - 없으면 로컬 ./uploads 폴더에 저장 (개발용)
 */
@Slf4j
@Service
public class FileUploadService {

    private final Cloudinary cloudinary;
    private final boolean cloudinaryEnabled;
    private final String uploadDir;
    private final String baseUrl;

    public FileUploadService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret,
            @Value("${file.upload-dir:./uploads}") String uploadDir,
            @Value("${app.base-url:http://localhost:8080}") String baseUrl) {

        this.uploadDir = uploadDir;
        this.baseUrl = baseUrl;
        this.cloudinaryEnabled = !cloudName.isBlank() && !apiKey.isBlank() && !apiSecret.isBlank();

        if (this.cloudinaryEnabled) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true));
            log.info("[FileUpload] Cloudinary 모드 - cloud_name={}", cloudName);
        } else {
            this.cloudinary = null;
            log.warn("[FileUpload] Cloudinary 미설정 → 로컬 저장 모드 ({})", uploadDir);
        }
    }

    @SuppressWarnings("unchecked")
    public String uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        if (cloudinaryEnabled) {
            return uploadToCloudinary(file, folder);
        } else {
            return uploadToLocal(file, folder);
        }
    }

    private String uploadToCloudinary(MultipartFile file, String folder) {
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", "pickmeup/" + folder,
                    "resource_type", "image",
                    "allowed_formats", new String[]{"jpg", "jpeg", "png", "gif", "webp"},
                    "transformation", ObjectUtils.asMap(
                            "quality", "auto",
                            "fetch_format", "auto"
                    )
            );
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), options);
            String url = (String) result.get("secure_url");
            log.info("[Cloudinary] 업로드 성공 - folder={}, url={}", folder, url);
            return url;
        } catch (Exception e) {
            log.error("[Cloudinary] 업로드 실패 - {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    private String uploadToLocal(MultipartFile file, String folder) {
        try {
            Path dir = Paths.get(uploadDir, folder);
            Files.createDirectories(dir);

            String ext = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + ext;
            Path dest = dir.resolve(filename);
            Files.write(dest, file.getBytes());

            String url = baseUrl + "/uploads/" + folder + "/" + filename;
            log.info("[LocalUpload] 저장 완료 - path={}, url={}", dest, url);
            return url;
        } catch (IOException e) {
            log.error("[LocalUpload] 저장 실패 - {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf('.'));
    }

    public boolean isEnabled() {
        return true; // 로컬 fallback 있으므로 항상 사용 가능
    }
}
