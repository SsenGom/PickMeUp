/**
 * 유틸리티 함수 모음
 * 
 * 여러 컴포넌트에서 공통으로 사용하는 함수들
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 클래스명 병합 유틸리티
 * 
 * Tailwind CSS에서 조건부 클래스를 깔끔하게 적용하기 위한 함수
 * 
 * clsx: 조건부 클래스명 조합
 *   clsx('a', false && 'b', 'c') → 'a c'
 * 
 * twMerge: Tailwind 클래스 충돌 해결
 *   twMerge('px-2 px-4') → 'px-4' (나중 것이 우선)
 * 
 * 사용 예시:
 * <div className={cn(
 *   'base-class',
 *   isActive && 'active-class',
 *   isDisabled && 'disabled-class'
 * )} />
 * 
 * @param inputs - 클래스명들 (문자열, 객체, 배열, 조건식)
 * @returns 병합된 클래스명 문자열
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜 포맷팅 (한국어)
 * 
 * "2024-01-15" → "2024년 1월 15일"
 * 
 * Intl.DateTimeFormat: 브라우저 내장 국제화 API
 * 로케일에 맞는 날짜/시간 포맷팅 지원
 * 
 * @param date - 날짜 문자열 또는 Date 객체
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',   // "2024"
    month: 'long',     // "1월"
    day: 'numeric',    // "15"
  }).format(new Date(date))
}

/**
 * 날짜+시간 포맷팅 (한국어)
 * 
 * "2024-01-15T10:30:00" → "2024년 1월 15일 오전 10:30"
 */
export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',    // "1월"
    day: 'numeric',
    hour: '2-digit',   // "10"
    minute: '2-digit', // "30"
  }).format(new Date(date))
}

/**
 * 상대 시간 포맷팅
 * 
 * 현재 시간과의 차이를 "~전" 형식으로 표시
 * 
 * 예시:
 * - 30초 전 → "방금 전"
 * - 5분 전 → "5분 전"
 * - 3시간 전 → "3시간 전"
 * - 2일 전 → "2일 전"
 * - 7일 이상 → "2024년 1월 8일"
 * 
 * SNS, 채팅 등에서 많이 사용하는 패턴
 * 
 * @param date - 대상 날짜
 * @returns 상대 시간 문자열
 */
export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()  // 밀리초 차이
  
  const minutes = Math.floor(diff / 60000)       // 1분 = 60,000ms
  const hours = Math.floor(diff / 3600000)       // 1시간 = 3,600,000ms
  const days = Math.floor(diff / 86400000)       // 1일 = 86,400,000ms
  
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  
  // 7일 이상이면 절대 날짜 표시
  return formatDate(date)
}
