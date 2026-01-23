import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { CalendarEvent } from '@/types'
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, GripVertical, HelpCircle, X } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import EventModal from '@/components/calendar/CreateEventModal'
import EventDetailModal from '@/components/calendar/EventDetailModal'

// 가이드 스텝 정의
const GUIDE_STEPS = [
  {
    target: 'new-event-btn',
    title: '새 일정 추가',
    description: '이 버튼을 클릭하여 새로운 일정을 추가할 수 있어요.',
    position: 'bottom' as const,
  },
  {
    target: 'calendar-grid',
    title: '캘린더에서 날짜 선택',
    description: '날짜를 클릭하면 해당 날짜의 일정을 확인할 수 있어요.',
    position: 'top' as const,
  },
  {
    target: 'event-item',
    title: '일정 드래그 & 드롭',
    description: '일정을 드래그하여 다른 날짜로 옮길 수 있어요. 드래그 중 이동할 위치가 미리보기로 표시됩니다.',
    position: 'top' as const,
  },
  {
    target: 'event-resize',
    title: '일정 기간 조절',
    description: '일정 양 끝의 화살표를 드래그하여 기간을 늘리거나 줄일 수 있어요.',
    position: 'top' as const,
  },
  {
    target: 'selected-date-panel',
    title: '선택된 날짜 일정',
    description: '여기서 해당 날짜의 모든 일정을 확인하고, 더 편하게 드래그하여 조절할 수 있어요.',
    position: 'bottom' as const,
  },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null)
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  // 드래그 상태
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null)
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null)
  const [isDraggingEdge, setIsDraggingEdge] = useState<'start' | 'end' | null>(null)
  
  // 가이드 상태
  const [showGuide, setShowGuide] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  
  const queryClient = useQueryClient()
  const selectedDateRef = useRef<HTMLDivElement>(null)

  // 가이드 체크 (첫 방문 시)
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('calendar-guide-seen')
    if (!hasSeenGuide) {
      setShowGuide(true)
    }
  }, [])

  const start = startOfMonth(currentDate)
  const end = endOfMonth(currentDate)

  const { data: events } = useQuery({
    queryKey: ['calendarEvents', format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data } = await api.get('/calendar', {
        params: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      })
      return data.data as CalendarEvent[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/calendar/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, startAt, endAt }: { id: number; startAt: string; endAt: string }) => {
      await api.put(`/calendar/${id}`, { startAt, endAt })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
      queryClient.invalidateQueries({ queryKey: ['todayEvents'] })
    },
  })

  const days = eachDayOfInterval({ start, end }).map(d => 
    // 정오로 설정해서 시간대 문제 방지
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0)
  )
  const startDay = start.getDay()

  const getEventsForDay = (date: Date) => {
    const filtered = events?.filter((event) => {
      const eventStart = new Date(event.startAt)
      const eventEnd = new Date(event.endAt)
      
      if (event.recurrenceType === 'DAILY') {
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
        return eventStart <= dayEnd && eventEnd >= dayStart
      }
      
      if (event.recurrenceType === 'MONTHLY') {
        const eventDay = eventStart.getDate()
        const currentDay = date.getDate()
        if (date >= eventStart && eventDay === currentDay) {
          return true
        }
      }
      
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const eventStartOnly = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
      const eventEndOnly = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())
      
      return dateOnly >= eventStartOnly && dateOnly <= eventEndOnly
    }) || []

    return filtered.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }

  // 미리보기용: 드래그 중일 때 해당 날짜에 표시될 일정 계산
  const getPreviewForDay = (date: Date) => {
    if (!draggedEvent || !dragOverDate) return null
    
    const eventStart = new Date(draggedEvent.startAt)
    const eventEnd = new Date(draggedEvent.endAt)
    const duration = Math.round((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24))
    
    if (isDraggingEdge === 'end') {
      // 종료일 조절 중
      const newEndDate = new Date(dragOverDate.getFullYear(), dragOverDate.getMonth(), dragOverDate.getDate())
      const startDateOnly = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      if (newEndDate >= startDateOnly && dateOnly >= startDateOnly && dateOnly <= newEndDate) {
        return draggedEvent
      }
    } else if (isDraggingEdge === 'start') {
      // 시작일 조절 중
      const newStartDate = new Date(dragOverDate.getFullYear(), dragOverDate.getMonth(), dragOverDate.getDate())
      const endDateOnly = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      if (newStartDate <= endDateOnly && dateOnly >= newStartDate && dateOnly <= endDateOnly) {
        return draggedEvent
      }
    } else {
      // 전체 이동 중
      const newStartDate = new Date(dragOverDate.getFullYear(), dragOverDate.getMonth(), dragOverDate.getDate())
      const newEndDate = new Date(newStartDate.getTime() + duration * 24 * 60 * 60 * 1000)
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      if (dateOnly >= newStartDate && dateOnly <= newEndDate) {
        return draggedEvent
      }
    }
    
    return null
  }

  // 드래그 핸들러
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent, edge?: 'start' | 'end') => {
    e.stopPropagation()
    setDraggedEvent(event)
    setIsDraggingEdge(edge || null)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', event.id.toString())
    
    // 투명 이미지로 기본 드래그 이미지 숨김
    const img = new Image()
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!draggedEvent) {
      resetDragState()
      return
    }

    const eventStart = new Date(draggedEvent.startAt)
    const eventEnd = new Date(draggedEvent.endAt)
    
    // 타겟 날짜
    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth()
    const targetDay = targetDate.getDate()
    
    console.log('=== handleDrop ===')
    console.log('targetDate received:', targetYear, targetMonth + 1, targetDay)
    console.log('Original event start:', draggedEvent.startAt)
    console.log('Original event end:', draggedEvent.endAt)
    
    // 이벤트 시작/종료 날짜 (로컬 시간)
    const startYear = eventStart.getFullYear()
    const startMonth = eventStart.getMonth()
    const startDayNum = eventStart.getDate()
    
    const endYear = eventEnd.getFullYear()
    const endMonth = eventEnd.getMonth()
    const endDayNum = eventEnd.getDate()
    
    console.log('Event start local:', startYear, startMonth + 1, startDayNum)
    console.log('Event end local:', endYear, endMonth + 1, endDayNum)
    
    // 일수 차이 계산 (정오 기준으로 비교)
    const startDateOnly = new Date(startYear, startMonth, startDayNum, 12, 0, 0)
    const endDateOnly = new Date(endYear, endMonth, endDayNum, 12, 0, 0)
    const targetDateOnly = new Date(targetYear, targetMonth, targetDay, 12, 0, 0)
    
    // 날짜 차이 계산 (시작일 기준)
    const dayDiff = Math.round((targetDateOnly.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24))
    
    console.log('dayDiff:', dayDiff)

    let newStartAt: Date
    let newEndAt: Date

    if (isDraggingEdge === 'end') {
      // 종료일만 변경
      if (targetDateOnly.getTime() < startDateOnly.getTime()) {
        resetDragState()
        return
      }
      newStartAt = eventStart
      const endDayDiff = Math.round((targetDateOnly.getTime() - endDateOnly.getTime()) / (1000 * 60 * 60 * 24))
      newEndAt = new Date(eventEnd.getTime() + endDayDiff * 24 * 60 * 60 * 1000)
    } else if (isDraggingEdge === 'start') {
      // 시작일만 변경
      if (targetDateOnly.getTime() > endDateOnly.getTime()) {
        resetDragState()
        return
      }
      newStartAt = new Date(eventStart.getTime() + dayDiff * 24 * 60 * 60 * 1000)
      newEndAt = eventEnd
    } else {
      // 전체 이동 (기간 유지)
      newStartAt = new Date(eventStart.getTime() + dayDiff * 24 * 60 * 60 * 1000)
      newEndAt = new Date(eventEnd.getTime() + dayDiff * 24 * 60 * 60 * 1000)
    }

    console.log('New start:', newStartAt.getFullYear(), newStartAt.getMonth() + 1, newStartAt.getDate(), newStartAt.getHours(), newStartAt.getMinutes())
    console.log('New end:', newEndAt.getFullYear(), newEndAt.getMonth() + 1, newEndAt.getDate(), newEndAt.getHours(), newEndAt.getMinutes())
    // 로컬 시간을 ISO 문자열로 변환 (UTC 변환 없이)
    const toLocalISOString = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }

    console.log('Sending local ISO:', toLocalISOString(newStartAt), toLocalISOString(newEndAt))

    updateMutation.mutate({
      id: draggedEvent.id,
      startAt: toLocalISOString(newStartAt),
      endAt: toLocalISOString(newEndAt),
    })

    resetDragState()
  }

  const resetDragState = () => {
    setDraggedEvent(null)
    setDragOverDate(null)
    setIsDraggingEdge(null)
  }

  const handleDragEnd = () => {
    resetDragState()
  }

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id)
  }

  const handleEdit = (event: CalendarEvent) => {
    setEditEvent(event)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditEvent(null)
  }

  const handleNewEvent = () => {
    setEditEvent(null)
    setIsModalOpen(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    if (draggedEvent) return
    setDetailEvent(event)
    setIsDetailOpen(true)
  }

  const handleDetailClose = () => {
    setIsDetailOpen(false)
    setDetailEvent(null)
  }

  const isMultiDayEvent = (event: CalendarEvent) => {
    const start = new Date(event.startAt)
    const end = new Date(event.endAt)
    return !isSameDay(start, end)
  }

  const isEventStart = (event: CalendarEvent, date: Date) => {
    return isSameDay(new Date(event.startAt), date)
  }

  const isEventEnd = (event: CalendarEvent, date: Date) => {
    return isSameDay(new Date(event.endAt), date)
  }

  // 가이드 핸들러
  const handleGuideNext = () => {
    if (guideStep < GUIDE_STEPS.length - 1) {
      setGuideStep(guideStep + 1)
    } else {
      handleGuideClose()
    }
  }

  const handleGuidePrev = () => {
    if (guideStep > 0) {
      setGuideStep(guideStep - 1)
    }
  }

  const handleGuideClose = (neverShow?: boolean) => {
    setShowGuide(false)
    setGuideStep(0)
    if (neverShow) {
      localStorage.setItem('calendar-guide-seen', 'true')
    }
  }

  const weekdays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">캘린더</h1>
        <button
          onClick={() => { setShowGuide(true); setGuideStep(0) }}
          className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm">가이드</span>
        </button>
      </div>

      {/* 선택된 날짜 일정 */}
      {selectedDate && (
        <div ref={selectedDateRef} id="selected-date-panel" className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })} 일정
            </h3>
            <button
              id="new-event-btn"
              onClick={handleNewEvent}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              일정 추가
            </button>
          </div>
          {getEventsForDay(selectedDate).length > 0 ? (
            <div className="space-y-3">
              {getEventsForDay(selectedDate).map((event) => {
                const isMulti = isMultiDayEvent(event)
                const isStart = isEventStart(event, selectedDate)
                const isEnd = isEventEnd(event, selectedDate)
                const canDrag = event.recurrenceType === 'NONE'
                const isDragging = draggedEvent?.id === event.id

                return (
                  <div
                    key={event.id}
                    id="event-item"
                    className={cn(
                      'group relative rounded-xl transition-all duration-300 ease-out',
                      isDragging && 'opacity-30 scale-95'
                    )}
                  >
                    {/* 메인 일정 카드 */}
                    <div
                      draggable={canDrag}
                      onDragStart={(e) => handleDragStart(e, event)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleEventClick(event)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ease-out border-2 border-transparent',
                        canDrag && 'cursor-grab active:cursor-grabbing',
                        canDrag && !isDragging && 'hover:shadow-xl hover:-translate-y-1 hover:border-gray-200'
                      )}
                      style={{ backgroundColor: event.color + '15' }}
                    >
                      {canDrag && (
                        <GripVertical className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                      )}
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-sm text-gray-500">
                          {event.isAllDay 
                            ? `${format(new Date(event.startAt), 'M월 d일', { locale: ko })} - ${format(new Date(event.endAt), 'M월 d일', { locale: ko })} 종일`
                            : `${format(new Date(event.startAt), 'M월 d일 a h시', { locale: ko })} - ${format(new Date(event.endAt), 'M월 d일 a h시', { locale: ko })}`
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(event)
                          }}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('정말 삭제하시겠습니까?')) {
                              handleDelete(event.id)
                            }
                          }}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* 날짜 조절 버튼 */}
                    {canDrag && (
                      <div id="event-resize" className="flex items-center justify-center gap-3 mt-2 h-0 overflow-hidden group-hover:h-auto group-hover:overflow-visible transition-all duration-300">
                        {/* 시작일 조절 - 하루짜리도 표시 */}
                        {(isStart || !isMulti) && (
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation()
                              handleDragStart(e, event, 'start')
                            }}
                            onDragEnd={handleDragEnd}
                            className="flex items-center gap-1.5 px-4 py-2 bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white rounded-full cursor-ew-resize transition-all duration-200 hover:scale-105 hover:shadow-lg"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-xs font-semibold">시작일 조절</span>
                          </div>
                        )}
                        
                        {/* 종료일 조절 - 하루짜리도 표시 */}
                        {(isEnd || !isMulti) && (
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation()
                              handleDragStart(e, event, 'end')
                            }}
                            onDragEnd={handleDragEnd}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-full cursor-ew-resize transition-all duration-200 hover:scale-105 hover:shadow-lg"
                          >
                            <span className="text-xs font-semibold">종료일 조절</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">이 날에는 일정이 없습니다</p>
          )}
        </div>
      )}

      <div id="calendar-grid" className="bg-white rounded-xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7">
          {weekdays.map((day, i) => (
            <div
              key={day}
              className={cn(
                'text-center text-sm font-medium py-2',
                i === 0 ? 'text-red-500 bg-red-50' : i === 6 ? 'text-blue-500 bg-blue-50' : 'text-gray-500',
                i === 0 && 'rounded-tl-lg',
                i === 6 && 'rounded-tr-lg'
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {Array.from({ length: startDay }).map((_, i) => (
            <div 
              key={`empty-${i}`} 
              className={cn(
                'min-h-36',
                i === 0 && 'bg-red-50/50'
              )} 
            />
          ))}

          {days.map((day) => {
            const dayEvents = getEventsForDay(day)
            const previewEvent = getPreviewForDay(day)
            const isToday = isSameDay(day, new Date())
            const dayOfWeek = day.getDay()
            const isDragOver = dragOverDate && isSameDay(day, dragOverDate)
            // 로컬 날짜 문자열로 키 생성 (UTC 변환 방지)
            const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`

            return (
              <div
                key={dayKey}
                data-date={dayKey}
                onClick={() => setSelectedDate(day)}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.dataTransfer.dropEffect = 'move'
                  const targetDay = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0)
                  if (!dragOverDate || !isSameDay(dragOverDate, targetDay)) {
                    setDragOverDate(targetDay)
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // DOM에서 직접 날짜 정보 가져오기
                  const year = day.getFullYear()
                  const month = day.getMonth()
                  const date = day.getDate()
                  console.log('=== DROP EVENT ===')
                  console.log('Drop on:', year, month + 1, date)
                  console.log('event target:', e.target)
                  console.log('event currentTarget:', e.currentTarget)
                  const targetDay = new Date(year, month, date, 12, 0, 0)
                  handleDrop(e, targetDay)
                }}
                className={cn(
                  'min-h-36 p-1.5 relative flex flex-col text-left border-t border-gray-100 cursor-pointer transition-all duration-200 ease-out',
                  dayOfWeek === 0 && 'bg-red-50/50',
                  dayOfWeek === 6 && 'bg-blue-50/50',
                  selectedDate && isSameDay(day, selectedDate) && 'ring-2 ring-inset ring-primary-500',
                  isDragOver && 'bg-primary-100 scale-[1.03] shadow-xl z-10 ring-2 ring-primary-400'
                )}
              >
                <span
                  className={cn(
                    'text-sm mb-1 inline-flex items-center justify-center',
                    dayOfWeek === 0 && 'text-red-500',
                    dayOfWeek === 6 && !isToday && 'text-blue-500',
                    isToday && 'w-6 h-6 bg-primary-500 text-white rounded-full font-bold'
                  )}
                >
                  {format(day, 'd')}
                </span>
                
                {/* 드롭 미리보기 */}
                {previewEvent && !dayEvents.find(e => e.id === previewEvent.id) && (
                  <div
                    className="text-xs py-1.5 px-2 rounded-md mb-1 border-2 border-dashed animate-pulse"
                    style={{ 
                      backgroundColor: previewEvent.color + '20',
                      borderColor: previewEvent.color,
                      color: previewEvent.color
                    }}
                  >
                    <span className="truncate font-medium opacity-70">{previewEvent.title}</span>
                  </div>
                )}
                
                {/* 일정 표시 */}
                <div className="flex-1 overflow-hidden space-y-1">
                  {dayEvents.slice(0, 3).map((event) => {
                    const isMulti = isMultiDayEvent(event)
                    const isStart = isEventStart(event, day)
                    const isEnd = isEventEnd(event, day)
                    const canDrag = event.recurrenceType === 'NONE'
                    const isDragging = draggedEvent?.id === event.id

                    return (
                      <div
                        key={event.id}
                        draggable={canDrag}
                        onDragStart={(e) => handleDragStart(e, event)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(event)
                        }}
                        className={cn(
                          'group/event text-xs py-1.5 px-2 rounded-md flex items-center transition-all duration-200 ease-out relative overflow-hidden',
                          canDrag && 'cursor-grab active:cursor-grabbing',
                          canDrag && !isDragging && 'hover:shadow-lg hover:scale-[1.03] hover:z-20',
                          isDragging && 'opacity-30 scale-90'
                        )}
                        style={{ 
                          backgroundColor: event.color + '20',
                          color: event.color 
                        }}
                      >
                        {/* 시작 핸들 - 하루짜리도 표시 */}
                        {canDrag && (isStart || !isMulti) && (
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation()
                              handleDragStart(e, event, 'start')
                            }}
                            className="absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center opacity-0 group-hover/event:opacity-100 cursor-ew-resize transition-all duration-200 rounded-l-md"
                            style={{ backgroundColor: event.color }}
                          >
                            <ChevronLeft className="w-3 h-3 text-white" />
                          </div>
                        )}
                        
                        <span className="truncate flex-1 font-medium">{event.title}</span>
                        
                        {/* 끝 핸들 - 하루짜리도 표시 */}
                        {canDrag && (isEnd || !isMulti) && (
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation()
                              handleDragStart(e, event, 'end')
                            }}
                            className="absolute right-0 top-0 bottom-0 w-5 flex items-center justify-center opacity-0 group-hover/event:opacity-100 cursor-ew-resize transition-all duration-200 rounded-r-md"
                            style={{ backgroundColor: event.color }}
                          >
                            <ChevronRight className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedDate(day)
                        setTimeout(() => {
                          selectedDateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }, 50)
                      }}
                      className="text-xs text-gray-500 hover:text-primary-600 font-medium px-1 transition-colors"
                    >
                      +{dayEvents.length - 3}개 더보기
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <EventModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        selectedDate={selectedDate}
        editEvent={editEvent}
      />

      <EventDetailModal
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        event={detailEvent}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 가이드 오버레이 */}
      {showGuide && (
        <div className="fixed inset-0 z-50">
          {/* 어두운 배경 */}
          <div className="absolute inset-0 bg-black/70" />
          
          {/* 가이드 카드 */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-80">
                    {guideStep + 1} / {GUIDE_STEPS.length}
                  </span>
                  <button
                    onClick={() => handleGuideClose(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-xl font-bold">{GUIDE_STEPS[guideStep].title}</h3>
              </div>
              
              {/* 내용 */}
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  {GUIDE_STEPS[guideStep].description}
                </p>
                
                {/* 시각적 힌트 */}
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  {guideStep === 0 && (
                    <div className="flex items-center gap-2 text-primary-600">
                      <Plus className="w-5 h-5" />
                      <span className="font-medium">새 일정 버튼을 클릭해보세요</span>
                    </div>
                  )}
                  {guideStep === 1 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold">15</div>
                      <span>날짜를 클릭하면 상세 일정을 볼 수 있어요</span>
                    </div>
                  )}
                  {guideStep === 2 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <GripVertical className="w-5 h-5" />
                      <span>일정을 잡고 드래그해보세요</span>
                    </div>
                  )}
                  {guideStep === 3 && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs">
                        <ChevronLeft className="w-3 h-3" />
                        시작
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs">
                        종료
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                  {guideStep === 4 && (
                    <div className="text-gray-600">
                      <span>더 넓은 공간에서 편하게 조작하세요 ✨</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 푸터 */}
              <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-primary-600"
                    onChange={(e) => {
                      if (e.target.checked) {
                        localStorage.setItem('calendar-guide-seen', 'true')
                      } else {
                        localStorage.removeItem('calendar-guide-seen')
                      }
                    }}
                  />
                  <span className="text-sm text-gray-500">다시 보지 않기</span>
                </label>
                
                <div className="flex items-center gap-2">
                  {guideStep > 0 && (
                    <button
                      onClick={handleGuidePrev}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      이전
                    </button>
                  )}
                  <button
                    onClick={handleGuideNext}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {guideStep === GUIDE_STEPS.length - 1 ? '완료' : '다음'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
