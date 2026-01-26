/**
 * 메인 App 컴포넌트 - 라우팅 설정
 * 
 * React Router를 사용한 SPA(Single Page Application) 라우팅
 * 
 * SPA란?
 * - 페이지 전환 시 전체 새로고침 없이 컴포넌트만 교체
 * - URL이 바뀌어도 index.html 하나로 동작
 * - 빠른 페이지 전환, 부드러운 UX
 * 
 * 라우트 구조:
 * /login, /signup          → 인증 페이지 (비로그인)
 * /resume/:slug            → 공개 이력서 (비로그인)
 * /, /calendar, /tasks ... → 비공개 페이지 (로그인 필수)
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

// Layouts (페이지 공통 레이아웃)
import PublicLayout from '@/layouts/PublicLayout'
import PrivateLayout from '@/layouts/PrivateLayout'

// Public Pages (비로그인 접근 가능)
import ResumePage from '@/pages/public/ResumePage'
import LoginPage from '@/pages/auth/LoginPage'
import SignUpPage from '@/pages/auth/SignUpPage'

// Private Pages (로그인 필수)
import DashboardPage from '@/pages/private/DashboardPage'
import CalendarPage from '@/pages/private/CalendarPage'
import TasksPage from '@/pages/private/TasksPage'
import InboxPage from '@/pages/private/InboxPage'
import ResumeEditPageNew from '@/pages/private/ResumeEditPageNew'
import SettingsPage from '@/pages/private/SettingsPage'
import JobsPage from '@/pages/private/JobsPage'
import JobDetailPage from '@/pages/private/JobDetailPage'

/**
 * 인증 보호 라우트 (Private Route)
 * 
 * 로그인하지 않은 사용자가 비공개 페이지 접근 시 /login으로 리다이렉트
 * 
 * 동작:
 * 1. authStore에서 로그인 상태 확인
 * 2. 로그인됨 → children(자식 컴포넌트) 렌더링
 * 3. 로그인 안됨 → /login으로 이동
 * 
 * replace: 히스토리에 현재 페이지 남기지 않음 (뒤로가기 방지)
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

/**
 * 앱 라우팅 설정
 * 
 * <Routes>: 라우트들을 감싸는 컨테이너
 * <Route>: 개별 라우트 정의
 *   - path: URL 경로
 *   - element: 렌더링할 컴포넌트
 * 
 * 중첩 라우트:
 * <Route element={<Layout />}>
 *   <Route path="/a" element={<PageA />} />  // Layout 안에 PageA
 *   <Route path="/b" element={<PageB />} />  // Layout 안에 PageB
 * </Route>
 */
function App() {
  return (
    <Routes>
      {/* ========== Public Routes (비로그인 접근 가능) ========== */}
      {/* PublicLayout 안에 렌더링 */}
      <Route element={<PublicLayout />}>
        {/* :slug = URL 파라미터. /resume/john-doe에서 slug = "john-doe" */}
        <Route path="/resume/:slug" element={<ResumePage />} />
      </Route>

      {/* ========== Auth Routes (인증 페이지) ========== */}
      {/* 레이아웃 없이 단독 렌더링 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* ========== Private Routes (로그인 필수) ========== */}
      {/* PrivateRoute로 감싸서 인증 체크 */}
      {/* PrivateLayout 안에 렌더링 (사이드바, 헤더 등) */}
      <Route
        element={
          <PrivateRoute>
            <PrivateLayout />
          </PrivateRoute>
        }
      >
        {/* index route: 기본 경로 "/" */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/resume/edit" element={<ResumeEditPageNew />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* ========== Fallback (404) ========== */}
      {/* path="*": 위에서 매칭 안 된 모든 경로 */}
      {/* 존재하지 않는 URL 접근 시 홈으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
