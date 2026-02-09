package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 이력서 조회 기록 엔티티
 * 
 * 누가, 언제 이력서를 조회했는지 트래킹
 * - 채용담당자 분석용
 * - 조회수 통계
 */
@Entity
@Table(name = "resume_views", indexes = {
    @Index(name = "idx_resume_views_resume", columnList = "resume_id"),
    @Index(name = "idx_resume_views_viewed_at", columnList = "viewed_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ResumeView {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;
    
    // 조회자 IP (익명화)
    @Column(name = "viewer_ip", length = 50)
    private String viewerIp;
    
    // User-Agent 요약
    @Column(name = "user_agent", length = 200)
    private String userAgent;
    
    // Referer (어디서 왔는지)
    @Column(length = 500)
    private String referer;
    
    // 조회 시간
    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt;
    
    // 체류 시간 (초) - 나중에 JS로 측정
    @Column(name = "duration_seconds")
    private Integer durationSeconds;
    
    // 국가/지역 (GeoIP)
    @Column(length = 50)
    private String country;
    
    @Column(length = 100)
    private String city;
}
