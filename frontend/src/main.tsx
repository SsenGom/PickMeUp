/**
 * React 애플리케이션 진입점 (Entry Point)
 * 
 * index.html의 <div id="root"></div>에 React 앱을 렌더링
 * 
 * 구조:
 * React.StrictMode
 *   └── QueryClientProvider (React Query - 서버 상태 관리)
 *         └── BrowserRouter (React Router - 라우팅)
 *               ├── App (메인 앱 컴포넌트)
 *               └── Toaster (알림 토스트)
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

/**
 * React Query 클라이언트 설정
 * 
 * React Query란?
 * - 서버 상태(API 데이터) 관리 라이브러리
 * - 캐싱, 동기화, 백그라운드 업데이트 자동 처리
 * - useState + useEffect로 API 호출하는 것보다 훨씬 편함
 * 
 * 사용 예시:
 * const { data, isLoading } = useQuery(['tasks'], fetchTasks)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                    // 실패 시 1번 재시도
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 안 함
    },
  },
})

/**
 * React 18 렌더링
 * 
 * createRoot: React 18의 새로운 렌더링 API
 * document.getElementById('root')!: index.html의 root div
 *   - !는 TypeScript의 non-null assertion (null 아님을 보장)
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  /**
   * React.StrictMode
   * - 개발 모드에서 잠재적 문제 감지
   * - 컴포넌트를 2번 렌더링해서 부작용 체크
   * - 프로덕션에서는 영향 없음
   */
  <React.StrictMode>
    {/* QueryClientProvider: React Query 컨텍스트 제공 */}
    <QueryClientProvider client={queryClient}>
      {/* BrowserRouter: URL 기반 라우팅 활성화 */}
      <BrowserRouter>
        {/* 메인 앱 컴포넌트 */}
        <App />
        {/* 토스트 알림 (우측 상단) */}
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
