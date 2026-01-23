/**
 * Tailwind CSS 설정 파일
 * 
 * Tailwind CSS란?
 * - 유틸리티 우선(Utility-First) CSS 프레임워크
 * - 미리 정의된 클래스로 스타일링 (className="flex items-center")
 * - 컴포넌트 CSS 파일 작성 불필요
 * 
 * 기존 방식:
 * .card { display: flex; align-items: center; padding: 16px; }
 * <div className="card">
 * 
 * Tailwind 방식:
 * <div className="flex items-center p-4">
 * 
 * 장점:
 * - CSS 파일 관리 부담 없음
 * - 일관된 디자인 시스템
 * - 반응형 쉬움 (sm:, md:, lg: 접두사)
 * - 상태별 스타일 쉬움 (hover:, focus:, disabled:)
 */

/** @type {import('tailwindcss').Config} */
export default {
  /**
   * content: Tailwind 클래스를 사용하는 파일 경로
   * 
   * 이 파일들에서 사용된 클래스만 최종 CSS에 포함됨
   * 사용하지 않는 클래스는 자동 제거 (Tree-shaking)
   * → 작은 번들 사이즈
   */
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // src 폴더의 모든 JS/TS 파일
  ],
  
  /**
   * theme: 디자인 토큰 설정
   * 
   * extend: 기본 테마에 추가 (덮어쓰지 않고)
   */
  theme: {
    extend: {
      /**
       * 커스텀 색상 팔레트
       * 
       * primary: 메인 브랜드 컬러
       * 
       * 사용: bg-primary-600, text-primary-500, border-primary-200
       * 
       * 숫자가 클수록 진한 색
       * 50: 가장 연한
       * 900: 가장 진한
       */
      colors: {
        primary: {
          50: '#eff6ff',   // 배경색, hover 배경
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // 기본색
          600: '#2563eb',  // 버튼, 강조
          700: '#1d4ed8',  // hover 상태
          800: '#1e40af',
          900: '#1e3a8a',  // 텍스트
        },
      },
    },
  },
  
  /**
   * plugins: Tailwind 플러그인
   * 
   * 예: @tailwindcss/forms (폼 스타일링)
   *     @tailwindcss/typography (글 스타일링)
   */
  plugins: [],
}

/**
 * 자주 쓰는 Tailwind 클래스 정리:
 * 
 * ===== 레이아웃 =====
 * flex, flex-col, items-center, justify-between
 * grid, grid-cols-2, gap-4
 * 
 * ===== 여백 =====
 * p-4 (padding: 1rem)
 * px-4 (padding-left/right)
 * py-2 (padding-top/bottom)
 * m-4 (margin: 1rem)
 * space-y-4 (자식 간격 세로)
 * 
 * ===== 크기 =====
 * w-full, h-screen, max-w-md
 * w-64 (16rem), h-10 (2.5rem)
 * 
 * ===== 텍스트 =====
 * text-sm, text-lg, text-2xl
 * font-bold, font-medium
 * text-gray-600, text-primary-600
 * 
 * ===== 배경/테두리 =====
 * bg-white, bg-gray-100
 * border, border-gray-200
 * rounded-lg, rounded-full
 * shadow-sm, shadow-lg
 * 
 * ===== 상태 =====
 * hover:bg-gray-100
 * focus:ring-2
 * disabled:opacity-50
 * 
 * ===== 반응형 =====
 * sm: (640px 이상)
 * md: (768px 이상)
 * lg: (1024px 이상)
 * 
 * 예: hidden lg:block (데스크톱에서만 표시)
 *     text-sm md:text-base (모바일: 작게, 태블릿 이상: 기본)
 */
