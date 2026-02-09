import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { 
  User, Code, BarChart3, Loader2, Save, Plus, Trash2, X,
  ExternalLink, Github, Linkedin, Globe, Copy, Check,
  ChevronDown, ChevronUp, Eye, Briefcase, GraduationCap, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import ViewStatsSection from './resume/ViewStatsSection'
import ProfileImageUpload from './resume/ProfileImageUpload'
import RichMarkdownEditor from '@/components/editor/RichMarkdownEditor'

// Types
interface Resume {
  id: number
  resumeType: 'FREE' | 'SARAMIN'
  title: string
  name: string
  email: string
  phone: string
  birthDate: string
  address: string
  profileImageUrl: string
  bio: string
  headline: string
  githubUrl: string
  linkedinUrl: string
  blogUrl: string
  portfolioUrl: string
  slug: string
  isPublic: boolean
  educations: Education[]
  experiences: Experience[]
  projects: Project[]
  skills: Skill[]
}

interface Education {
  id: number
  schoolName: string
  major: string
  level: string
  startDate: string
  endDate: string
  graduationStatus: string
}

interface Experience {
  id: number
  company: string
  position: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
}

interface Project {
  id: number
  title: string
  description: string
  detailContent: string
  role: string
  teamSize: number
  achievements: string
  startDate: string
  endDate: string
  projectUrl: string
  githubUrl: string
  demoUrl: string
  thumbnailUrl: string
  screenshots: string
  techStacks: string[]
  isFeatured: boolean
  displayOrder: number
}

interface Skill {
  id: number
  name: string
  category: string
  level: string
}

type TabType = 'profile' | 'projects' | 'stats'

// Year-Month 선택기 컴포넌트
function YearMonthPicker({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  
  const [year, month] = value ? value.split('.').map(Number) : ['', '']
  
  return (
    <div className="flex gap-1">
      <select
        value={year || ''}
        onChange={(e) => {
          const y = e.target.value
          if (y && month) onChange(`${y}.${String(month).padStart(2, '0')}`)
          else if (y) onChange(`${y}.01`)
        }}
        className="flex-1 px-2 py-2 border rounded-lg text-sm"
      >
        <option value="">{placeholder || '년도'}</option>
        {years.map(y => <option key={y} value={y}>{y}년</option>)}
      </select>
      <select
        value={month || ''}
        onChange={(e) => {
          const m = e.target.value
          if (year && m) onChange(`${year}.${String(m).padStart(2, '0')}`)
        }}
        className="w-20 px-2 py-2 border rounded-lg text-sm"
        disabled={!year}
      >
        <option value="">월</option>
        {months.map(m => <option key={m} value={m}>{m}월</option>)}
      </select>
    </div>
  )
}

export default function ResumeEditPageNew() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  const { data: resume, isLoading, error } = useQuery({
    queryKey: ['myResume'],
    queryFn: async () => {
      const { data } = await api.get('/resume')
      return data.data as Resume
    },
  })

  const tabs = [
    { key: 'profile', label: '프로필', icon: User },
    { key: 'projects', label: '프로젝트', icon: Code },
    { key: 'stats', label: '통계', icon: BarChart3 },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p>이력서를 불러오는데 실패했습니다</p>
        <p className="text-sm mt-1">백엔드 서버가 실행 중인지 확인해주세요</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">포트폴리오</h1>
        {resume?.isPublic && resume?.slug && (
          <a
            href={`/resume/${resume.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
            공개 페이지 보기
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={cn(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && resume && <ProfileTab resume={resume} />}
          {activeTab === 'projects' && resume && <ProjectsTab resume={resume} />}
          {activeTab === 'stats' && <ViewStatsSection />}
        </div>
      </div>
    </div>
  )
}

// ==================== Profile Tab ====================
function ProfileTab({ resume }: { resume: Resume }) {
  const [name, setName] = useState(resume.name || '')
  const [email, setEmail] = useState(resume.email || '')
  const [phone, setPhone] = useState(resume.phone || '')
  const [bio, setBio] = useState(resume.bio || '')
  const [githubUrl, setGithubUrl] = useState(resume.githubUrl || '')
  const [linkedinUrl, setLinkedinUrl] = useState(resume.linkedinUrl || '')
  const [blogUrl, setBlogUrl] = useState(resume.blogUrl || '')
  const [portfolioUrl, setPortfolioUrl] = useState(resume.portfolioUrl || '')
  const [isPublic, setIsPublic] = useState(resume.isPublic)
  const [slug, setSlug] = useState(resume.slug || '')
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()

  const basicMutation = useMutation({
    mutationFn: (data: any) => api.put('/resume/basic-info', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('저장되었습니다')
    },
  })

  const linksMutation = useMutation({
    mutationFn: (data: any) => api.put('/resume/links', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('저장되었습니다')
    },
  })

  const settingsMutation = useMutation({
    mutationFn: (data: any) => api.put('/resume/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('저장되었습니다')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '저장 실패')
    },
  })

  const publicUrl = `${window.location.origin}/resume/${slug}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* 프로필 이미지 & 기본 정보 */}
      <div className="flex gap-8">
        <ProfileImageUpload currentImageUrl={resume.profileImageUrl} />
        
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="010-1234-5678"
            />
          </div>
        </div>
      </div>

      {/* 한줄 소개 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">한줄 소개</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
          placeholder="안녕하세요, 3년차 백엔드 개발자입니다. Spring Boot와 AWS를 주로 다룹니다."
        />
      </div>

      <button
        onClick={() => basicMutation.mutate({ name, email, phone, bio })}
        disabled={basicMutation.isPending}
        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
      >
        {basicMutation.isPending ? '저장 중...' : '기본 정보 저장'}
      </button>

      {/* 기술 스택 */}
      <div className="pt-6 border-t">
        <h3 className="font-semibold text-gray-900 mb-4">기술 스택</h3>
        <SkillsEditor skills={resume.skills} />
      </div>

      {/* 경력/학력 (간단히) */}
      <div className="pt-6 border-t">
        <h3 className="font-semibold text-gray-900 mb-4">경력 & 학력</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <SimpleExperienceList experiences={resume.experiences} />
          <SimpleEducationList educations={resume.educations} />
        </div>
      </div>

      {/* 링크 */}
      <div className="pt-6 border-t">
        <h3 className="font-semibold text-gray-900 mb-4">링크</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="GitHub URL"
            />
          </div>
          <div className="flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="LinkedIn URL"
            />
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="url"
              value={blogUrl}
              onChange={(e) => setBlogUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="블로그 URL"
            />
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="포트폴리오 URL"
            />
          </div>
        </div>
        <button
          onClick={() => linksMutation.mutate({ githubUrl, linkedinUrl, blogUrl, portfolioUrl })}
          disabled={linksMutation.isPending}
          className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {linksMutation.isPending ? '저장 중...' : '링크 저장'}
        </button>
      </div>

      {/* 공개 설정 */}
      <div className="pt-6 border-t">
        <h3 className="font-semibold text-gray-900 mb-4">공개 설정</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">{window.location.origin}/resume/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="my-portfolio"
            />
          </div>
          
          {slug && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 flex-1 truncate">{publicUrl}</span>
              <button onClick={handleCopyUrl} className="p-1 hover:bg-gray-200 rounded">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded"
            />
            <div>
              <span className="font-medium">포트폴리오 공개</span>
              <p className="text-sm text-gray-500">위 URL로 누구나 볼 수 있습니다</p>
            </div>
          </label>

          <button
            onClick={() => settingsMutation.mutate({ isPublic, slug })}
            disabled={settingsMutation.isPending}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {settingsMutation.isPending ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== Skills Editor (개선) ====================
function SkillsEditor({ skills }: { skills: Skill[] }) {
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('Frontend')
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: (data: any) => api.post('/resume/skills', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
    },
  })

  // 여러 개 한번에 추가 (쉼표, 엔터 구분)
  const handleAdd = async () => {
    const names = input.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
    for (const name of names) {
      await addMutation.mutateAsync({ name, category, level: 'INTERMEDIATE' })
    }
    setInput('')
    toast.success(`${names.length}개 기술 추가됨`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  // 카테고리별 그룹핑
  const grouped = skills.reduce((acc, skill) => {
    const cat = skill.category || '기타'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', '기타']

  return (
    <div className="space-y-4">
      {/* 추가 폼 - 개선된 버전 */}
      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500 self-center">카테고리</span>
        </div>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="기술명 입력 (쉼표나 줄바꿈으로 여러 개 입력)&#10;예: React, TypeScript, Node.js"
            rows={2}
            className="flex-1 px-3 py-2 border rounded-lg resize-none"
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim() || addMutation.isPending}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50 self-end"
          >
            {addMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-gray-400">💡 쉼표(,) 또는 줄바꿈으로 여러 기술을 한번에 추가할 수 있어요</p>
      </div>

      {/* 스킬 목록 */}
      {Object.entries(grouped).map(([cat, catSkills]) => (
        <div key={cat}>
          <span className="text-xs font-medium text-gray-500 uppercase">{cat}</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {catSkills.map(skill => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2 group hover:bg-gray-200 transition-colors"
              >
                {skill.name}
                <button
                  onClick={() => deleteMutation.mutate(skill.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}

      {skills.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">기술 스택을 추가해주세요</p>
      )}
    </div>
  )
}

// ==================== Simple Experience List ====================
function SimpleExperienceList({ experiences }: { experiences: Experience[] }) {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/experiences/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myResume'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Briefcase className="w-4 h-4" /> 경력
        </span>
        <button onClick={() => setShowForm(true)} className="text-primary-600 text-sm hover:underline">
          + 추가
        </button>
      </div>
      <div className="space-y-2">
        {experiences.map(exp => (
          <div key={exp.id} className="p-3 bg-gray-50 rounded-lg group">
            <div className="flex justify-between">
              <div>
                <div className="font-medium text-sm">{exp.company}</div>
                <div className="text-xs text-gray-500">{exp.position}</div>
                <div className="text-xs text-gray-400">{exp.startDate} - {exp.isCurrent ? '현재' : exp.endDate}</div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(exp.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {experiences.length === 0 && <p className="text-xs text-gray-400">경력을 추가해주세요</p>}
      </div>
      {showForm && <ExperienceQuickForm onClose={() => setShowForm(false)} />}
    </div>
  )
}

function ExperienceQuickForm({ onClose }: { onClose: () => void }) {
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/resume/experiences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      onClose()
      toast.success('경력이 추가되었습니다')
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">경력 추가</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">회사명 *</label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="회사명" className="w-full px-3 py-2 border rounded-lg" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">직책 *</label>
          <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="백엔드 개발자" className="w-full px-3 py-2 border rounded-lg" />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />시작
            </label>
            <YearMonthPicker value={startDate} onChange={setStartDate} placeholder="시작" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />종료
            </label>
            {isCurrent ? (
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-500">현재 재직 중</div>
            ) : (
              <YearMonthPicker value={endDate} onChange={setEndDate} placeholder="종료" />
            )}
          </div>
        </div>
        
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="w-4 h-4 rounded" />
          현재 재직 중
        </label>
        
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">취소</button>
          <button 
            onClick={() => mutation.mutate({ company, position, startDate, endDate: isCurrent ? null : endDate, isCurrent })} 
            disabled={!company || !position || !startDate || mutation.isPending} 
            className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
          >
            {mutation.isPending ? '추가 중...' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== Simple Education List ====================
function SimpleEducationList({ educations }: { educations: Education[] }) {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/educations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myResume'] }),
  })

  const levelLabels: Record<string, string> = {
    UNIVERSITY: '대학교',
    GRADUATE: '대학원',
    HIGH_SCHOOL: '고등학교',
    MIDDLE_SCHOOL: '중학교',
    ACADEMY: '학원/교육기관',
    BOOTCAMP: '부트캠프',
    OTHER: '기타'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <GraduationCap className="w-4 h-4" /> 학력
        </span>
        <button onClick={() => setShowForm(true)} className="text-primary-600 text-sm hover:underline">
          + 추가
        </button>
      </div>
      <div className="space-y-2">
        {educations.map(edu => (
          <div key={edu.id} className="p-3 bg-gray-50 rounded-lg group">
            <div className="flex justify-between">
              <div>
                <div className="font-medium text-sm">{edu.schoolName}</div>
                <div className="text-xs text-gray-500">
                  {levelLabels[edu.level] || edu.level}
                  {edu.major && ` · ${edu.major}`}
                </div>
                <div className="text-xs text-gray-400">{edu.startDate} - {edu.endDate}</div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(edu.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {educations.length === 0 && <p className="text-xs text-gray-400">학력을 추가해주세요</p>}
      </div>
      {showForm && <EducationQuickForm onClose={() => setShowForm(false)} />}
    </div>
  )
}

function EducationQuickForm({ onClose }: { onClose: () => void }) {
  const [schoolName, setSchoolName] = useState('')
  const [major, setMajor] = useState('')
  const [level, setLevel] = useState('UNIVERSITY')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [graduationStatus, setGraduationStatus] = useState('GRADUATED')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/resume/educations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      onClose()
      toast.success('학력이 추가되었습니다')
    },
  })

  const levelOptions = [
    { value: 'GRADUATE', label: '대학원' },
    { value: 'UNIVERSITY', label: '대학교' },
    { value: 'HIGH_SCHOOL', label: '고등학교' },
    { value: 'MIDDLE_SCHOOL', label: '중학교' },
    { value: 'BOOTCAMP', label: '부트캠프' },
    { value: 'ACADEMY', label: '학원/교육기관' },
    { value: 'OTHER', label: '기타' },
  ]

  const statusOptions = [
    { value: 'GRADUATED', label: '졸업' },
    { value: 'ENROLLED', label: '재학 중' },
    { value: 'LEAVE_OF_ABSENCE', label: '휴학' },
    { value: 'EXPECTED', label: '졸업예정' },
    { value: 'DROPPED', label: '중퇴' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">학력 추가</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">학교/기관 유형 *</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
            {levelOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">학교/기관명 *</label>
          <input 
            type="text" 
            value={schoolName} 
            onChange={(e) => setSchoolName(e.target.value)} 
            placeholder={level === 'BOOTCAMP' ? '예: 코드캠프' : '예: 서울대학교'} 
            className="w-full px-3 py-2 border rounded-lg" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {['UNIVERSITY', 'GRADUATE'].includes(level) ? '전공' : '과정명'} (선택)
          </label>
          <input 
            type="text" 
            value={major} 
            onChange={(e) => setMajor(e.target.value)} 
            placeholder={['UNIVERSITY', 'GRADUATE'].includes(level) ? '예: 컴퓨터공학과' : '예: 웹 개발 과정'} 
            className="w-full px-3 py-2 border rounded-lg" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />입학/시작
            </label>
            <YearMonthPicker value={startDate} onChange={setStartDate} placeholder="시작" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />졸업/종료
            </label>
            <YearMonthPicker value={endDate} onChange={setEndDate} placeholder="종료" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
          <select value={graduationStatus} onChange={(e) => setGraduationStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">취소</button>
          <button 
            onClick={() => mutation.mutate({ schoolName, major, level, startDate, endDate, graduationStatus })} 
            disabled={!schoolName || mutation.isPending} 
            className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
          >
            {mutation.isPending ? '추가 중...' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== Projects Tab ====================
function ProjectsTab({ resume }: { resume: Resume }) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('삭제되었습니다')
    },
  })

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">프로젝트를 추가하고 상세 설명을 작성해보세요</p>
        <button
          onClick={() => { setEditingProject(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          프로젝트 추가
        </button>
      </div>

      {/* 프로젝트 카드 목록 */}
      <div className="space-y-3">
        {resume.projects.map((project) => (
          <div key={project.id} className="border rounded-xl overflow-hidden">
            {/* 카드 헤더 (접힌 상태) */}
            <div
              className="p-4 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
            >
              <div className="flex items-start gap-4">
                {/* 썸네일 */}
                {project.thumbnailUrl ? (
                  <img src={project.thumbnailUrl} alt={project.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                    <Code className="w-8 h-8 text-primary-500" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    {project.isFeatured && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Featured</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{project.description}</p>
                  
                  {/* 기술 스택 태그 */}
                  {project.techStacks && project.techStacks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.techStacks.slice(0, 5).map((tech) => (
                        <span key={tech} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                      {project.techStacks.length > 5 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          +{project.techStacks.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(project) }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Save className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(project.id) }}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                  {expandedId === project.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* 확장된 상세 내용 */}
            {expandedId === project.id && (
              <div className="p-4 bg-gray-50 border-t space-y-4">
                {/* 프로젝트 정보 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">기간</span>
                    <p className="font-medium">{project.startDate} - {project.endDate || '진행중'}</p>
                  </div>
                  {project.role && (
                    <div>
                      <span className="text-gray-500">역할</span>
                      <p className="font-medium">{project.role}</p>
                    </div>
                  )}
                  {project.teamSize && (
                    <div>
                      <span className="text-gray-500">팀 규모</span>
                      <p className="font-medium">{project.teamSize}명</p>
                    </div>
                  )}
                </div>

                {/* 링크들 */}
                <div className="flex gap-3">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {project.projectUrl && (
                    <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600">
                      <ExternalLink className="w-4 h-4" /> 배포 URL
                    </a>
                  )}
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600">
                      <ExternalLink className="w-4 h-4" /> 데모 영상
                    </a>
                  )}
                </div>

                {/* 상세 설명 */}
                {project.detailContent && (
                  <div className="prose prose-sm max-w-none">
                    <h4 className="font-medium text-gray-900 mb-2">상세 설명</h4>
                    <div className="whitespace-pre-wrap text-gray-700">{project.detailContent}</div>
                  </div>
                )}

                {/* 성과 */}
                {project.achievements && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">주요 성과</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{project.achievements}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {resume.projects.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>아직 프로젝트가 없습니다</p>
            <p className="text-sm mt-1">프로젝트를 추가하고 나만의 포트폴리오를 만들어보세요!</p>
          </div>
        )}
      </div>

      {/* 프로젝트 폼 모달 */}
      {showForm && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => { setShowForm(false); setEditingProject(null) }}
        />
      )}
    </div>
  )
}

// ==================== Project Form Modal ====================
function ProjectFormModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const [title, setTitle] = useState(project?.title || '')
  const [description, setDescription] = useState(project?.description || '')
  const [detailContent, setDetailContent] = useState(project?.detailContent || '')
  const [role, setRole] = useState(project?.role || '')
  const [teamSize, setTeamSize] = useState(project?.teamSize?.toString() || '')
  const [achievements, setAchievements] = useState(project?.achievements || '')
  const [startDate, setStartDate] = useState(project?.startDate || '')
  const [endDate, setEndDate] = useState(project?.endDate || '')
  const [projectUrl, setProjectUrl] = useState(project?.projectUrl || '')
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl || '')
  const [demoUrl, setDemoUrl] = useState(project?.demoUrl || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(project?.thumbnailUrl || '')
  const [techStacks, setTechStacks] = useState(project?.techStacks?.join(', ') || '')
  const [isFeatured, setIsFeatured] = useState(project?.isFeatured || false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => project
      ? api.put(`/resume/projects/${project.id}`, data)
      : api.post('/resume/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success(project ? '수정되었습니다' : '추가되었습니다')
      onClose()
    },
  })

  const handleSubmit = () => {
    mutation.mutate({
      title,
      description,
      detailContent,
      role,
      teamSize: teamSize ? parseInt(teamSize) : null,
      achievements,
      startDate,
      endDate,
      projectUrl,
      githubUrl,
      demoUrl,
      thumbnailUrl,
      techStacks: techStacks.split(',').map(s => s.trim()).filter(Boolean),
      isFeatured,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b z-10">
          <h3 className="font-semibold text-lg">{project ? '프로젝트 수정' : '프로젝트 추가'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트명 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="프로젝트 이름"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">한줄 설명</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="프로젝트를 한 줄로 소개해주세요"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="백엔드 개발"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">팀 규모</label>
              <input
                type="number"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작</label>
              <YearMonthPicker value={startDate} onChange={setStartDate} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료</label>
              <YearMonthPicker value={endDate} onChange={setEndDate} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">기술 스택 (쉼표로 구분)</label>
            <input
              type="text"
              value={techStacks}
              onChange={(e) => setTechStacks(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="React, TypeScript, Spring Boot, PostgreSQL"
            />
          </div>

          {/* 상세 설명 - 리치 에디터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상세 설명
              <span className="text-xs text-gray-400 ml-2">마크다운 + AI 시각화 지원</span>
            </label>
            <RichMarkdownEditor
              value={detailContent}
              onChange={setDetailContent}
              placeholder={`## 프로젝트 소개
이 프로젝트는...

## 주요 기능
- 기능 1
- 기능 2

## 기술적 도전과 해결
어떤 문제를 어떻게 해결했는지...

💡 AI 시각화 버튼으로 아키텍처, DB 구조, 플로우 다이어그램을 자동 생성할 수 있어요!`}
              minHeight="300px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주요 성과</label>
            <textarea
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg resize-none"
              placeholder="- 성능 50% 개선&#10;- MAU 1만명 달성"
            />
          </div>

          {/* 링크들 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">배포 URL</label>
              <input type="url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">데모 영상 URL</label>
              <input type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">썸네일 URL</label>
              <input type="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">대표 프로젝트로 표시</span>
          </label>
        </div>

        <div className="sticky bottom-0 bg-white flex gap-2 p-4 border-t">
          <button onClick={onClose} className="flex-1 py-2.5 border rounded-lg hover:bg-gray-50">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title || mutation.isPending}
            className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {mutation.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
