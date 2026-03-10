/**
 * ProjectRichEditor
 * - Tiptap 기반 리치 에디터
 * - 이미지: 드래그앤드롭 / 툴바 버튼
 * - AI 정리: 작성 내용을 A안/B안으로 정리 (하루 5회, 어드민 무제한)
 */
import { useRef, useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Heading1, Heading2, Heading3, Link as LinkIcon, Image as ImageIcon,
  Quote, Minus, Sparkles, X, Loader2, CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  projectTitle?: string
}

// ─── AI 정리 모달 ─────────────────────────────────────────────────────────────

function AIRefineModal({
  content,
  projectTitle,
  onApply,
  onClose,
}: {
  content: string
  projectTitle?: string
  onApply: (html: string) => void
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [usage, setUsage] = useState<{ remaining: number; limit: number } | null>(null)
  const [result, setResult] = useState<{ planA: string; planB: string } | null>(null)
  const [selected, setSelected] = useState<'A' | 'B' | null>(null)

  useEffect(() => {
    api.get('/resume/refine-usage').then(r => setUsage(r.data.data)).catch(() => {})
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const generate = async () => {
    const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!plainText || plainText.length < 20) {
      toast.error('내용을 먼저 충분히 작성해주세요 (20자 이상)')
      return
    }
    setLoading(true)
    setResult(null)
    setSelected(null)
    try {
      const { data } = await api.post('/resume/refine-content', {
        content,
        projectTitle: projectTitle || '',
      })
      setResult({ planA: data.data.planA, planB: data.data.planB })
      setUsage(prev => prev ? { ...prev, remaining: data.data.remaining } : null)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'AI 정리 실패')
    } finally {
      setLoading(false)
    }
  }

  const apply = () => {
    if (!result || !selected) return
    onApply(selected === 'A' ? result.planA : result.planB)
    toast.success(`${selected}안이 적용됐습니다`)
    onClose()
  }

  const isUnlimited = usage?.limit === 999
  const canUse = isUnlimited || (usage?.remaining ?? 1) > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold text-gray-800">AI 내용 정리</span>
            {usage && (
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                isUnlimited ? 'bg-yellow-100 text-yellow-700' :
                usage.remaining > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600')}>
                {isUnlimited ? '⭐ 어드민' : `오늘 ${usage.remaining}/${usage.limit}회 남음`}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 바디 */}
        <div className="flex-1 overflow-y-auto">
          {!result ? (
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                작성하신 내용을 AI가 <strong>A안</strong>과 <strong>B안</strong> 두 가지 구성으로 정리해드립니다.
              </p>
              {/* 현재 내용 미리보기 */}
              <div className="bg-gray-50 rounded-lg p-3 border">
                <p className="text-xs text-gray-400 mb-1">현재 작성된 내용</p>
                <p className="text-sm text-gray-700 line-clamp-4">
                  {content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '(내용 없음)'}
                </p>
              </div>
              {!canUse && !isUnlimited && (
                <p className="text-xs text-red-500 text-center">오늘 사용 한도를 모두 사용했습니다 (하루 {usage?.limit}회)</p>
              )}
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-500 text-center">마음에 드는 안을 선택 후 적용하세요</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* A안 */}
                <button
                  onClick={() => setSelected('A')}
                  className={cn(
                    'text-left rounded-xl border-2 p-4 transition-all relative',
                    selected === 'A'
                      ? 'border-indigo-400 bg-indigo-50/50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                  )}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">A안</span>
                    {selected === 'A' && <CheckCircle2 className="w-4 h-4 text-indigo-500 ml-auto" />}
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-gray-700 pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: result.planA }}
                  />
                </button>

                {/* B안 */}
                <button
                  onClick={() => setSelected('B')}
                  className={cn(
                    'text-left rounded-xl border-2 p-4 transition-all relative',
                    selected === 'B'
                      ? 'border-emerald-400 bg-emerald-50/50 shadow-md'
                      : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                  )}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">B안</span>
                    {selected === 'B' && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-gray-700 pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: result.planB }}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-2 px-5 py-4 border-t shrink-0">
          {!result ? (
            <>
              <button onClick={onClose}
                className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50">
                취소
              </button>
              <button onClick={generate}
                disabled={loading || !canUse}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-indigo-700 flex items-center justify-center gap-2">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />정리 중...</>
                  : <><Sparkles className="w-4 h-4" />AI로 정리하기</>}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setResult(null); setSelected(null) }}
                className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50">
                ← 다시 생성
              </button>
              <button onClick={apply}
                disabled={!selected}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-indigo-700 flex items-center justify-center gap-2">
                {selected ? `${selected}안 적용하기` : '안을 선택해주세요'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 메인 에디터 ──────────────────────────────────────────────────────────────

export default function ProjectRichEditor({ content, onChange, placeholder, className, projectTitle }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [showRefine, setShowRefine] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const isInternalUpdate = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full my-2' } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' } }),
      Placeholder.configure({ placeholder: placeholder || '프로젝트를 상세히 설명해주세요...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    if (isInternalUpdate.current) { isInternalUpdate.current = false; return }
    const currentHTML = editor.getHTML()
    if (currentHTML !== content) editor.commands.setContent(content || '', false)
  }, [content, editor])

  const uploadImage = useCallback(async (file: File) => {
    if (!editor) return
    if (file.size > 10 * 1024 * 1024) { toast.error('10MB 이하 이미지만 가능합니다'); return }
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post('/resume/project-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      editor.chain().focus().setImage({ src: data.data?.url || '' }).run()
      toast.success('이미지 삽입됨')
    } catch {
      const reader = new FileReader()
      reader.onloadend = () => editor.chain().focus().setImage({ src: reader.result as string }).run()
      reader.readAsDataURL(file)
      toast('이미지를 로컬로 삽입했습니다', { icon: '⚠️' })
    }
  }, [editor])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).forEach(uploadImage)
  }, [uploadImage])

  // AI 정리 결과 적용
  const applyRefined = useCallback((html: string) => {
    if (!editor) return
    editor.commands.setContent(html, false)
    onChange(html)
  }, [editor, onChange])

  if (!editor) return null

  const ToolBtn = ({ onClick, active, title, children }: {
    onClick: () => void; active?: boolean; title: string; children: React.ReactNode
  }) => (
    <button type="button" onMouseDown={e => { e.preventDefault(); onClick() }} title={title}
      className={cn('p-1.5 rounded-md transition-all shrink-0',
        active ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100')}>
      {children}
    </button>
  )

  const Sep = () => <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

  return (
    <div className={cn('border rounded-xl overflow-hidden bg-white', isDragging && 'ring-2 ring-primary-400 border-primary-400', className)}>
      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-gray-50 sticky top-0 z-10">
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })} title="제목1"><Heading1 className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="제목2"><Heading2 className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="제목3"><Heading3 className="w-4 h-4" /></ToolBtn>
        <Sep />
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="굵게"><Bold className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="기울임"><Italic className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="취소선"><Strikethrough className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')} title="인라인 코드"><Code className="w-4 h-4" /></ToolBtn>
        <Sep />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="불릿 목록"><List className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="번호 목록"><ListOrdered className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="인용구"><Quote className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">
          <Minus className="w-4 h-4" /></ToolBtn>
        <Sep />
        <ToolBtn onClick={() => {
          const prev = editor.getAttributes('link').href
          const url = window.prompt('URL 입력', prev)
          if (url === null) return
          if (url === '') { editor.chain().focus().unsetLink().run(); return }
          editor.chain().focus().setLink({ href: url }).run()
        }} active={editor.isActive('link')} title="링크"><LinkIcon className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => fileRef.current?.click()} title="이미지 삽입">
          <ImageIcon className="w-4 h-4" /></ToolBtn>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />

        {/* AI 정리 버튼 */}
        <Sep />
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); setShowRefine(true) }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-all shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          AI 정리
        </button>
      </div>

      {/* AI 정리 모달 */}
      {showRefine && (
        <AIRefineModal
          content={content}
          projectTitle={projectTitle}
          onApply={applyRefined}
          onClose={() => setShowRefine(false)}
        />
      )}

      {/* 에디터 영역 */}
      <div onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} className="relative">
        {isDragging && (
          <div className="absolute inset-0 bg-primary-50/80 border-2 border-dashed border-primary-400 rounded-b-xl z-10 flex items-center justify-center pointer-events-none">
            <div className="text-center text-primary-600">
              <ImageIcon className="w-8 h-8 mx-auto mb-1" />
              <p className="text-sm font-medium">이미지를 여기에 드롭하세요</p>
            </div>
          </div>
        )}
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px]"
        />
      </div>
    </div>
  )
}
