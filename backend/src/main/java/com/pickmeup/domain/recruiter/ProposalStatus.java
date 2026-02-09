package com.pickmeup.domain.recruiter;

/**
 * 제안 상태
 */
public enum ProposalStatus {
    PENDING,      // 대기 중
    ACCEPTED,     // 수락됨 (채팅방 오픈)
    REJECTED,     // 거절됨
    EXPIRED       // 만료됨 (30일 경과)
}
