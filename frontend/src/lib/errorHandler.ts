/**
 * 에러 핸들링 유틸리티
 */

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

/**
 * API 에러 메시지 추출
 */
export function getErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return '알 수 없는 오류가 발생했습니다';
}

/**
 * 헤드헌터 전용 에러 메시지
 */
export const RECRUITER_ERRORS = {
  NOT_RECRUITER: '헤드헌터 권한이 필요합니다',
  ALREADY_PICKED: '이미 픽한 이력서입니다',
  CANNOT_PICK_OWN_RESUME: '자신의 이력서는 픽할 수 없습니다',
  RESUME_NOT_PUBLIC: '공개되지 않은 이력서입니다',
  PROPOSAL_ALREADY_RESPONDED: '이미 응답한 제안입니다',
  PROPOSAL_EXPIRED: '만료된 제안입니다',
};

/**
 * 친화적인 에러 메시지로 변환
 */
export function getFriendlyErrorMessage(errorMessage: string): string {
  const friendlyMessages: Record<string, string> = {
    'Network Error': '네트워크 연결을 확인해주세요',
    'timeout': '요청 시간이 초과되었습니다',
    'Unauthorized': '로그인이 필요합니다',
    'Forbidden': '권한이 없습니다',
    'Not Found': '요청한 정보를 찾을 수 없습니다',
  };

  for (const [key, value] of Object.entries(friendlyMessages)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  return errorMessage;
}
