package com.pickmeup.controller;

import com.pickmeup.config.security.CurrentUser;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.common.ApiResponse;
import com.pickmeup.dto.resume.ResumeDto.*;
import com.pickmeup.service.ResumeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    // ==================== Resume ====================

    @GetMapping
    public ResponseEntity<ApiResponse<Response>> getMyResume(@CurrentUser User user) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.getMyResume(user)));
    }

    @GetMapping("/public/{slug}")
    public ResponseEntity<ApiResponse<PublicResponse>> getPublicResume(
            @PathVariable String slug,
            HttpServletRequest request) {
        // 조회수 기록
        String viewerIp = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        String referer = request.getHeader("Referer");
        resumeService.recordView(slug, viewerIp, userAgent, referer);
        
        return ResponseEntity.ok(ApiResponse.success(resumeService.getPublicResume(slug)));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ViewStatsResponse>> getViewStats(@CurrentUser User user) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.getViewStats(user)));
    }

    @PutMapping("/basic-info")
    public ResponseEntity<ApiResponse<Response>> updateBasicInfo(
            @CurrentUser User user,
            @RequestBody UpdateBasicInfoRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.updateBasicInfo(user, request)));
    }

    @PutMapping("/links")
    public ResponseEntity<ApiResponse<Response>> updateLinks(
            @CurrentUser User user,
            @RequestBody UpdateLinksRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.updateLinks(user, request)));
    }

    @PutMapping("/free-content")
    public ResponseEntity<ApiResponse<Response>> updateFreeContent(
            @CurrentUser User user,
            @RequestBody UpdateFreeContentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.updateFreeContent(user, request)));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<Response>> updateSettings(
            @CurrentUser User user,
            @RequestBody UpdateSettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.updateSettings(user, request)));
    }

    // ==================== Education ====================

    @PostMapping("/educations")
    public ResponseEntity<ApiResponse<EducationResponse>> addEducation(
            @CurrentUser User user,
            @RequestBody EducationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.addEducation(user, request)));
    }

    @PutMapping("/educations/{id}")
    public ResponseEntity<ApiResponse<EducationResponse>> updateEducation(
            @CurrentUser User user,
            @PathVariable Long id,
            @RequestBody EducationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.updateEducation(user, id, request)));
    }

    @DeleteMapping("/educations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEducation(
            @CurrentUser User user,
            @PathVariable Long id) {
        resumeService.deleteEducation(user, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== Experience ====================

    @PostMapping("/experiences")
    public ResponseEntity<ApiResponse<ExperienceResponse>> addExperience(
            @CurrentUser User user,
            @RequestBody ExperienceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.addExperience(user, request)));
    }

    @PutMapping("/experiences/{id}")
    public ResponseEntity<ApiResponse<ExperienceResponse>> updateExperience(
            @CurrentUser User user,
            @PathVariable Long id,
            @RequestBody ExperienceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.updateExperience(user, id, request)));
    }

    @DeleteMapping("/experiences/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExperience(
            @CurrentUser User user,
            @PathVariable Long id) {
        resumeService.deleteExperience(user, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== Project ====================

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<ProjectResponse>> addProject(
            @CurrentUser User user,
            @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.addProject(user, request)));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @CurrentUser User user,
            @PathVariable Long id,
            @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.updateProject(user, id, request)));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @CurrentUser User user,
            @PathVariable Long id) {
        resumeService.deleteProject(user, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== Skill ====================

    @PostMapping("/skills")
    public ResponseEntity<ApiResponse<SkillResponse>> addSkill(
            @CurrentUser User user,
            @RequestBody SkillRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.addSkill(user, request)));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSkill(
            @CurrentUser User user,
            @PathVariable Long id) {
        resumeService.deleteSkill(user, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== Certificate ====================

    @PostMapping("/certificates")
    public ResponseEntity<ApiResponse<CertificateResponse>> addCertificate(
            @CurrentUser User user,
            @RequestBody CertificateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.addCertificate(user, request)));
    }

    @DeleteMapping("/certificates/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCertificate(
            @CurrentUser User user,
            @PathVariable Long id) {
        resumeService.deleteCertificate(user, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== Language ====================

    @PostMapping("/languages")
    public ResponseEntity<ApiResponse<LanguageResponse>> addLanguage(
            @CurrentUser User user,
            @RequestBody LanguageRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.addLanguage(user, request)));
    }

    @DeleteMapping("/languages/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLanguage(
            @CurrentUser User user,
            @PathVariable Long id) {
        resumeService.deleteLanguage(user, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== Award ====================

    @PostMapping("/awards")
    public ResponseEntity<ApiResponse<AwardResponse>> addAward(
            @CurrentUser User user,
            @RequestBody AwardRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.addAward(user, request)));
    }

    @DeleteMapping("/awards/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAward(
            @CurrentUser User user,
            @PathVariable Long id) {
        resumeService.deleteAward(user, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    // ==================== CoverLetter ====================
    
    @GetMapping("/cover-letters")
    public ResponseEntity<ApiResponse<List<CoverLetterResponse>>> getCoverLetters(@CurrentUser User user) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.getCoverLetters(user)));
    }
    
    @PostMapping("/cover-letters")
    public ResponseEntity<ApiResponse<CoverLetterResponse>> addCoverLetter(
            @CurrentUser User user,
            @RequestBody CoverLetterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.addCoverLetter(user, request)));
    }
    
    @PutMapping("/cover-letters/{id}")
    public ResponseEntity<ApiResponse<CoverLetterResponse>> updateCoverLetter(
            @CurrentUser User user,
            @PathVariable Long id,
            @RequestBody CoverLetterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.updateCoverLetter(user, id, request)));
    }
    
    @DeleteMapping("/cover-letters/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoverLetter(
            @CurrentUser User user,
            @PathVariable Long id) {
        resumeService.deleteCoverLetter(user, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    // ==================== PortfolioFile ====================
    
    @GetMapping("/portfolio-files")
    public ResponseEntity<ApiResponse<List<PortfolioFileResponse>>> getPortfolioFiles(@CurrentUser User user) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.getPortfolioFiles(user)));
    }
    
    @PostMapping(value = "/portfolio-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PortfolioFileResponse>> addPortfolioFile(
            @CurrentUser User user,
            @RequestPart("data") PortfolioFileRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.addPortfolioFile(user, request, file)));
    }
    
    @PutMapping("/portfolio-files/{id}")
    public ResponseEntity<ApiResponse<PortfolioFileResponse>> updatePortfolioFile(
            @CurrentUser User user,
            @PathVariable Long id,
            @RequestBody PortfolioFileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.updatePortfolioFile(user, id, request)));
    }
    
    @DeleteMapping("/portfolio-files/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePortfolioFile(
            @CurrentUser User user,
            @PathVariable Long id) {
        resumeService.deletePortfolioFile(user, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    // ==================== Profile Image ====================
    
    @PostMapping(value = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadProfileImage(
            @CurrentUser User user,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.uploadProfileImage(user, file)));
    }
    
    // ==================== Helper Methods ====================
    
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
