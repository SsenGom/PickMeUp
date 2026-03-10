package com.pickmeup.controller;

import com.pickmeup.config.security.CurrentUser;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.common.ApiResponse;
import com.pickmeup.dto.resume.ResumeDto.*;
import com.pickmeup.service.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @GetMapping
    public ApiResponse<Response> getMyResume(@CurrentUser User user) {
        return ApiResponse.success(resumeService.getMyResume(user));
    }

    @GetMapping("/public/{slug}")
    public ApiResponse<PublicResponse> getPublicResume(@PathVariable String slug) {
        return ApiResponse.success(resumeService.getPublicResume(slug));
    }

    @PutMapping("/settings")
    public ApiResponse<Response> updateSettings(@CurrentUser User user, @RequestBody UpdateSettingsRequest req) {
        return ApiResponse.success(resumeService.updateSettings(user, req));
    }

    @PutMapping("/basic-info")
    public ApiResponse<Response> updateBasicInfo(@CurrentUser User user, @RequestBody UpdateBasicInfoRequest req) {
        return ApiResponse.success(resumeService.updateBasicInfo(user, req));
    }

    @PutMapping("/links")
    public ApiResponse<Response> updateLinks(@CurrentUser User user, @RequestBody UpdateLinksRequest req) {
        return ApiResponse.success(resumeService.updateLinks(user, req));
    }

    @PutMapping("/free-content")
    public ApiResponse<Response> updateFreeContent(@CurrentUser User user, @RequestBody UpdateFreeContentRequest req) {
        return ApiResponse.success(resumeService.updateFreeContent(user, req));
    }

    // ─── 학력 ──────────────────────────────────────────────
    @PostMapping("/educations")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Response> addEducation(@CurrentUser User user, @Valid @RequestBody EducationRequest req) {
        return ApiResponse.success(resumeService.addEducation(user, req));
    }

    @PutMapping("/educations/{id}")
    public ApiResponse<Response> updateEducation(@CurrentUser User user, @PathVariable Long id, @Valid @RequestBody EducationRequest req) {
        return ApiResponse.success(resumeService.updateEducation(user, id, req));
    }

    @DeleteMapping("/educations/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEducation(@CurrentUser User user, @PathVariable Long id) {
        resumeService.deleteEducation(user, id);
    }

    // ─── 경력 ──────────────────────────────────────────────
    @PostMapping("/experiences")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Response> addExperience(@CurrentUser User user, @Valid @RequestBody ExperienceRequest req) {
        return ApiResponse.success(resumeService.addExperience(user, req));
    }

    @PutMapping("/experiences/{id}")
    public ApiResponse<Response> updateExperience(@CurrentUser User user, @PathVariable Long id, @Valid @RequestBody ExperienceRequest req) {
        return ApiResponse.success(resumeService.updateExperience(user, id, req));
    }

    @DeleteMapping("/experiences/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExperience(@CurrentUser User user, @PathVariable Long id) {
        resumeService.deleteExperience(user, id);
    }

    // ─── 프로젝트 ──────────────────────────────────────────
    @PostMapping("/projects")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Response> addProject(@CurrentUser User user, @Valid @RequestBody ProjectRequest req) {
        return ApiResponse.success(resumeService.addProject(user, req));
    }

    @PutMapping("/projects/{id}")
    public ApiResponse<Response> updateProject(@CurrentUser User user, @PathVariable Long id, @Valid @RequestBody ProjectRequest req) {
        return ApiResponse.success(resumeService.updateProject(user, id, req));
    }

    @DeleteMapping("/projects/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(@CurrentUser User user, @PathVariable Long id) {
        resumeService.deleteProject(user, id);
    }

    // ─── 기술 ──────────────────────────────────────────────
    @PostMapping("/skills")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Response> addSkill(@CurrentUser User user, @Valid @RequestBody SkillRequest req) {
        return ApiResponse.success(resumeService.addSkill(user, req));
    }

    @DeleteMapping("/skills/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSkill(@CurrentUser User user, @PathVariable Long id) {
        resumeService.deleteSkill(user, id);
    }

    // ─── 파일 업로드 ────────────────────────────────────────
    @PostMapping(value = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, String>> uploadProfileImage(@CurrentUser User user, @RequestParam("file") MultipartFile file) {
        return ApiResponse.success(Map.of("url", resumeService.uploadProfileImage(user, file)));
    }

    @PostMapping(value = "/project-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, String>> uploadProjectImage(@CurrentUser User user, @RequestParam("file") MultipartFile file) {
        return ApiResponse.success(Map.of("url", resumeService.uploadProjectImage(user, file)));
    }

    // ─── AI 다이어그램 생성 (레거시, 미사용) ────────────────────
    @PostMapping("/generate-diagram")
    public ApiResponse<Map<String, Object>> generateDiagram(@CurrentUser User user, @RequestBody Map<String, String> req) {
        return ApiResponse.success(resumeService.generateDiagram(user, req.get("description"), req.getOrDefault("type", "flowchart")));
    }

    @GetMapping("/diagram-usage")
    public ApiResponse<Map<String, Object>> getDiagramUsage(@CurrentUser User user) {
        return ApiResponse.success(resumeService.getDiagramUsage(user));
    }

    // ─── AI 내용 정리 ────────────────────────────────────────
    @PostMapping("/refine-content")
    public ApiResponse<Map<String, Object>> refineContent(@CurrentUser User user, @RequestBody Map<String, String> req) {
        return ApiResponse.success(resumeService.refineContent(user, req.get("content"), req.get("projectTitle")));
    }

    @GetMapping("/refine-usage")
    public ApiResponse<Map<String, Object>> getRefineUsage(@CurrentUser User user) {
        return ApiResponse.success(resumeService.getRefineUsage(user));
    }
}
