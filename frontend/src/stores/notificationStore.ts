/**
 * 알림 상태 관리 스토어
 * 
 * Zustand를 사용한 전역 알림 상태 관리
 * 
 * 주요 기능:
 * - 읽지 않은 메시지 수 관리
 * - WebSocket 연결 상태 관리
 */
import { create } from 'zustand'

interface NotificationState {
  // 상태
  unreadMessageCount: number
  isWebSocketConnected: boolean
  
  // 액션
  setUnreadMessageCount: (count: number) => void
  incrementUnreadMessageCount: () => void
  decrementUnreadMessageCount: () => void
  setWebSocketConnected: (connected: boolean) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  // 초기 상태
  unreadMessageCount: 0,
  isWebSocketConnected: false,
  
  // 액션
  setUnreadMessageCount: (count) => set({ unreadMessageCount: count }),
  
  incrementUnreadMessageCount: () => 
    set((state) => ({ unreadMessageCount: state.unreadMessageCount + 1 })),
  
  decrementUnreadMessageCount: () => 
    set((state) => ({ 
      unreadMessageCount: Math.max(0, state.unreadMessageCount - 1) 
    })),
  
  setWebSocketConnected: (connected) => set({ isWebSocketConnected: connected }),
}))
