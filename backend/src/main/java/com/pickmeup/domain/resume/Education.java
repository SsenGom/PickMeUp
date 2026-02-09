package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resume_educations")
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
    
    // 학교명
    @Column(nullable = false, length = 100)
    private String schoolName;
    
    // 전공
    @Column(length = 100)
    private String major;
    
    // 학위 (고졸, 전문학사, 학사, 석사, 박사)
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EducationLevel level;
    
    // 입학년월
    @Column(name = "start_date", length = 10)
    private String startDate;
    
    // 졸업년월
    @Column(name = "end_date", length = 10)
    private String endDate;
    
    // 졸업상태 (졸업, 재학, 휴학, 중퇴, 졸업예정)
    @Enumerated(EnumType.STRING)
    @Column(name = "graduation_status", length = 20)
    private GraduationStatus graduationStatus;
    
    // 학점
    @Column(length = 10)
    private String gpa;
    
    // 최대학점
    @Column(name = "max_gpa", length = 10)
    private String maxGpa;
    
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
    
    public void update(String schoolName, String major, EducationLevel level,
                       String startDate, String endDate, GraduationStatus graduationStatus,
                       String gpa, String maxGpa) {
        this.schoolName = schoolName;
        this.major = major;
        this.level = level;
        this.startDate = startDate;
        this.endDate = endDate;
        this.graduationStatus = graduationStatus;
        this.gpa = gpa;
        this.maxGpa = maxGpa;
    }
    
    public void setDisplayOrder(int order) {
        this.displayOrder = order;
    }
}
