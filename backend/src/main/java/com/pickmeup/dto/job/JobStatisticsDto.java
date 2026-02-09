package com.pickmeup.dto.job;

import com.pickmeup.domain.job.ApplicationStatus;
import com.pickmeup.domain.job.JobType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 취업 활동 통계 DTO
 */
public class JobStatisticsDto {

    /**
     * 전체 통계 응답
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        // 전체 요약
        private OverallStats overallStats;
        
        // 상태별 통계
        private StatusStats statusStats;
        
        // 월별 추이
        private List<MonthlyTrend> monthlyTrends;
        
        // 평균 소요 시간
        private AverageTimeline averageTimeline;
        
        // 합격률
        private SuccessRate successRate;
        
        // 직무별 통계 (옵션)
        private List<JobTypeStats> jobTypeStats;
    }

    /**
     * 전체 통계 요약
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OverallStats {
        private long totalApplications;           // 총 지원 수
        private long activeApplications;          // 진행 중인 지원
        private long completedApplications;       // 완료된 지원 (합격/불합격)
        private LocalDate firstApplicationDate;   // 첫 지원 날짜
        private LocalDate lastApplicationDate;    // 최근 지원 날짜
    }

    /**
     * 상태별 통계
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusStats {
        private long interested;        // 관심 있음
        private long applied;           // 지원 완료
        private long documentPassed;    // 서류 합격
        private long interviewing;      // 면접 진행
        private long finalPassed;       // 최종 합격
        private long rejected;          // 불합격
        
        /**
         * 상태별 비율 계산
         */
        public Map<ApplicationStatus, Double> getPercentages() {
            long total = interested + applied + documentPassed + interviewing + finalPassed + rejected;
            if (total == 0) return Map.of();
            
            return Map.of(
                ApplicationStatus.INTERESTED, (double) interested / total * 100,
                ApplicationStatus.APPLIED, (double) applied / total * 100,
                ApplicationStatus.DOCUMENT_PASSED, (double) documentPassed / total * 100,
                ApplicationStatus.INTERVIEWING, (double) interviewing / total * 100,
                ApplicationStatus.FINAL_PASSED, (double) finalPassed / total * 100,
                ApplicationStatus.REJECTED, (double) rejected / total * 100
            );
        }
    }

    /**
     * 월별 추이
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyTrend {
        private String month;              // "2025-01" 형식
        private long applicationCount;     // 해당 월 지원 수
        private long passedCount;          // 해당 월 합격 수 (서류 이상)
        private long rejectedCount;        // 해당 월 불합격 수
    }

    /**
     * 평균 소요 시간
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AverageTimeline {
        private Double daysToDocumentResult;    // 지원 → 서류 결과 (평균 일수)
        private Double daysToInterview;         // 서류 합격 → 면접 (평균 일수)
        private Double daysToFinalResult;       // 면접 → 최종 결과 (평균 일수)
        private Double totalDaysToComplete;     // 지원 → 최종 결과 (평균 일수)
    }

    /**
     * 합격률
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SuccessRate {
        private double documentPassRate;    // 서류 합격률 (%)
        private double interviewPassRate;   // 면접 합격률 (%)
        private double overallPassRate;     // 전체 합격률 (최종 합격 / 전체 지원)
        
        private long totalApplied;          // 분모: 전체 지원 수
        private long documentPassed;        // 분자: 서류 합격 수
        private long finalPassed;           // 분자: 최종 합격 수
    }

    /**
     * 직무별 통계 (옵션)
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobTypeStats {
        private JobType jobType;
        private long count;
        private double passRate;
    }

    /**
     * 기간별 통계 요청
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private LocalDate startDate;    // 시작일 (옵션, 기본: 전체)
        private LocalDate endDate;      // 종료일 (옵션, 기본: 오늘)
    }

    /**
     * 월별 지원 현황 (차트용 간단한 형태)
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyChartData {
        private List<String> labels;        // ["2024-10", "2024-11", "2024-12"]
        private List<Long> applications;    // [5, 8, 12]
        private List<Long> passed;          // [2, 4, 6]
        private List<Long> rejected;        // [1, 2, 3]
    }
}
