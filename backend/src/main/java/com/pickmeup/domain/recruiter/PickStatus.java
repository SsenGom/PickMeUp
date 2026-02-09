package com.pickmeup.domain.recruiter;

/**
 * Pick 상태
 */
public enum PickStatus {
    PICKED,      // 픽만 함 (초기 상태)
    CONTACTED,   // 컨택/제안 보냄
    REJECTED     // 나중에 패스함
}
