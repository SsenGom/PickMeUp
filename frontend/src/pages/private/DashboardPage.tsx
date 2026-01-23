import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Task, TaskStats, CalendarEvent } from '@/types'
import { formatDate } from '@/lib/utils'
import { Calendar, CheckSquare, Star, AlertCircle, ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const { data: taskStats } = useQuery({
    queryKey: ['taskStats'],
    queryFn: async () => {
      const { data } = await api.get('/tasks/stats')
      return data.data as TaskStats
    },
  })

  const { data: activeTasks } = useQuery({
    queryKey: ['activeTasks'],
    queryFn: async () => {
      const { data } = await api.get('/tasks/active')
      return data.data as Task[]
    },
  })

  // 오늘 일정 가져오기
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

  const { data: todayEvents } = useQuery({
    queryKey: ['todayEvents'],
    queryFn: async () => {
      const { data } = await api.get('/calendar', {
        params: {
          start: todayStart.toISOString(),
          end: todayEnd.toISOString(),
        },
      })
      return data.data as CalendarEvent[]
    },
  })

  const { data: upcomingEvents } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: async () => {
      const { data } = await api.get('/calendar/upcoming')
      return data.data as CalendarEvent[]
    },
  })

  // 오늘 일정 필터링 (반복 일정 포함)
  const getTodayEvents = () => {
    if (!todayEvents) return []
    
    return todayEvents.filter((event) => {
      const eventStart = new Date(event.startAt)
      const eventEnd = new Date(event.endAt)
      
      // 매일 반복
      if (event.recurrenceType === 'DAILY') {
        return eventStart <= todayEnd && eventEnd >= todayStart
      }
      
      // 매달 반복
      if (event.recurrenceType === 'MONTHLY') {
        const eventDay = eventStart.getDate()
        const todayDay = today.getDate()
        return eventDay === todayDay && eventStart <= today
      }
      
      // 일반 일정
      return isSameDay(eventStart, today) || isSameDay(eventEnd, today) ||
        (eventStart <= today && eventEnd >= today)
    }).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }

  const todayEventsList = getTodayEvents()

  return (
    <div className="space-y-6">
      {/* Welcome - 작게 */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">안녕하세요, <span className="font-medium text-gray-900">{user?.name}</span>님 👋</p>
        <p className="text-sm text-gray-400">{format(today, 'yyyy년 M월 d일 EEEE', { locale: ko })}</p>
      </div>

      {/* 오늘의 일정 - 강조 */}
      <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-emerald-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-emerald-600 text-sm font-medium">TODAY</p>
              <h2 className="text-xl font-bold text-gray-900">{format(today, 'M월 d일 EEEE', { locale: ko })}</h2>
            </div>
          </div>
          <Link 
            to="/calendar" 
            className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-medium transition-colors"
          >
            캘린더 →
          </Link>
        </div>
        
        {todayEventsList.length > 0 ? (
          <div className="space-y-2">
            {todayEventsList.map((event) => (
              <div 
                key={event.id} 
                className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                style={{ backgroundColor: event.color + '15' }}
              >
                <div 
                  className="w-1.5 h-10 rounded-full" 
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{event.title}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.isAllDay 
                      ? '종일' 
                      : format(new Date(event.startAt), 'a h:mm', { locale: ko })
                    }
                    {event.recurrenceType === 'DAILY' && ' · 매일'}
                    {event.recurrenceType === 'MONTHLY' && ' · 매달'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <p>오늘 예정된 일정이 없습니다</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckSquare className="w-6 h-6" />}
          label="할 일"
          value={taskStats?.todo ?? 0}
          color="blue"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="진행 중"
          value={taskStats?.inProgress ?? 0}
          color="yellow"
        />
        <StatCard
          icon={<Star className="w-6 h-6" />}
          label="완료"
          value={taskStats?.done ?? 0}
          color="green"
        />
        <StatCard
          icon={<AlertCircle className="w-6 h-6" />}
          label="지연"
          value={taskStats?.overdue ?? 0}
          color="red"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Tasks */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">진행 중인 할 일</h2>
            <Link to="/tasks" className="text-primary-600 text-sm hover:underline flex items-center gap-1">
              전체 보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {activeTasks && activeTasks.length > 0 ? (
            <ul className="space-y-3">
              {activeTasks.slice(0, 5).map((task) => (
                <li key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.priority === 'URGENT' ? 'bg-red-500' :
                      task.priority === 'HIGH' ? 'bg-orange-500' :
                      task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}
                  />
                  <span className="flex-1 truncate">{task.title}</span>
                  {task.dueDate && (
                    <span className={`text-sm ${task.isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">진행 중인 할 일이 없습니다</p>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">다가오는 일정</h2>
            <Link to="/calendar" className="text-primary-600 text-sm hover:underline flex items-center gap-1">
              전체 보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <ul className="space-y-3">
              {upcomingEvents.slice(0, 5).map((event) => (
                <li key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">{formatDate(event.startAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">다가오는 일정이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color as keyof typeof colors]}`}>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  )
}
