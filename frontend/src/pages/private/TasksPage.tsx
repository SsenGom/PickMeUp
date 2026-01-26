import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  Plus, CheckCircle2, Circle, Trash2, X, Loader2,
  Calendar, Flag, Edit2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Task {
  id: number
  title: string
  description: string
  dueDate: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  jobPostingId?: number
  jobPostingTitle?: string
  createdAt: string
}

type FilterType = 'all' | 'todo' | 'in_progress' | 'done'
type SortType = 'dueDate' | 'priority' | 'createdAt'

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('dueDate')
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await api.get('/tasks')
      return data.data as Task[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('삭제되었습니다')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/tasks/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // 필터링
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true
    if (filter === 'todo') return task.status === 'TODO'
    if (filter === 'in_progress') return task.status === 'IN_PROGRESS'
    if (filter === 'done') return task.status === 'DONE'
    return true
  })

  // 정렬
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'dueDate') {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    if (sort === 'priority') {
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const priorityColors = {
    LOW: 'text-gray-400',
    MEDIUM: 'text-blue-500',
    HIGH: 'text-orange-500',
    URGENT: 'text-red-500',
  }

  const statusCounts = {
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  }

  const toggleStatus = (task: Task) => {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE'
    statusMutation.mutate({ id: task.id, status: nextStatus })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">할 일</h1>
          <p className="text-sm text-gray-500 mt-1">
            {statusCounts.todo}개 진행 예정 · {statusCounts.inProgress}개 진행 중 · {statusCounts.done}개 완료
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingTask(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          할 일 추가
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { key: 'all', label: '전체' },
            { key: 'todo', label: '예정' },
            { key: 'in_progress', label: '진행 중' },
            { key: 'done', label: '완료' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as FilterType)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                filter === f.key
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">정렬:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="text-sm border rounded-lg px-2 py-1"
          >
            <option value="dueDate">마감일</option>
            <option value="priority">우선순위</option>
            <option value="createdAt">생성일</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {sortedTasks.length > 0 ? (
        <div className="space-y-2">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'bg-white rounded-lg border p-4 hover:shadow-sm transition-all',
                task.status === 'DONE' && 'opacity-60'
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleStatus(task)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {task.status === 'DONE' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 hover:text-primary-500" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        'font-medium',
                        task.status === 'DONE' && 'line-through text-gray-400'
                      )}
                    >
                      {task.title}
                    </h3>
                    <Flag className={cn('w-4 h-4', priorityColors[task.priority])} />
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.jobPostingTitle && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded">
                        {task.jobPostingTitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingTask(task); setShowForm(true) }}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(task.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">
            {filter === 'all' ? '등록된 할 일이 없습니다' : '해당 조건의 할 일이 없습니다'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-primary-600 hover:underline"
          >
            첫 할 일 추가하기
          </button>
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskFormModal
          task={editingTask}
          onClose={() => { setShowForm(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}

function TaskFormModal({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [dueDate, setDueDate] = useState(task?.dueDate?.split('T')[0] || '')
  const [priority, setPriority] = useState(task?.priority || 'MEDIUM')
  const [status, setStatus] = useState(task?.status || 'TODO')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) =>
      task ? api.put(`/tasks/${task.id}`, data) : api.post('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success(task ? '수정되었습니다' : '추가되었습니다')
      onClose()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '저장에 실패했습니다')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('제목을 입력해주세요')
      return
    }
    mutation.mutate({
      title,
      description,
      dueDate: dueDate || null,
      priority,
      status,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{task ? '할 일 수정' : '할 일 추가'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="할 일을 입력하세요"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="상세 내용 (선택)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="LOW">낮음</option>
                <option value="MEDIUM">보통</option>
                <option value="HIGH">높음</option>
                <option value="URGENT">긴급</option>
              </select>
            </div>
          </div>

          {task && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="TODO">예정</option>
                <option value="IN_PROGRESS">진행 중</option>
                <option value="DONE">완료</option>
              </select>
            </div>
          )}

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
              disabled={mutation.isPending}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {mutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                '저장'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
