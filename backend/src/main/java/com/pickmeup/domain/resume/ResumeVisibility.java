package com.pickmeup.domain.resume;

/**
 * 이력서 공개 범위
 */
public enum ResumeVisibility {
    PUBLIC,      // 전체 공개 (검색 가능)
    LINK_ONLY,   // 링크가 있는 사람만
    PRIVATE      // 비공개
}
