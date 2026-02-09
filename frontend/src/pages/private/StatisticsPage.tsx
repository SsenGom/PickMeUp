import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  Target,
  Award,
  Activity,
  BarChart3,
} from "lucide-react";

interface Statistics {
  totalApplications: number;
  activeApplications: number;
  interviews: number;
  offers: number;
  thisWeekApplications: number;
  thisMonthApplications: number;
  averageResponseTime: number;
  successRate: number;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 연결
      // const { data } = await api.get('/statistics');
      
      // 임시 데이터
      setStats({
        totalApplications: 24,
        activeApplications: 8,
        interviews: 5,
        offers: 2,
        thisWeekApplications: 3,
        thisMonthApplications: 12,
        averageResponseTime: 7,
        successRate: 8.3,
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 통계</h1>
        <p className="text-gray-600 mt-2">취업 활동 현황을 한눈에 확인하세요</p>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 지원</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              이번 달 +{stats?.thisMonthApplications}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행 중</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeApplications}</div>
            <p className="text-xs text-muted-foreground">
              이번 주 +{stats?.thisWeekApplications}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">면접</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.interviews}</div>
            <p className="text-xs text-muted-foreground">
              전환율 {((stats?.interviews! / stats?.totalApplications!) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최종 합격</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.offers}</div>
            <p className="text-xs text-muted-foreground">
              성공률 {stats?.successRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 추가 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📈 이번 달 활동</CardTitle>
            <CardDescription>월별 지원 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">지원</span>
                <span className="text-lg font-semibold">{stats?.thisMonthApplications}건</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(stats?.thisMonthApplications! / 30) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">면접</span>
                <span className="text-lg font-semibold">{stats?.interviews}건</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(stats?.interviews! / stats?.totalApplications!) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">합격</span>
                <span className="text-lg font-semibold">{stats?.offers}건</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${(stats?.offers! / stats?.totalApplications!) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⏱️ 평균 응답 시간</CardTitle>
            <CardDescription>서류 결과까지 걸린 평균 시간</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-5xl font-bold text-primary-600">
                {stats?.averageResponseTime}
              </div>
              <div className="text-lg text-gray-600 mt-2">일</div>
              
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold text-green-600">3일</div>
                  <div className="text-gray-500">최단</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">7일</div>
                  <div className="text-gray-500">평균</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">14일</div>
                  <div className="text-gray-500">최장</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 인사이트 */}
      <Card>
        <CardHeader>
          <CardTitle>💡 인사이트</CardTitle>
          <CardDescription>AI가 분석한 취업 활동 팁</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">지원 속도 증가</p>
                <p className="text-sm text-blue-700">
                  이번 주 지원 수가 저번 주 대비 40% 증가했어요. 좋은 흐름이에요!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <Target className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">높은 서류 합격률</p>
                <p className="text-sm text-green-700">
                  서류 합격률이 평균(15%)보다 높아요. 이력서가 잘 작성되어 있네요!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">응답 대기 중</p>
                <p className="text-sm text-yellow-700">
                  5개 회사에서 아직 응답이 없어요. 평균 응답 시간은 7일이니 조금만 기다려보세요.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TODO: 차트 추가 (Recharts or Chart.js) */}
      <Card>
        <CardHeader>
          <CardTitle>📊 월별 추이</CardTitle>
          <CardDescription>지난 6개월 지원 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>차트 기능은 곧 추가됩니다</p>
              <p className="text-sm mt-1">Recharts 라이브러리 설치 필요</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
