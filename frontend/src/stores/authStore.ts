/**
 * 인증 상태 관리 (Zustand Store)
 * 
 * Zustand란?
 * - 가벼운 전역 상태 관리 라이브러리
 * - Redux보다 훨씬 간단하고 보일러플레이트 적음
 * - React 외부에서도 상태 접근 가능 (axios interceptor 등)
 * 
 * 저장 데이터:
 * - user: 로그인한 사용자 정보
 * - accessToken: API 호출용 JWT
 * - refreshToken: 토큰 갱신용 JWT
 * - isAuthenticated: 로그인 여부
 * 
 * persist 미들웨어:
 * - 상태를 localStorage에 자동 저장
 * - 새로고침해도 로그인 유지
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 사용자 타입 정의
 */
interface User {
  id: number
  email: string
  name: string
  profileImageUrl?: string
  userType?: string        // "JOB_SEEKER" | "RECRUITER"
  companyName?: string     // 헤드헌터일 때만
}

/**
 * 인증 상태 타입 정의
 * 
 * 상태(State) + 액션(Actions)
 */
interface AuthState {
  // ===== State (상태) =====
  user: User | null              // 로그인한 사용자 (없으면 null)
  accessToken: string | null     // API 호출용 토큰
  refreshToken: string | null    // 토큰 갱신용 토큰
  isAuthenticated: boolean       // 로그인 여부
  
  // ===== Actions (상태 변경 함수) =====
  setAuth: (user: User, accessToken: string, refreshToken: string) => void  // 로그인
  logout: () => void             // 로그아웃
}

/**
 * Zustand Store 생성
 * 
 * create<타입>(): 타입이 지정된 스토어 생성
 * persist(): localStorage에 상태 저장하는 미들웨어
 * 
 * 사용법:
 * 
 * // 컴포넌트에서 상태 읽기
 * const user = useAuthStore((state) => state.user)
 * const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
 * 
 * // 액션 실행
 * const setAuth = useAuthStore((state) => state.setAuth)
 * setAuth(userData, accessToken, refreshToken)
 * 
 * // 컴포넌트 외부에서 상태 접근 (axios interceptor 등)
 * const token = useAuthStore.getState().accessToken
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ===== 초기 상태 =====
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      /**
       * 로그인 - 인증 정보 저장
       * 
       * set(): 상태 업데이트 함수
       * 전달한 객체로 상태가 병합됨 (기존 상태 유지 + 새 값 덮어쓰기)
       */
      setAuth: (user, accessToken, refreshToken) =>
        set({ 
          user, 
          accessToken, 
          refreshToken, 
          isAuthenticated: true 
        }),
      
      /**
       * 로그아웃 - 인증 정보 삭제
       * 
       * 모든 인증 관련 상태를 초기화
       */
      logout: () =>
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false 
        }),
    }),
    {
      name: 'auth-storage',  // localStorage 키 이름
      // localStorage['auth-storage']에 JSON으로 저장됨
    }
  )
)
