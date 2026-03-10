/**
 * 알림 상태 관리 (Zustand Store)
 * 
 * 실시간 알림 관리:
 * - WebSocket으로 받은 알림
 * - 읽지 않은 알림 개수
 * - 알림 목록
 */
import { create } from 'zustand'

/**
 * 알림 타입
 */
interface Notification {
  id: string
  type: 'MESSAGE' | 'TASK' | 'JOB' | 'PROPOSAL'
  title: string
  message: string
  read: boolean
  createdAt: Date
  link?: string
}

/**
 * 알림 상태
 */
interface NotificationState {
  // ===== State =====
  notifications: Notification[]
  unreadCount: number
  
  // ===== Actions =====
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

/**
 * 알림 스토어
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  // ===== 초기 상태 =====
  notifications: [],
  unreadCount: 0,
  
  /**
   * 새 알림 추가
   */
  addNotification: (notification) =>
    set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        read: false,
        createdAt: new Date(),
      }
      
      return {
        notifications: [newNotification, ...state.notifications].slice(0, 50), // 최대 50개
        unreadCount: state.unreadCount + 1,
      }
    }),
  
  /**
   * 알림 읽음 처리
   */
  markAsRead: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      if (!notification || notification.read) return state
      
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    }),
  
  /**
   * 모든 알림 읽음 처리
   */
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  
  /**
   * 알림 전체 삭제
   */
  clearNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}))
