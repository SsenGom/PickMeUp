/**
 * 비공개 페이지 레이아웃
 * 
 * 로그인한 사용자만 접근 가능한 페이지의 공통 레이아웃
 * - 사이드바 (네비게이션)
 * - 헤더 (알림, 모바일 메뉴)
 * - 메인 콘텐츠 영역 (<Outlet />)
 * 
 * 반응형 디자인:
 * - 데스크톱: 사이드바 항상 표시
 * - 모바일: 햄버거 메뉴로 사이드바 토글
 * 
 * <Outlet />:
 * React Router의 중첩 라우트에서 자식 컴포넌트가 렌더링되는 위치
 * 
 * 구조:
 * <PrivateLayout>        ← 이 컴포넌트
 *   <Sidebar />
 *   <Header />
 *   <main>
 *     <Outlet />         ← 여기에 DashboardPage, TasksPage 등 렌더링
 *   </main>
 * </PrivateLayout>
 */
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import api from '@/lib/api'
import {
  LayoutDashboard,
  Calendar,
  Mail,
  FileText,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Briefcase,
  CheckSquare,
  Wifi,
  WifiOff,
  Heart,
  Users,
  BarChart3,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * 네비게이션 아이템 정의
 * 
 * 배열로 정의하면 map으로 렌더링 → 코드 중복 감소
 */
const navItems = [
  { to: '/', icon: LayoutDashboard, label: '대시보드' },
  { to: '/calendar', icon: Calendar, label: '캘린더' },
  { to: '/tasks', icon: CheckSquare, label: '할 일' },
  { to: '/jobs', icon: Briefcase, label: '취업관리' },
  { to: '/inbox', icon: Mail, label: '메시지' },
  { to: '/resume/edit', icon: FileText, label: '이력서' },
  { to: '/statistics', icon: BarChart3, label: '통계' },
]

// 헤드헌터 전용 메뉴
const recruiterNavItems = [
  { to: '/recruiter/swipe', icon: Heart, label: '인재 발굴', badge: 'NEW' },
  { to: '/recruiter/picks', icon: Users, label: '픽한 사람들' },
  { to: '/proposals', icon: Mail, label: '받은 제안' },
]

export default function PrivateLayout() {
  // 모바일 사이드바 열림 상태
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // 전역 인증 상태에서 사용자 정보와 로그아웃 함수
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  
  // 전역 알림 상태 (WebSocket에서 업데이트)
  const { 
    unreadMessageCount, 
    setUnreadMessageCount,
    isWebSocketConnected 
  } = useNotificationStore()

  /**
   * 읽지 않은 메시지 개수 조회
   * 
   * refetchInterval: 30초마다 자동 재조회 (실시간성)
   * WebSocket과 함께 사용하여 실시간 + 폴링 백업
   */
  const { data: unreadCountFromApi } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      const { data } = await api.get('/inbox/unread-count')
      return data.data as number
    },
    refetchInterval: 30000,  // 30초마다 폴링
  })
  
  // API에서 받아온 값으로 스토어 동기화
  useEffect(() => {
    if (unreadCountFromApi !== undefined) {
      setUnreadMessageCount(unreadCountFromApi)
    }
  }, [unreadCountFromApi, setUnreadMessageCount])
  
  // 실제 표시할 읽지 않은 메시지 수 (스토어에서 가져옴)
  const unreadCount = unreadMessageCount

  /**
   * 로그아웃 처리
   */
  const handleLogout = () => {
    logout()              // Zustand 상태 초기화 + localStorage 삭제
    navigate('/login')    // 로그인 페이지로 이동
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ========== 모바일 사이드바 배경 (오버레이) ========== */}
      {/* 사이드바 열렸을 때만 표시, 클릭하면 닫힘 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========== 사이드바 ========== */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform',
          'lg:translate-x-0',  // 데스크톱: 항상 표시
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'  // 모바일: 토글
        )}
      >
        {/* 사이드바 헤더 */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-primary-600">PickMeUp</h1>
          {/* 모바일에서만 닫기 버튼 표시 */}
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
              {to === '/inbox' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
          
          {/* 구분선 */}
          <div className="pt-4">
            <div className="border-t my-2"></div>
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {user?.userType === 'RECRUITER' ? '헤드헌터' : '채용 제안'}
            </p>
          </div>
          
          {/* 헤드헌터 or 구직자 메뉴 */}
          {user?.userType === 'RECRUITER' ? (
            // 헤드헌터용 메뉴
            <>
              {recruiterNavItems.map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    )
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                  {badge && (
                    <span className="ml-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </>
          ) : (
            // 구직자용 메뉴 (받은 제안만)
            <NavLink
              to="/proposals"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-100'
                )
              }
            >
              <Mail className="w-5 h-5" />
              <span>받은 제안</span>
            </NavLink>
          )}
          
          {/* 설정 */}
          <div className="pt-2">
            <NavLink
              to="/settings"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                )
              }
            >
              <Settings className="w-5 h-5" />
              <span>설정</span>
            </NavLink>
          </div>
        </nav>

        {/* 사이드바 푸터 (사용자 정보 + 로그아웃) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          {/* 사용자 정보 */}
          <div className="flex items-center gap-3 mb-3">
            {/* 프로필 아바타 (이름 첫 글자) */}
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* ========== 메인 콘텐츠 영역 ========== */}
      {/* lg:pl-64: 데스크톱에서 사이드바 너비만큼 왼쪽 패딩 */}
      <div className="lg:pl-64">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            {/* 모바일 햄버거 메뉴 버튼 */}
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1" />

            {/* 알림 버튼 */}
            <div className="flex items-center gap-2">
              {/* WebSocket 연결 상태 표시 (개발용) */}
              {import.meta.env.DEV && (
                <div className="flex items-center gap-1 text-xs text-gray-400" title={isWebSocketConnected ? '실시간 연결됨' : '실시간 연결 끊김'}>
                  {isWebSocketConnected ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              )}
              <button className="relative p-2 hover:bg-gray-100 rounded-full">
                <Bell className="w-6 h-6 text-gray-600" />
                {/* 읽지 않은 메시지 있으면 빨간 점 표시 */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        {/* <Outlet />: 자식 라우트의 컴포넌트가 여기에 렌더링됨 */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
