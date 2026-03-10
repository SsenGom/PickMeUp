import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Eye, TrendingUp, BarChart3 } from 'lucide-react'

export default function ViewStatsSection() {
  const { data: stats } = useQuery({
    queryKey: ['resumeViewStats'],
    queryFn: async () => {
      const { data } = await api.get('/resume/view-stats')
      return data.data
    },
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-primary-600" />
            <span className="text-sm text-gray-500">총 조회수</span>
          </div>
          <p className="text-3xl font-bold">{stats?.totalViews ?? 0}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">최근 30일</span>
          </div>
          <p className="text-3xl font-bold">{stats?.last30DaysViews ?? 0}</p>
        </div>
      </div>

      {stats?.dailyViews && stats.dailyViews.length > 0 && (
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            일별 조회수
          </h3>
          <div className="space-y-2">
            {stats.dailyViews.slice(0, 14).map((d: any, i: number) => {
              const maxCount = Math.max(...stats.dailyViews.map((x: any) => x.count))
              const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 shrink-0">{d.date}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-primary-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-600 w-6 text-right">{d.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {(!stats?.dailyViews || stats.dailyViews.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          <Eye className="w-12 h-12 mx-auto mb-4 text-gray-200" />
          <p>아직 조회 데이터가 없습니다</p>
          <p className="text-sm mt-1">이력서를 공개하면 통계가 쌓입니다</p>
        </div>
      )}
    </div>
  )
}
