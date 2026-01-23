import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { MessageThread, ThreadDetail } from '@/types'
import { formatRelativeTime, cn } from '@/lib/utils'
import { Mail, Star, Archive, Search, ChevronLeft, Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InboxPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const queryClient = useQueryClient()

  const { data: threads, isLoading } = useQuery({
    queryKey: ['threads'],
    queryFn: async () => {
      const { data } = await api.get('/inbox')
      return data.data.content as MessageThread[]
    },
  })

  const { data: threadDetail } = useQuery({
    queryKey: ['thread', selectedThreadId],
    queryFn: async () => {
      const { data } = await api.get(`/inbox/${selectedThreadId}`)
      return data.data as ThreadDetail
    },
    enabled: !!selectedThreadId,
  })

  const toggleStarMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/inbox/${id}/star`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/inbox/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
      setSelectedThreadId(null)
      toast.success('보관되었습니다')
    },
  })

  const replyMutation = useMutation({
    mutationFn: (content: string) => api.post(`/inbox/${selectedThreadId}/reply`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', selectedThreadId] })
      setReplyContent('')
      toast.success('답장을 보냈습니다')
    },
  })

  const filteredThreads = threads?.filter(
    (thread) =>
      thread.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.senderEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Thread List */}
      <div className={cn(
        'w-full lg:w-1/3 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col',
        selectedThreadId && 'hidden lg:flex'
      )}>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="메시지 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : filteredThreads && filteredThreads.length > 0 ? (
            filteredThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className={cn(
                  'w-full text-left p-4 border-b hover:bg-gray-50 transition-colors',
                  selectedThreadId === thread.id && 'bg-primary-50',
                  thread.status === 'UNREAD' && 'bg-blue-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {thread.senderName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn('font-medium truncate', thread.status === 'UNREAD' && 'font-bold')}>
                        {thread.senderName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(thread.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{thread.subject || '(제목 없음)'}</p>
                    <p className="text-sm text-gray-400 truncate">{thread.lastMessagePreview}</p>
                  </div>
                  {thread.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>메시지가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* Thread Detail */}
      {selectedThreadId ? (
        <div className="flex-1 bg-white rounded-xl shadow-sm ml-0 lg:ml-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b">
            <button
              onClick={() => setSelectedThreadId(null)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="font-semibold">{threadDetail?.senderName}</h2>
              <p className="text-sm text-gray-500">{threadDetail?.senderEmail}</p>
            </div>
            <button
              onClick={() => toggleStarMutation.mutate(selectedThreadId)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Star
                className={cn(
                  'w-5 h-5',
                  threadDetail?.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                )}
              />
            </button>
            <button
              onClick={() => archiveMutation.mutate(selectedThreadId)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Archive className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {threadDetail?.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'max-w-[80%] p-4 rounded-xl',
                  message.direction === 'INBOUND'
                    ? 'bg-gray-100'
                    : 'bg-primary-600 text-white ml-auto'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p
                  className={cn(
                    'text-xs mt-2',
                    message.direction === 'INBOUND' ? 'text-gray-500' : 'text-primary-200'
                  )}
                >
                  {formatRelativeTime(message.createdAt)}
                </p>
              </div>
            ))}
          </div>

          {/* Reply Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답장을 입력하세요..."
                className="flex-1 px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
              <button
                onClick={() => replyMutation.mutate(replyContent)}
                disabled={!replyContent.trim() || replyMutation.isPending}
                className="px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {replyMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-white rounded-xl shadow-sm ml-4">
          <div className="text-center text-gray-500">
            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>메시지를 선택하세요</p>
          </div>
        </div>
      )}
    </div>
  )
}
