import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { BarChart3, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function StatisticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['jobStatistics'],
    queryFn: async () => {
      const { data } = await api.get('/jobs/statistics')
      return data.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const overall = stats?.overallStats
  const status = stats?.statusStats
  const success = stats?.successRate

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">취업 활동 통계</h1>

      {/* 전체 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label="총 지원" value={overall?.totalApplications ?? 0} color="blue" />
        <StatCard icon={Clock} label="진행 중" value={overall?.activeApplications ?? 0} color="yellow" />
        <StatCard icon={CheckCircle} label="최종 합격" value={status?.finalPassed ?? 0} color="green" />
        <StatCard icon={XCircle} label="불합격" value={status?.rejected ?? 0} color="red" />
      </div>

      {/* 합격률 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          합격률 분석
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RateBar label="서류 합격률" rate={success?.documentPassRate ?? 0} />
          <RateBar label="면접 합격률" rate={success?.interviewPassRate ?? 0} />
          <RateBar label="최종 합격률" rate={success?.overallPassRate ?? 0} />
        </div>
      </div>

      {/* 상태별 현황 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">상태별 현황</h2>
        <div className="space-y-3">
          {[
            { label: '관심', key: 'interested', color: 'bg-gray-400' },
            { label: '지원', key: 'applied', color: 'bg-blue-400' },
            { label: '서류 합격', key: 'documentPassed', color: 'bg-yellow-400' },
            { label: '면접', key: 'interviewing', color: 'bg-purple-400' },
            { label: '최종 합격', key: 'finalPassed', color: 'bg-green-400' },
            { label: '불합격', key: 'rejected', color: 'bg-red-400' },
          ].map(({ label, key, color }) => {
            const count = status?.[key] ?? 0
            const total = overall?.totalApplications || 1
            const pct = Math.round((count / total) * 100)
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-20 text-sm text-gray-600 shrink-0">{label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-sm text-right text-gray-700">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 월별 추이 */}
      {stats?.monthlyTrends && stats.monthlyTrends.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">월별 지원 추이</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-2">월</th>
                  <th className="text-right py-2">지원</th>
                  <th className="text-right py-2">합격</th>
                  <th className="text-right py-2">불합격</th>
                </tr>
              </thead>
              <tbody>
                {stats.monthlyTrends.map((row: any) => (
                  <tr key={row.month} className="border-b last:border-0">
                    <td className="py-2">{row.month}</td>
                    <td className="text-right py-2">{row.applicationCount}</td>
                    <td className="text-right py-2 text-green-600">{row.passedCount}</td>
                    <td className="text-right py-2 text-red-500">{row.rejectedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function RateBar({ label, rate }: { label: string; rate: number }) {
  const pct = Math.round(rate)
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className="h-full bg-primary-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
