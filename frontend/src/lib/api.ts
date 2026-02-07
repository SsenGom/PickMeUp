/**
 * Axios API 클라이언트 설정
 * 
 * Axios: HTTP 클라이언트 라이브러리
 * - fetch보다 편리한 API (자동 JSON 변환, 에러 처리 등)
 * - Interceptor로 요청/응답 가로채기 가능
 * 
 * 주요 기능:
 * 1. 요청 시 자동으로 JWT 토큰 추가
 * 2. 401 에러 시 자동으로 토큰 갱신 시도
 * 3. 토큰 갱신 실패 시 로그아웃 처리
 */
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

/**
 * Axios 인스턴스 생성
 * 
 * baseURL: 모든 요청 URL 앞에 자동 추가
 *   api.get('/tasks') → GET /api/tasks
 * 
 * Vite 프록시 설정으로 /api → localhost:8080으로 전달됨
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',  // JSON 요청
  },
})

/**
 * Request Interceptor - 요청 가로채기
 * 
 * 모든 API 요청 전에 실행
 * JWT 토큰을 Authorization 헤더에 자동 추가
 * 
 * 흐름:
 * 1. api.get('/tasks') 호출
 * 2. Interceptor 실행 → 토큰 추가
 * 3. 실제 요청: GET /api/tasks + Authorization: Bearer {token}
 */
api.interceptors.request.use((config) => {
  // Zustand 스토어에서 토큰 가져오기 (컴포넌트 외부에서 접근)
  const token = useAuthStore.getState().accessToken
  
  if (token) {
    // Authorization 헤더에 Bearer 토큰 추가
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})

/**
 * Response Interceptor - 응답 가로채기
 * 
 * 모든 API 응답 후에 실행
 * 
 * 성공 응답: 그대로 반환
 * 401 에러 (토큰 만료): 자동 토큰 갱신 시도
 * 
 * 토큰 갱신 흐름:
 * 1. API 요청 → 401 응답 (Access Token 만료)
 * 2. Refresh Token으로 새 Access Token 발급 요청
 * 3. 성공: 새 토큰 저장 → 원래 요청 재시도
 * 4. 실패: 로그아웃 → 로그인 페이지로 이동
 */
api.interceptors.response.use(
  // 성공 응답: 그대로 반환
  (response) => response,
  
  // 에러 응답: 처리 로직
  async (error) => {
    const originalRequest = error.config
    
    // 401 에러 (Unauthorized) && 아직 재시도 안 함
    // _retry: 무한 재시도 방지용 플래그
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true  // 재시도 표시
      
      const refreshToken = useAuthStore.getState().refreshToken
      
      if (refreshToken) {
        try {
          // Refresh Token으로 새 토큰 발급 요청
          // 주의: api 인스턴스 말고 axios 직접 사용 (interceptor 무한루프 방지)
          const { data } = await axios.post('/api/auth/refresh', { refreshToken })
          
          // 새 토큰 저장
          useAuthStore.getState().setAuth(
            data.data.user, 
            data.data.accessToken, 
            data.data.refreshToken
          )
          
          // 원래 요청에 새 토큰 적용 후 재시도
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
          return api(originalRequest)
          
        } catch {
          // 토큰 갱신 실패 (Refresh Token도 만료)
          // 로그아웃 처리 후 로그인 페이지로
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
      }
    }
    
    // 다른 에러는 그대로 reject (호출한 곳에서 catch)
    return Promise.reject(error)
  }
)

export default api
export { api }  // named export도 추가

/**
 * 사용 예시:
 * 
 * // default import (권장)
 * import api from '@/lib/api'
 * 
 * // named import (호환성)
 * import { api } from '@/lib/api'
 * 
 * // GET 요청
 * const response = await api.get('/tasks')
 * const tasks = response.data.data
 * 
 * // POST 요청
 * const response = await api.post('/tasks', { title: '새 할일' })
 * 
 * // PUT 요청
 * await api.put('/tasks/1', { title: '수정된 할일' })
 * 
 * // DELETE 요청
 * await api.delete('/tasks/1')
 */
