import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import api from '@/lib/api'
import TimePicker from '@/components/common/TimePicker'
import { CalendarEvent } from '@/types'
import { useModalKeyboard } from '@/hooks/useModalKeyboard'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate?: Date | null
  editEvent?: CalendarEvent | null
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
]

export default function EventModal({ isOpen, onClose, selectedDate, editEvent }: EventModalProps) {
  const queryClient = useQueryClient()
  const isEditMode = !!editEvent
  const firstInputRef = useRef<HTMLInputElement>(null)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endTime, setEndTime] = useState('10:00')
  const [isAllDay, setIsAllDay] = useState(false)
  const [isDaily, setIsDaily] = useState(false)
  const [isMonthly, setIsMonthly] = useState(false)
  const [color, setColor] = useState(COLORS[0])

  // ESC 키로 닫기
  useModalKeyboard(isOpen, onClose)

  // 모달 열릴 때 첫 입력칸에 포커스
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // 모달 열릴 때마다 폼 초기화
  useEffect(() => {
    if (!isOpen) return
    
    if (editEvent) {
      setTitle(editEvent.title)
      setDescription(editEvent.description || '')
      setStartDate(format(new Date(editEvent.startAt), 'yyyy-MM-dd'))
      setStartTime(format(new Date(editEvent.startAt), 'HH:mm'))
      setEndDate(format(new Date(editEvent.endAt), 'yyyy-MM-dd'))
      setEndTime(format(new Date(editEvent.endAt), 'HH:mm'))
      setIsAllDay(editEvent.isAllDay)
      setIsDaily(editEvent.recurrenceType === 'DAILY')
      setIsMonthly(editEvent.recurrenceType === 'MONTHLY')
      setColor(editEvent.color)
    } else {
      setTitle('')
      setDescription('')
      setStartTime('09:00')
      setEndTime('10:00')
      setIsAllDay(false)
      setIsDaily(false)
      setIsMonthly(false)
      setColor(COLORS[0])
      if (selectedDate) {
        const formatted = format(selectedDate, 'yyyy-MM-dd')
        setStartDate(formatted)
        setEndDate(formatted)
      } else {
        setStartDate(format(new Date(), 'yyyy-MM-dd'))
        setEndDate(format(new Date(), 'yyyy-MM-dd'))
      }
    }
  }, [isOpen, editEvent, selectedDate])

  const createMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const { data } = await api.post('/calendar', eventData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
      onClose()
    },
    onError: (error: any) => {
      console.error('일정 생성 실패:', error.response?.data || error.message)
      alert('일정 생성에 실패했습니다: ' + (error.response?.data?.message || error.message))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const { id, ...rest } = eventData
      const { data } = await api.put(`/calendar/${id}`, rest)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
      onClose()
    },
    onError: (error: any) => {
      console.error('일정 수정 실패:', error.response?.data || error.message)
      alert('일정 수정에 실패했습니다: ' + (error.response?.data?.message || error.message))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const startAt = isAllDay 
      ? `${startDate}T00:00:00` 
      : `${startDate}T${startTime}:00`
    const endAt = isAllDay 
      ? `${endDate}T23:59:59` 
      : `${endDate}T${endTime}:00`

    // recurrenceType 결정: DAILY가 MONTHLY보다 우선 (매일이면 매달은 의미 없으니까)
    let recurrenceType = 'NONE'
    if (isDaily) recurrenceType = 'DAILY'
    else if (isMonthly) recurrenceType = 'MONTHLY'

    const eventData = {
      title,
      description: description || undefined,
      startAt,
      endAt,
      isAllDay,
      recurrenceType,
      color,
    }

    if (isEditMode && editEvent) {
      updateMutation.mutate({ id: editEvent.id, ...eventData })
    } else {
      createMutation.mutate(eventData)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEditMode ? '일정 수정' : '새 일정 추가'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              ref={firstInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="일정 제목을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 체크박스들 */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAllDay"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isAllDay" className="text-sm text-gray-700">종일</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDaily"
                checked={isDaily}
                onChange={(e) => {
                  setIsDaily(e.target.checked)
                  if (e.target.checked) setIsMonthly(false)
                }}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isDaily" className="text-sm text-gray-700">매일</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isMonthly"
                checked={isMonthly}
                onChange={(e) => {
                  setIsMonthly(e.target.checked)
                  if (e.target.checked) {
                    setIsDaily(false)
                    setEndDate(startDate) // 매달 반복이면 종료일 = 시작일
                  }
                }}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isMonthly" className="text-sm text-gray-700">
                매달 ({new Date(startDate).getDate()}일)
              </label>
            </div>
          </div>

          {/* 시작 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (isMonthly) setEndDate(e.target.value) // 매달 반복이면 종료일도 동기화
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {!isAllDay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                <TimePicker value={startTime} onChange={setStartTime} />
              </div>
            )}
          </div>

          {/* 종료 */}
          {!isMonthly && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {!isAllDay && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                  <TimePicker value={endTime} onChange={setEndTime} />
                </div>
              )}
            </div>
          )}

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설명을 입력하세요 (선택)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* 색상 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending || !title}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isPending ? '저장 중...' : isEditMode ? '수정' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
