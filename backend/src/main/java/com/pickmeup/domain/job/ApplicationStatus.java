package com.pickmeup.domain.job;

public enum ApplicationStatus {
    INTERESTED,      // 관심
    APPLIED,         // 지원완료
    DOCUMENT_PASSED, // 서류통과
    FIRST_INTERVIEW, // 1차면접
    SECOND_INTERVIEW,// 2차면접
    FINAL_PASSED,    // 최종합격
    REJECTED         // 불합격
}
