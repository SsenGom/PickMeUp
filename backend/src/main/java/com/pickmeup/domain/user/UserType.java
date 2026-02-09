package com.pickmeup.domain.user;

/**
 * 사용자 타입
 * 
 * JOB_SEEKER: 구직자 (기존 사용자)
 * RECRUITER: 헤드헌터/기업 채용담당자 (신규)
 */
public enum UserType {
    JOB_SEEKER,     // 구직자 - 이력서 작성, 채용공고 지원
    RECRUITER       // 헤드헌터 - 이력서 스와이프, 컨택 제안
}
