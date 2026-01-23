package com.pickmeup.domain.job;

import com.pickmeup.domain.common.BaseEntity;
import com.pickmeup.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_applications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class JobApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @Column(length = 100)
    private String position;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type")
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.INTERESTED;

    @Column(length = 50)
    private String salary;

    @Column(length = 50)
    private String bonus;

    @Column(name = "work_hours", length = 50)
    private String workHours;

    @Column(length = 100)
    private String location;

    @Column(length = 50)
    private String distance;

    @Column(name = "job_posting_url", length = 500)
    private String jobPostingUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "applied_at")
    private LocalDate appliedAt;

    @Column(name = "deadline_at")
    private LocalDateTime deadlineAt;

    @Column(length = 7)
    @Builder.Default
    private String color = "#3B82F6";

    // 채용공고 상세 내용 (복붙/OCR/크롤링)
    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    // 회사 정보 (검색 API 결과 캐싱)
    @Column(name = "company_info", columnDefinition = "TEXT")
    private String companyInfo;

    // 요구 기술스택
    @Column(name = "required_skills", length = 500)
    private String requiredSkills;

    // 경력 요구사항
    @Column(name = "experience_required", length = 100)
    private String experienceRequired;

    @OneToMany(mappedBy = "jobApplication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<JobApplicationEvent> events = new ArrayList<>();

    @OneToMany(mappedBy = "jobApplication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<JobApplicationQna> qnas = new ArrayList<>();

    @OneToMany(mappedBy = "jobApplication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<JobApplicationFile> files = new ArrayList<>();

    public void update(String companyName, String position, JobType jobType,
                       ApplicationStatus status, String salary, String bonus,
                       String workHours, String location, String distance,
                       String jobPostingUrl, String notes, LocalDate appliedAt,
                       LocalDateTime deadlineAt, String color,
                       String jobDescription, String companyInfo,
                       String requiredSkills, String experienceRequired) {
        this.companyName = companyName;
        this.position = position;
        this.jobType = jobType;
        this.status = status;
        this.salary = salary;
        this.bonus = bonus;
        this.workHours = workHours;
        this.location = location;
        this.distance = distance;
        this.jobPostingUrl = jobPostingUrl;
        this.notes = notes;
        this.appliedAt = appliedAt;
        this.deadlineAt = deadlineAt;
        this.color = color;
        this.jobDescription = jobDescription;
        this.companyInfo = companyInfo;
        this.requiredSkills = requiredSkills;
        this.experienceRequired = experienceRequired;
    }

    public void updateJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public void updateCompanyInfo(String companyInfo) {
        this.companyInfo = companyInfo;
    }

    public void updateStatus(ApplicationStatus status) {
        this.status = status;
    }
}
