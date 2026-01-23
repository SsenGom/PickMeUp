import { useEffect } from 'react'

/**
 * 모달 키보드 이벤트 훅
 * - ESC: 모달 닫기
 * - Tab: 기본 동작 (다음 입력칸으로 이동)
 */
export function useModalKeyboard(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])
}
