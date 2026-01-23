import { X, Pencil, Trash2, Calendar, Clock, AlignLeft, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarEvent } from '@/types'
import { useModalKeyboard } from '@/hooks/useModalKeyboard'

interface EventDetailModalProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent | null
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: number) => void
}

export default function EventDetailModal({ isOpen, onClose, event, onEdit, onDelete }: EventDetailModalProps) {
  useModalKeyboard(isOpen, onClose)
  
  if (!isOpen || !event) return null

  const handleEdit = () => {
    onEdit(event)
    onClose()
  }

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      onDelete(event.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Color Line */}
        <div 
          className="h-2.5"
          style={{ backgroundColor: event.color }}
        />

        {/* Header */}
        <div className="p-6 flex items-start justify-between border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-2xl font-bold truncate">{event.title}</h2>
            {event.recurrenceType === 'DAILY' && (
              <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                <Repeat className="w-4 h-4" />
                <span>매일 반복</span>
              </div>
            )}
            {event.recurrenceType === 'MONTHLY' && (
              <div className="flex items-center gap-2 mt-2 text-sm text-purple-600">
                <Repeat className="w-4 h-4" />
                <span>매달 {new Date(event.startAt).getDate()}일 반복</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content - 고정 높이 */}
        <div className="p-6 space-y-5 h-72">
          {/* 날짜 */}
          <div className="flex items-center gap-4">
            <Calendar className="w-6 h-6 text-gray-400" />
            <div className="text-lg">
              <span className="font-medium">
                {format(new Date(event.startAt), 'M월 d일 (EEE)', { locale: ko })}
              </span>
              {format(new Date(event.startAt), 'yyyy-MM-dd') !== format(new Date(event.endAt), 'yyyy-MM-dd') && (
                <span className="text-gray-500">
                  {' → '}{format(new Date(event.endAt), 'M월 d일 (EEE)', { locale: ko })}
                </span>
              )}
            </div>
          </div>

          {/* 시간 */}
          <div className="flex items-center gap-4">
            <Clock className="w-6 h-6 text-gray-400" />
            <span className="text-lg">
              {event.isAllDay ? (
                <span className="text-gray-500">종일</span>
              ) : (
                <span className="font-medium">
                  {format(new Date(event.startAt), 'a h:mm', { locale: ko })} - {format(new Date(event.endAt), 'a h:mm', { locale: ko })}
                </span>
              )}
            </span>
          </div>

          {/* 설명 */}
          <div className="flex items-start gap-4">
            <AlignLeft className="w-6 h-6 text-gray-400 mt-0.5" />
            <p className="text-lg text-gray-600 whitespace-pre-wrap line-clamp-5">
              {event.description || '설명 없음'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 p-5 flex justify-end gap-3">
          <button
            onClick={handleDelete}
            className="px-5 py-2.5 flex items-center gap-2 text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            삭제
          </button>
          <button
            onClick={handleEdit}
            className="px-5 py-2.5 flex items-center gap-2 text-base bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Pencil className="w-5 h-5" />
            수정
          </button>
        </div>
      </div>
    </div>
  )
}
