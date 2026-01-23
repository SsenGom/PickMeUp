import { useQuery } from '@tanstack/react-query'
import { ImportantDate } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import { Plus, Gift, Calendar, CreditCard, Bell, Star } from 'lucide-react'

const typeIcons = {
  ANNIVERSARY: Star,
  BIRTHDAY: Gift,
  DEADLINE: Calendar,
  PAYMENT: CreditCard,
  SUBSCRIPTION: Bell,
  APPOINTMENT: Calendar,
  CUSTOM: Star,
}

const typeLabels = {
  ANNIVERSARY: '기념일',
  BIRTHDAY: '생일',
  DEADLINE: '마감일',
  PAYMENT: '결제일',
  SUBSCRIPTION: '구독 갱신',
  APPOINTMENT: '예약',
  CUSTOM: '기타',
}

export default function ImportantDatesPage() {
  const { data: importantDates } = useQuery({
    queryKey: ['importantDates'],
    queryFn: async () => {
      // TODO: API 엔드포인트 구현 필요
      return [] as ImportantDate[]
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">중요일</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-5 h-5" />
          새 중요일
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-gray-500 text-sm">오늘</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-gray-500 text-sm">이번 주</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-gray-500 text-sm">이번 달</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-3">
            <Star className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold">0</p>
          <p className="text-gray-500 text-sm">전체</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm">
        {importantDates && importantDates.length > 0 ? (
          <div className="divide-y">
            {importantDates.map((item) => {
              const Icon = typeIcons[item.type]
              return (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: item.color + '20' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      {typeLabels[item.type]} • {formatDate(item.nextOccurrence)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-lg font-bold',
                        item.daysRemaining <= 0 ? 'text-red-600' :
                        item.daysRemaining <= 7 ? 'text-orange-600' : 'text-gray-600'
                      )}
                    >
                      {item.daysRemaining === 0 ? 'D-Day' :
                       item.daysRemaining > 0 ? `D-${item.daysRemaining}` : `D+${Math.abs(item.daysRemaining)}`}
                    </p>
                    {item.isRecurring && (
                      <p className="text-xs text-gray-400">반복</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>등록된 중요일이 없습니다</p>
            <p className="text-sm mt-1">기념일, 생일, 마감일 등을 추가해보세요</p>
          </div>
        )}
      </div>
    </div>
  )
}
