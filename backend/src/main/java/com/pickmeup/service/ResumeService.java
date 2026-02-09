package com.pickmeup.service;

import com.pickmeup.domain.resume.*;
import com.pickmeup.domain.user.User;
import com.pickmeup.dto.resume.ResumeDto.*;
import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import com.pickmeup.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final CertificateRepository certificateRepository;
    private final LanguageRepository languageRepository;
    private final AwardRepository awardRepository;
    private final CoverLetterRepository coverLetterRepository;
    private final PortfolioFileRepository portfolioFileRepository;
    private final ResumeViewRepository resumeViewRepository;
    private final FileUploadService fileUploadService;

    // ==================== Resume CRUD ====================

    @Transactional
    public Response getMyResume(User user) {
        Resume resume = resumeRepository.findByUser(user)
                .orElseGet(() -> createDefaultResume(user));
        return buildResponse(resume);
    }

    public PublicResponse getPublicResume(String slug) {
        Resume resume = resumeRepository.findBySlugAndIsPublicTrue(slug)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "이력서를 찾을 수 없습니다."));
        
        // 조회수 증가 (중복 방지 로직은 Controller에서 IP 체크 후 호출)
        return buildPublicResponse(resume);
    }
    
    @Transactional
    public void recordView(String slug, String viewerIp, String userAgent, String referer) {
        Resume resume = resumeRepository.findBySlug(slug)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        // 같은 IP는 1시간에 1회만 카운트
        if (!resumeViewRepository.existsRecentViewByIp(
                resume, viewerIp, java.time.LocalDateTime.now().minusHours(1))) {
            
            ResumeView view = ResumeView.builder()
                    .resume(resume)
                    .viewerIp(viewerIp)
                    .userAgent(userAgent != null ? userAgent.substring(0, Math.min(200, userAgent.length())) : null)
                    .referer(referer)
                    .viewedAt(java.time.LocalDateTime.now())
                    .build();
            resumeViewRepository.save(view);
            
            resume.incrementViewCount();
        }
    }
    
    @Transactional
    public ViewStatsResponse getViewStats(User user) {
        Resume resume = getOrCreateResume(user);
        java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);
        
        long totalViews = resume.getViewCount() != null ? resume.getViewCount() : 0;
        long recentViews = resumeViewRepository.countRecentViews(resume, thirtyDaysAgo);
        List<Object[]> dailyStats = resumeViewRepository.getDailyViewStats(resume, thirtyDaysAgo);
        
        return ViewStatsResponse.builder()
                .totalViews(totalViews)
                .last30DaysViews(recentViews)
                .dailyViews(dailyStats.stream()
                        .map(row -> new DailyViewStat((java.sql.Date) row[0], ((Number) row[1]).longValue()))
                        .toList())
                .build();
    }

    @Transactional
    public Response updateBasicInfo(User user, UpdateBasicInfoRequest request) {
        Resume resume = getOrCreateResume(user);
        resume.updateBasicInfo(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getBirthDate(),
                request.getGender(),
                request.getAddress(),
                request.getProfileImageUrl(),
                request.getBio()
        );
        resumeRepository.save(resume);  // 명시적 저장
        return buildResponse(resume);
    }

    @Transactional
    public Response updateLinks(User user, UpdateLinksRequest request) {
        Resume resume = getOrCreateResume(user);
        resume.updateLinks(
                request.getGithubUrl(),
                request.getLinkedinUrl(),
                request.getBlogUrl(),
                request.getPortfolioUrl()
        );
        resumeRepository.save(resume);  // 명시적 저장
        return buildResponse(resume);
    }

    @Transactional
    public Response updateFreeContent(User user, UpdateFreeContentRequest request) {
        Resume resume = getOrCreateResume(user);
        resume.updateFreeContent(
                request.getTitle(),
                request.getBio(),
                request.getFreeContent()
        );
        resumeRepository.save(resume);  // 명시적 저장
        return buildResponse(resume);
    }

    @Transactional
    public Response updateSettings(User user, UpdateSettingsRequest request) {
        Resume resume = getOrCreateResume(user);
        
        if (request.getResumeType() != null) {
            resume.setResumeType(request.getResumeType());
        }
        if (request.getIsPublic() != null) {
            resume.setPublic(request.getIsPublic());
        }
        if (request.getSlug() != null) {
            String newSlug = request.getSlug().toLowerCase().replaceAll("[^a-z0-9-]", "-");
            if (!newSlug.equals(resume.getSlug())) {
                if (resumeRepository.existsBySlug(newSlug)) {
                    throw new BusinessException(ErrorCode.SLUG_ALREADY_EXISTS, "이미 사용 중인 URL입니다.");
                }
                resume.setSlug(newSlug);
            }
        }
        resumeRepository.save(resume);  // 명시적 저장
        return buildResponse(resume);
    }

    // ==================== Education CRUD ====================

    @Transactional
    public EducationResponse addEducation(User user, EducationRequest request) {
        Resume resume = getOrCreateResume(user);
        int order = educationRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()).size();
        
        Education education = Education.builder()
                .resume(resume)
                .schoolName(request.getSchoolName())
                .major(request.getMajor())
                .level(request.getLevel())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .graduationStatus(request.getGraduationStatus())
                .gpa(request.getGpa())
                .maxGpa(request.getMaxGpa())
                .displayOrder(order)
                .build();
        
        educationRepository.save(education);
        return EducationResponse.from(education);
    }

    @Transactional
    public EducationResponse updateEducation(User user, Long educationId, EducationRequest request) {
        Resume resume = getOrCreateResume(user);
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!education.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        education.update(
                request.getSchoolName(),
                request.getMajor(),
                request.getLevel(),
                request.getStartDate(),
                request.getEndDate(),
                request.getGraduationStatus(),
                request.getGpa(),
                request.getMaxGpa()
        );
        return EducationResponse.from(education);
    }

    @Transactional
    public void deleteEducation(User user, Long educationId) {
        Resume resume = getOrCreateResume(user);
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!education.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        educationRepository.delete(education);
    }

    // ==================== Experience CRUD ====================

    @Transactional
    public ExperienceResponse addExperience(User user, ExperienceRequest request) {
        Resume resume = getOrCreateResume(user);
        int order = experienceRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()).size();
        
        Experience experience = Experience.builder()
                .resume(resume)
                .company(request.getCompany())
                .position(request.getPosition())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(request.getIsCurrent())
                .description(request.getDescription())
                .displayOrder(order)
                .build();
        
        experienceRepository.save(experience);
        return ExperienceResponse.from(experience);
    }

    @Transactional
    public ExperienceResponse updateExperience(User user, Long experienceId, ExperienceRequest request) {
        Resume resume = getOrCreateResume(user);
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!experience.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        experience.update(
                request.getCompany(),
                request.getPosition(),
                request.getStartDate(),
                request.getEndDate(),
                request.getIsCurrent(),
                request.getDescription()
        );
        return ExperienceResponse.from(experience);
    }

    @Transactional
    public void deleteExperience(User user, Long experienceId) {
        Resume resume = getOrCreateResume(user);
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!experience.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        experienceRepository.delete(experience);
    }

    // ==================== Project CRUD ====================

    @Transactional
    public ProjectResponse addProject(User user, ProjectRequest request) {
        Resume resume = getOrCreateResume(user);
        int order = projectRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()).size();
        
        Project project = Project.builder()
                .resume(resume)
                .title(request.getTitle())
                .description(request.getDescription())
                .detailContent(request.getDetailContent())
                .role(request.getRole())
                .teamSize(request.getTeamSize())
                .achievements(request.getAchievements())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .projectUrl(request.getProjectUrl())
                .githubUrl(request.getGithubUrl())
                .demoUrl(request.getDemoUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .screenshots(request.getScreenshots())
                .techStacks(request.getTechStacks())
                .isFeatured(request.getIsFeatured())
                .displayOrder(order)
                .build();
        
        projectRepository.save(project);
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse updateProject(User user, Long projectId, ProjectRequest request) {
        Resume resume = getOrCreateResume(user);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!project.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        project.update(
                request.getTitle(),
                request.getDescription(),
                request.getDetailContent(),
                request.getRole(),
                request.getTeamSize(),
                request.getAchievements(),
                request.getStartDate(),
                request.getEndDate(),
                request.getProjectUrl(),
                request.getGithubUrl(),
                request.getDemoUrl(),
                request.getThumbnailUrl(),
                request.getScreenshots(),
                request.getTechStacks(),
                request.getIsFeatured()
        );
        return ProjectResponse.from(project);
    }

    @Transactional
    public void deleteProject(User user, Long projectId) {
        Resume resume = getOrCreateResume(user);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!project.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        projectRepository.delete(project);
    }

    // ==================== Skill CRUD ====================

    @Transactional
    public SkillResponse addSkill(User user, SkillRequest request) {
        Resume resume = getOrCreateResume(user);
        int order = skillRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()).size();
        
        Skill skill = Skill.builder()
                .resume(resume)
                .name(request.getName())
                .category(request.getCategory())
                .level(request.getLevel())
                .displayOrder(order)
                .build();
        
        skillRepository.save(skill);
        return SkillResponse.from(skill);
    }

    @Transactional
    public void deleteSkill(User user, Long skillId) {
        Resume resume = getOrCreateResume(user);
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!skill.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        skillRepository.delete(skill);
    }

    // ==================== Certificate CRUD ====================

    @Transactional
    public CertificateResponse addCertificate(User user, CertificateRequest request) {
        Resume resume = getOrCreateResume(user);
        int order = certificateRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()).size();
        
        Certificate certificate = Certificate.builder()
                .resume(resume)
                .name(request.getName())
                .issuingOrganization(request.getIssuingOrganization())
                .acquiredDate(request.getAcquiredDate())
                .grade(request.getGrade())
                .displayOrder(order)
                .build();
        
        certificateRepository.save(certificate);
        return CertificateResponse.from(certificate);
    }

    @Transactional
    public void deleteCertificate(User user, Long certificateId) {
        Resume resume = getOrCreateResume(user);
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!certificate.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        certificateRepository.delete(certificate);
    }

    // ==================== Language CRUD ====================

    @Transactional
    public LanguageResponse addLanguage(User user, LanguageRequest request) {
        Resume resume = getOrCreateResume(user);
        int order = languageRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()).size();
        
        Language language = Language.builder()
                .resume(resume)
                .name(request.getName())
                .testName(request.getTestName())
                .score(request.getScore())
                .acquiredDate(request.getAcquiredDate())
                .speakingLevel(request.getSpeakingLevel())
                .displayOrder(order)
                .build();
        
        languageRepository.save(language);
        return LanguageResponse.from(language);
    }

    @Transactional
    public void deleteLanguage(User user, Long languageId) {
        Resume resume = getOrCreateResume(user);
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!language.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        languageRepository.delete(language);
    }

    // ==================== Award CRUD ====================

    @Transactional
    public AwardResponse addAward(User user, AwardRequest request) {
        Resume resume = getOrCreateResume(user);
        int order = awardRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()).size();
        
        Award award = Award.builder()
                .resume(resume)
                .name(request.getName())
                .organization(request.getOrganization())
                .awardedDate(request.getAwardedDate())
                .description(request.getDescription())
                .displayOrder(order)
                .build();
        
        awardRepository.save(award);
        return AwardResponse.from(award);
    }

    @Transactional
    public void deleteAward(User user, Long awardId) {
        Resume resume = getOrCreateResume(user);
        Award award = awardRepository.findById(awardId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!award.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        awardRepository.delete(award);
    }

    // ==================== CoverLetter CRUD ====================

    @Transactional
    public List<CoverLetterResponse> getCoverLetters(User user) {
        Resume resume = getOrCreateResume(user);
        return coverLetterRepository.findByResumeOrderByDisplayOrderAsc(resume)
                .stream()
                .map(CoverLetterResponse::from)
                .toList();
    }

    @Transactional
    public CoverLetterResponse addCoverLetter(User user, CoverLetterRequest request) {
        Resume resume = getOrCreateResume(user);
        int order = coverLetterRepository.countByResume(resume);
        
        CoverLetter coverLetter = CoverLetter.builder()
                .resume(resume)
                .title(request.getTitle())
                .targetCompany(request.getTargetCompany())
                .content(request.getContent())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .isDefault(order == 0)
                .displayOrder(order)
                .build();
        
        coverLetterRepository.save(coverLetter);
        return CoverLetterResponse.from(coverLetter);
    }

    @Transactional
    public CoverLetterResponse updateCoverLetter(User user, Long coverLetterId, CoverLetterRequest request) {
        Resume resume = getOrCreateResume(user);
        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!coverLetter.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        coverLetter.update(
                request.getTitle(),
                request.getTargetCompany(),
                request.getContent(),
                request.getIsPublic()
        );
        return CoverLetterResponse.from(coverLetter);
    }

    @Transactional
    public void deleteCoverLetter(User user, Long coverLetterId) {
        Resume resume = getOrCreateResume(user);
        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!coverLetter.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        coverLetterRepository.delete(coverLetter);
    }

    // ==================== PortfolioFile CRUD ====================

    @Transactional
    public List<PortfolioFileResponse> getPortfolioFiles(User user) {
        Resume resume = getOrCreateResume(user);
        return portfolioFileRepository.findByResumeOrderByDisplayOrderAsc(resume)
                .stream()
                .map(PortfolioFileResponse::from)
                .toList();
    }

    @Transactional
    public PortfolioFileResponse addPortfolioFile(User user, PortfolioFileRequest request, 
                                                   org.springframework.web.multipart.MultipartFile file) {
        Resume resume = getOrCreateResume(user);
        int order = portfolioFileRepository.countByResume(resume);
        
        String fileUrl = null;
        String originalFilename = null;
        Long fileSize = null;
        String mimeType = null;
        
        if (file != null && !file.isEmpty()) {
            if (request.getFileType() == PortfolioFileType.PDF) {
                fileUrl = fileUploadService.uploadPdf(file, "portfolio/" + resume.getId());
            } else if (request.getFileType() == PortfolioFileType.IMAGE) {
                fileUrl = fileUploadService.uploadImage(file, "portfolio/" + resume.getId());
            }
            originalFilename = file.getOriginalFilename();
            fileSize = file.getSize();
            mimeType = file.getContentType();
        }
        
        PortfolioFile portfolioFile = PortfolioFile.builder()
                .resume(resume)
                .fileType(request.getFileType())
                .title(request.getTitle())
                .description(request.getDescription())
                .fileUrl(fileUrl)
                .originalFilename(originalFilename)
                .fileSize(fileSize)
                .mimeType(mimeType)
                .externalUrl(request.getExternalUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .displayOrder(order)
                .build();
        
        portfolioFileRepository.save(portfolioFile);
        return PortfolioFileResponse.from(portfolioFile);
    }

    @Transactional
    public PortfolioFileResponse updatePortfolioFile(User user, Long portfolioFileId, PortfolioFileRequest request) {
        Resume resume = getOrCreateResume(user);
        PortfolioFile portfolioFile = portfolioFileRepository.findById(portfolioFileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!portfolioFile.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        portfolioFile.update(
                request.getTitle(),
                request.getDescription(),
                request.getIsPublic(),
                request.getIsFeatured()
        );
        return PortfolioFileResponse.from(portfolioFile);
    }

    @Transactional
    public void deletePortfolioFile(User user, Long portfolioFileId) {
        Resume resume = getOrCreateResume(user);
        PortfolioFile portfolioFile = portfolioFileRepository.findById(portfolioFileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        
        if (!portfolioFile.getResume().getId().equals(resume.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        
        // 파일 삭제
        if (portfolioFile.getFileUrl() != null) {
            fileUploadService.deleteFile(portfolioFile.getFileUrl());
        }
        
        portfolioFileRepository.delete(portfolioFile);
    }

    // ==================== Profile Image ====================
    
    @Transactional
    public String uploadProfileImage(User user, org.springframework.web.multipart.MultipartFile file) {
        Resume resume = getOrCreateResume(user);
        
        // 기존 이미지 삭제
        if (resume.getProfileImageUrl() != null) {
            fileUploadService.deleteFile(resume.getProfileImageUrl());
        }
        
        String imageUrl = fileUploadService.uploadImage(file, "profile/" + resume.getId());
        resume.updateBasicInfo(
                resume.getName(),
                resume.getEmail(),
                resume.getPhone(),
                resume.getBirthDate(),
                resume.getGender(),
                resume.getAddress(),
                imageUrl,
                resume.getBio()  // 기존 bio 유지
        );
        
        // 명시적으로 저장
        resumeRepository.save(resume);
        
        return imageUrl;
    }

    // ==================== Helper Methods ====================

    private Resume getOrCreateResume(User user) {
        return resumeRepository.findByUser(user)
                .orElseGet(() -> createDefaultResume(user));
    }

    @Transactional
    protected Resume createDefaultResume(User user) {
        String slug = generateUniqueSlug(user.getName());
        Resume resume = Resume.builder()
                .user(user)
                .name(user.getName())
                .email(user.getEmail())
                .resumeType(ResumeType.SARAMIN)
                .isPublic(false)
                .slug(slug)
                .build();
        return resumeRepository.save(resume);
    }

    private String generateUniqueSlug(String name) {
        String baseSlug = name.toLowerCase().replaceAll("[^a-z0-9가-힣]", "-");
        String slug = baseSlug;
        int counter = 1;
        while (resumeRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }

    private Response buildResponse(Resume resume) {
        return Response.from(
                resume,
                educationRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()),
                experienceRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()),
                projectRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()),
                skillRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()),
                certificateRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()),
                languageRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()),
                awardRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId())
        );
    }

    private PublicResponse buildPublicResponse(Resume resume) {
        return PublicResponse.from(
                resume,
                educationRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()),
                experienceRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()),
                projectRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()),
                skillRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()),
                certificateRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()),
                languageRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId()),
                awardRepository.findByResumeIdOrderByDisplayOrderAsc(resume.getId())
        );
    }
}
