/**
 * 할 일 페이지
 * 
 * 주요 기술:
 * - React Query: 서버 상태 관리 (캐싱, 동기화)
 * - Tailwind CSS: 유틸리티 기반 스타일링
 * 
 * React Query 핵심 개념:
 * - useQuery: 데이터 조회 (GET)
 * - useMutation: 데이터 변경 (POST, PUT, DELETE)
 * - invalidateQueries: 캐시 무효화 → 자동 재조회
 * 
 * CRUD 흐름:
 * [조회] useQuery → GET /api/tasks → 캐싱
 * [생성] useMutation → POST /api/tasks → invalidate → 재조회
 * [수정] useMutation → PATCH /api/tasks/:id → invalidate → 재조회
 * [삭제] useMutation → DELETE /api/tasks/:id → invalidate → 재조회
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Task } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import { Plus, Check, Trash2, Edit2, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TasksPage() {
  // ===== 로컬 상태 =====
  const [showForm, setShowForm] = useState(false)          // 생성 폼 모달
  const [_editingTask, setEditingTask] = useState<Task | null>(null)  // 수정 중인 태스크
  const [filter, setFilter] = useState<string>('all')      // 필터 (all/active/done)
  
  /**
   * queryClient: React Query 캐시 관리
   * 
   * 캐시 무효화할 때 사용
   * queryClient.invalidateQueries({ queryKey: ['tasks'] })
   * → 'tasks' 키의 캐시 무효화 → 자동으로 다시 fetch
   */
  const queryClient = useQueryClient()

  /**
   * useQuery - 데이터 조회
   * 
   * queryKey: 캐시 키 (배열 형태)
   *   - ['tasks']: 전체 태스크
   *   - ['tasks', 1]: 특정 태스크
   *   - ['tasks', { status: 'DONE' }]: 조건부
   * 
   * queryFn: 실제 데이터 fetch 함수
   * 
   * 반환값:
   * - data: 조회된 데이터
   * - isLoading: 최초 로딩 중
   * - isError: 에러 발생
   * - refetch: 수동 재조회
   * 
   * 자동 기능:
   * - 캐싱 (같은 요청 중복 방지)
   * - 백그라운드 refetch
   * - 에러 재시도
   */
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await api.get('/tasks')
      return data.data as Task[]
    },
  })

  /**
   * useMutation - 데이터 변경 (생성)
   * 
   * useQuery와 달리 자동 실행 안 됨
   * mutate() 또는 mutateAsync() 호출 시 실행
   * 
   * mutationFn: 실제 API 호출 함수
   * 
   * 콜백:
   * - onSuccess: 성공 시 (캐시 무효화, 토스트 등)
   * - onError: 실패 시
   * - onSettled: 성공/실패 무관하게 항상
   * 
   * 반환값:
   * - mutate: 비동기 실행 (콜백으로 결과 처리)
   * - mutateAsync: Promise 반환 (await 가능)
   * - isPending: 진행 중 여부
   */
  const createMutation = useMutation({
    mutationFn: (task: Partial<Task>) => api.post('/tasks', task),
    onSuccess: () => {
      // 캐시 무효화 → 'tasks' 쿼리 자동 재실행
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setShowForm(false)
      toast.success('할 일이 추가되었습니다')
    },
  })

  /**
   * 상태 변경 Mutation
   */
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/tasks/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  /**
   * 삭제 Mutation
   */
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('할 일이 삭제되었습니다')
    },
  })

  /**
   * 필터링된 태스크 목록
   * 
   * 클라이언트 사이드 필터링
   * (대량 데이터면 서버에서 필터링하는 게 좋음)
   */
  const filteredTasks = tasks?.filter((task) => {
    if (filter === 'all') return true
    if (filter === 'active') return task.status !== 'DONE' && task.status !== 'CANCELLED'
    if (filter === 'done') return task.status === 'DONE'
    return true
  })

  /**
   * 우선순위별 색상 매핑
   * 
   * Tailwind 클래스를 객체로 관리
   */
  const priorityColors = {
    URGENT: 'bg-red-100 text-red-700',
    HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    LOW: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">할 일</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 할 일
        </button>
      </div>

      {/* 필터 버튼 */}
      <div className="flex gap-2">
        {['all', 'active', 'done'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-lg transition-colors',
              filter === f ? 'bg-primary-600 text-white' : 'bg-white hover:bg-gray-100'
            )}
          >
            {f === 'all' ? '전체' : f === 'active' ? '진행 중' : '완료'}
          </button>
        ))}
      </div>

      {/* 태스크 목록 */}
      {isLoading ? (
        // 로딩 상태
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filteredTasks && filteredTasks.length > 0 ? (
        // 태스크 있음
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'bg-white rounded-xl shadow-sm p-4 flex items-center gap-4',
                task.status === 'DONE' && 'opacity-60'  // 완료된 항목 흐리게
              )}
            >
              {/* 완료 토글 버튼 */}
              <button
                onClick={() =>
                  updateStatusMutation.mutate({
                    id: task.id,
                    status: task.status === 'DONE' ? 'TODO' : 'DONE',
                  })
                }
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                  task.status === 'DONE'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-primary-500'
                )}
              >
                {task.status === 'DONE' && <Check className="w-4 h-4" />}
              </button>

              {/* 태스크 정보 */}
              <div className="flex-1 min-w-0">
                <p className={cn('font-medium', task.status === 'DONE' && 'line-through text-gray-500')}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {/* 우선순위 뱃지 */}
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', priorityColors[task.priority])}>
                    {task.priority}
                  </span>
                  {/* 마감일 */}
                  {task.dueDate && (
                    <span className={cn('text-sm', task.isOverdue ? 'text-red-600' : 'text-gray-500')}>
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                  {/* 카테고리 */}
                  {task.category && (
                    <span className="text-sm text-gray-400">#{task.category}</span>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingTask(task)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(task.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 빈 상태
        <div className="text-center py-12 text-gray-500">
          할 일이 없습니다. 새로운 할 일을 추가해보세요!
        </div>
      )}

      {/* 생성 모달 */}
      {showForm && (
        <TaskFormModal
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  )
}

/**
 * 태스크 폼 모달 컴포넌트
 * 
 * 생성/수정 공용
 * defaultValues가 있으면 수정 모드
 */
function TaskFormModal({
  onClose,
  onSubmit,
  isLoading,
  defaultValues,
}: {
  onClose: () => void
  onSubmit: (data: Partial<Task>) => void
  isLoading: boolean
  defaultValues?: Partial<Task>
}) {
  // 폼 상태 (Controlled Components)
  const [title, setTitle] = useState(defaultValues?.title || '')
  const [description, setDescription] = useState(defaultValues?.description || '')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>(defaultValues?.priority || 'MEDIUM')
  const [dueDate, setDueDate] = useState(defaultValues?.dueDate || '')
  const [category, setCategory] = useState(defaultValues?.category || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()  // 기본 폼 제출 방지 (페이지 새로고침 방지)
    onSubmit({ 
      title, 
      description, 
      priority: priority as any, 
      dueDate: dueDate || undefined,  // 빈 문자열이면 undefined
      category: category || undefined 
    })
  }

  return (
    // 모달 오버레이 (배경)
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* 모달 컨테이너 */}
      <div className="bg-white rounded-xl w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">새 할 일</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>

          {/* 우선순위 & 마감일 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="LOW">낮음</option>
                <option value="MEDIUM">보통</option>
                <option value="HIGH">높음</option>
                <option value="URGENT">긴급</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="예: 업무, 개인"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || !title}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
