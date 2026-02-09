/**
 * WebSocket 실시간 알림 훅
 * 
 * STOMP + SockJS를 사용한 실시간 메시지 알림
 * 
 * 사용법:
 * // App.tsx에서 한 번만 호출
 * useWebSocket()
 * 
 * // 다른 컴포넌트에서 상태 사용
 * const { unreadMessageCount } = useNotificationStore()
 * 
 * 주요 기능:
 * - 로그인 상태에서 자동 연결
 * - 새 메시지 도착 시 토스트 알림
 * - 읽지 않은 메시지 수 실시간 업데이트
 */
import { useEffect, useRef, useCallback } from 'react'
import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import toast from 'react-hot-toast'

interface NewMessageEvent {
  threadId: number
  messageId: number
  senderName: string
  senderEmail: string
  subject: string | null
  contentPreview: string
  receivedAt: string
}

export function useWebSocket(): void {
  const clientRef = useRef<Client | null>(null)
  const { user, accessToken, isAuthenticated } = useAuthStore()
  const { 
    incrementUnreadMessageCount, 
    setWebSocketConnected 
  } = useNotificationStore()

  /**
   * 새 메시지 수신 처리
   */
  const handleNewMessage = useCallback((event: NewMessageEvent) => {
    // 읽지 않은 메시지 수 증가
    incrementUnreadMessageCount()

    // 토스트 알림
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {event.senderName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {event.senderName}
                </p>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {event.subject || event.contentPreview}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                toast.dismiss(t.id)
                window.location.href = `/inbox/${event.threadId}`
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
            >
              보기
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: 'top-right',
      }
    )
  }, [incrementUnreadMessageCount])

  /**
   * WebSocket 연결
   */
  const connect = useCallback(() => {
    if (!isAuthenticated || !accessToken || !user) return

    // 이미 연결되어 있으면 무시
    if (clientRef.current?.connected) return

    const client = new Client({
      // SockJS를 통한 WebSocket 연결
      // SockJS: WebSocket 미지원 브라우저에서 폴백 제공
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'}/ws`),
      
      // 연결 시 JWT 토큰 전달
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      
      // 디버그 로그 (개발 환경에서만)
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[STOMP]', str)
        }
      },
      
      // 재연결 설정
      reconnectDelay: 5000,  // 5초 후 재연결 시도
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    // 연결 성공 콜백
    client.onConnect = () => {
      setWebSocketConnected(true)
      console.log('[WebSocket] Connected')

      // 사용자별 메시지 채널 구독
      // /user/{userId}/queue/messages 형태로 전달됨
      client.subscribe(`/user/${user.id}/queue/messages`, (message: IMessage) => {
        const event: NewMessageEvent = JSON.parse(message.body)
        handleNewMessage(event)
      })
    }

    // 연결 해제 콜백
    client.onDisconnect = () => {
      setWebSocketConnected(false)
      console.log('[WebSocket] Disconnected')
    }

    // 에러 콜백
    client.onStompError = (frame) => {
      console.error('[WebSocket] Error:', frame.headers['message'])
    }

    client.activate()
    clientRef.current = client
  }, [isAuthenticated, accessToken, user, handleNewMessage, setWebSocketConnected])

  /**
   * 연결 해제
   */
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate()
      clientRef.current = null
      setWebSocketConnected(false)
    }
  }, [setWebSocketConnected])

  // 로그인 상태 변경 시 연결/해제
  useEffect(() => {
    if (isAuthenticated) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, connect, disconnect])
}

export default useWebSocket
