package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "educations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Education extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(name = "school_name", nullable = false, length = 100)
    private String schoolName;

    @Column(length = 100)
    private String major;

    // 교육기관 종류: SCHOOL(학교), TRAINING(교육/훈련), ONLINE(온라인)
    @Column(name = "institution_type", length = 20)
    @Builder.Default
    private String institutionType = "SCHOOL";

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EducationLevel level;

    @Enumerated(EnumType.STRING)
    @Column(name = "graduation_status", length = 20)
    private GraduationStatus graduationStatus;

    @Column(name = "start_date", length = 20)
    private String startDate;

    @Column(name = "end_date", length = 20)
    private String endDate;

    @Column(name = "gpa", length = 10)
    private String gpa;

    @Column(name = "max_gpa", length = 10)
    private String maxGpa;

    // 교육/훈련 기관용 추가 필드
    @Column(name = "course_name", length = 200)
    private String courseName;

    @Column(name = "instructor", length = 100)
    private String instructor;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
}
