import { useState, useRef, useCallback } from 'react'
import { 
  Bold, Italic, List, ListOrdered, Image, Link, Code, 
  Heading1, Heading2, Heading3, Quote, Minus, Eye, Edit3,
  Sparkles, Loader2, GitBranch, Database, Workflow, X
} from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface RichMarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export default function RichMarkdownEditor({ 
  value, 
  onChange, 
  placeholder,
  minHeight = '300px'
}: RichMarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit')
  const [showAIPanel, setShowAIPanel] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 텍스트 삽입 헬퍼
  const insertText = useCallback((before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || defaultText
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  // 툴바 버튼들
  const toolbarButtons: Array<{ icon?: React.ElementType; action?: () => void; title?: string; type?: string }> = [
    { icon: Bold, action: () => insertText('**', '**', '굵은 텍스트'), title: '굵게' },
    { icon: Italic, action: () => insertText('*', '*', '기울임'), title: '기울임' },
    { icon: Code, action: () => insertText('`', '`', 'code'), title: '인라인 코드' },
    { type: 'divider' },
    { icon: Heading1, action: () => insertText('\n# ', '\n', '제목'), title: '제목 1' },
    { icon: Heading2, action: () => insertText('\n## ', '\n', '제목'), title: '제목 2' },
    { icon: Heading3, action: () => insertText('\n### ', '\n', '제목'), title: '제목 3' },
    { type: 'divider' },
    { icon: List, action: () => insertText('\n- ', '\n'), title: '목록' },
    { icon: ListOrdered, action: () => insertText('\n1. ', '\n'), title: '번호 목록' },
    { icon: Quote, action: () => insertText('\n> ', '\n', '인용'), title: '인용' },
    { icon: Minus, action: () => insertText('\n---\n'), title: '구분선' },
    { type: 'divider' },
    { icon: Link, action: () => insertText('[', '](url)', '링크 텍스트'), title: '링크' },
    { icon: Image, action: () => fileInputRef.current?.click(), title: '이미지 삽입' },
  ]

  // 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post('/resume/upload-image?type=project', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const imageUrl = data.data.url
      insertText(`\n![${file.name}](${imageUrl})\n`)
      toast.success('이미지가 삽입되었습니다')
    } catch (err) {
      toast.error('이미지 업로드 실패')
    }

    e.target.value = ''
  }

  // 마크다운 -> HTML 변환 (간단 버전)
  const renderMarkdown = (text: string) => {
    // Mermaid 블록 처리
    let html = text.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
      return `<div class="mermaid-container" data-code="${encodeURIComponent(code.trim())}"><pre class="mermaid">${code}</pre></div>`
    })

    // 일반 마크다운 처리
    html = html
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>')
      .replace(/^---$/gm, '<hr class="my-6 border-gray-200" />')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:underline">$1</a>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />')

    return `<div class="prose prose-sm max-w-none"><p class="mb-4">${html}</p></div>`
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
        {toolbarButtons.map((btn, i) => 
          btn.type === 'divider' ? (
            <div key={i} className="w-px h-6 bg-gray-300 mx-1" />
          ) : btn.icon ? (
            <button
              key={i}
              type="button"
              onClick={btn.action}
              title={btn.title}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            >
              <btn.icon className="w-4 h-4 text-gray-600" />
            </button>
          ) : null
        )}

        <div className="flex-1" />

        {/* AI 버튼 */}
        <button
          type="button"
          onClick={() => setShowAIPanel(!showAIPanel)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            showAIPanel ? 'bg-violet-100 text-violet-700' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI 시각화
        </button>

        {/* 모드 전환 */}
        <div className="flex border rounded-lg overflow-hidden ml-2">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`px-3 py-1.5 text-sm ${mode === 'edit' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`px-3 py-1.5 text-sm ${mode === 'split' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 py-1.5 text-sm ${mode === 'preview' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Panel */}
      {showAIPanel && (
        <AIVisualizationPanel 
          content={value} 
          onInsert={(diagram) => {
            insertText(`\n\n${diagram}\n\n`)
            setShowAIPanel(false)
          }}
          onClose={() => setShowAIPanel(false)}
        />
      )}

      {/* Editor / Preview */}
      <div className={`flex ${mode === 'split' ? 'divide-x' : ''}`} style={{ minHeight }}>
        {/* Editor */}
        {(mode === 'edit' || mode === 'split') && (
          <div className={mode === 'split' ? 'w-1/2' : 'w-full'}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || '마크다운으로 작성해보세요...\n\n# 제목\n## 소제목\n- 목록\n**굵게** *기울임*'}
              className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm"
              style={{ minHeight }}
            />
          </div>
        )}

        {/* Preview */}
        {(mode === 'preview' || mode === 'split') && (
          <div 
            className={`${mode === 'split' ? 'w-1/2' : 'w-full'} p-4 overflow-auto bg-gray-50`}
            style={{ minHeight }}
          >
            {value ? (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
            ) : (
              <p className="text-gray-400 text-sm">미리보기가 여기에 표시됩니다</p>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )
}

// AI 시각화 패널
function AIVisualizationPanel({ 
  content, 
  onInsert, 
  onClose 
}: { 
  content: string
  onInsert: (diagram: string) => void
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [generatedDiagram, setGeneratedDiagram] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')

  const visualizationTypes = [
    { 
      id: 'architecture', 
      icon: GitBranch, 
      label: '프로젝트 구조',
      description: '시스템 아키텍처 다이어그램',
      prompt: '이 프로젝트의 시스템 아키텍처를 Mermaid flowchart로 시각화해줘. 주요 컴포넌트와 데이터 흐름을 보여줘.'
    },
    { 
      id: 'database', 
      icon: Database, 
      label: 'DB 구조',
      description: 'ERD 다이어그램',
      prompt: '이 프로젝트의 데이터베이스 구조를 Mermaid erDiagram으로 시각화해줘. 주요 엔티티와 관계를 보여줘.'
    },
    { 
      id: 'flow', 
      icon: Workflow, 
      label: '로직 플로우',
      description: '비즈니스 로직 흐름도',
      prompt: '이 프로젝트의 주요 비즈니스 로직 흐름을 Mermaid flowchart로 시각화해줘. 사용자 흐름과 처리 과정을 보여줘.'
    },
    { 
      id: 'sequence', 
      icon: List, 
      label: '시퀀스',
      description: 'API 호출 순서도',
      prompt: '이 프로젝트의 주요 API 호출 시퀀스를 Mermaid sequenceDiagram으로 시각화해줘.'
    },
  ]

  const generateDiagram = async (type: typeof visualizationTypes[0]) => {
    if (!content.trim()) {
      toast.error('먼저 프로젝트 설명을 작성해주세요')
      return
    }

    setSelectedType(type.id)
    setLoading(true)
    setGeneratedDiagram(null)

    try {
      const { data } = await api.post('/ai/diagram', {
        content,
        diagramType: type.id,
        prompt: type.prompt
      })
      
      setGeneratedDiagram(data.data.diagram)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI 생성 실패')
    } finally {
      setLoading(false)
    }
  }

  const generateCustom = async () => {
    if (!customPrompt.trim()) {
      toast.error('요청 내용을 입력해주세요')
      return
    }

    setSelectedType('custom')
    setLoading(true)
    setGeneratedDiagram(null)

    try {
      const { data } = await api.post('/ai/diagram', {
        content,
        diagramType: 'custom',
        prompt: customPrompt
      })
      
      setGeneratedDiagram(data.data.diagram)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI 생성 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-b bg-gradient-to-r from-violet-50 to-purple-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <span className="font-semibold text-violet-900">AI 다이어그램 생성</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-violet-100 rounded">
          <X className="w-4 h-4 text-violet-600" />
        </button>
      </div>

      {/* 타입 선택 버튼들 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {visualizationTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => generateDiagram(type)}
            disabled={loading}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
              selectedType === type.id
                ? 'border-violet-400 bg-violet-100'
                : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50'
            } disabled:opacity-50`}
          >
            <type.icon className="w-5 h-5 text-violet-600" />
            <span className="text-sm font-medium text-gray-700">{type.label}</span>
            <span className="text-xs text-gray-500">{type.description}</span>
          </button>
        ))}
      </div>

      {/* 커스텀 프롬프트 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="커스텀 요청 (예: 인증 플로우를 시각화해줘)"
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={generateCustom}
          disabled={loading || !customPrompt.trim()}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
        >
          생성
        </button>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
          <span className="text-sm text-violet-600">AI가 다이어그램을 생성하고 있습니다...</span>
        </div>
      )}

      {/* 생성 결과 */}
      {generatedDiagram && !loading && (
        <div className="space-y-3">
          <div className="p-4 bg-white border rounded-lg">
            <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">
              {generatedDiagram}
            </pre>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onInsert(generatedDiagram)}
              className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
            >
              본문에 삽입
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(generatedDiagram)
                toast.success('복사되었습니다')
              }}
              className="px-4 py-2 border border-violet-300 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-50"
            >
              복사
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        💡 프로젝트 설명을 기반으로 Mermaid 다이어그램을 자동 생성합니다. 생성된 다이어그램은 포트폴리오에서 시각적으로 렌더링됩니다.
      </p>
    </div>
  )
}
