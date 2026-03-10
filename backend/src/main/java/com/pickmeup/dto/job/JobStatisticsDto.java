package com.pickmeup.dto.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class JobStatisticsDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private OverallStats overallStats;
        private StatusStats statusStats;
        private List<MonthlyTrend> monthlyTrends;
        private AverageTimeline averageTimeline;
        private SuccessRate successRate;
        private List<Object> jobTypeStats;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OverallStats {
        private long totalApplications;
        private long activeApplications;
        private long completedApplications;
        private LocalDate firstApplicationDate;
        private LocalDate lastApplicationDate;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusStats {
        private long interested;
        private long applied;
        private long documentPassed;
        private long interviewing;
        private long finalPassed;
        private long rejected;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyTrend {
        private String month;
        private long applicationCount;
        private long passedCount;
        private long rejectedCount;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AverageTimeline {
        private Double daysToDocumentResult;
        private Double daysToInterview;
        private Double daysToFinalResult;
        private Double totalDaysToComplete;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SuccessRate {
        private double documentPassRate;
        private double interviewPassRate;
        private double overallPassRate;
        private long totalApplied;
        private long documentPassed;
        private long finalPassed;
    }
}
