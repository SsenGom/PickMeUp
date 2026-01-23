package com.pickmeup.domain.job;

public enum JobEventType {
    DEADLINE,           // 서류 마감
    DOCUMENT_RESULT,    // 서류 발표
    FIRST_INTERVIEW,    // 1차 면접
    SECOND_INTERVIEW,   // 2차 면접
    FINAL_INTERVIEW,    // 최종 면접
    FINAL_RESULT,       // 최종 발표
    ONBOARDING,         // 입사일
    OTHER               // 기타
}
