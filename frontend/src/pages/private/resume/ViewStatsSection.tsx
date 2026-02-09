import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Loader2, Eye, TrendingUp, Calendar, Users } from 'lucide-react'

interface ViewStats {
  totalViews: number
  last30DaysViews: number
  dailyViews: { date: string; count: number }[]
}

export default function ViewStatsSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['resumeStats'],
    queryFn: async () => {
      const { data } = await api.get('/resume/stats')
      return data.data as ViewStats
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!stats) return null

  // 최근 7일 데이터 추출
  const last7Days = stats.dailyViews?.slice(-7) || []
  const maxCount = Math.max(...last7Days.map(d => d.count), 1)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900 mb-4">조회 통계</h3>
        
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">전체 조회수</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">최근 30일</span>
            </div>
            <p className="text-3xl font-bold">{stats.last30DaysViews.toLocaleString()}</p>
          </div>
        </div>

        {/* 일별 차트 */}
        {last7Days.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">최근 7일 조회수</span>
            </div>
            
            <div className="flex items-end justify-between gap-2 h-32">
              {last7Days.map((day, index) => {
                const height = (day.count / maxCount) * 100
                const date = new Date(day.date)
                const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end h-24">
                      <span className="text-xs font-medium text-primary-600 mb-1">
                        {day.count > 0 ? day.count : ''}
                      </span>
                      <div
                        className="w-full bg-primary-500 rounded-t-md transition-all duration-300"
                        style={{ height: `${Math.max(height, day.count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{dayName}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {stats.totalViews === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>아직 조회 기록이 없습니다</p>
            <p className="text-sm mt-1">이력서를 공개하면 조회 통계를 확인할 수 있습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
