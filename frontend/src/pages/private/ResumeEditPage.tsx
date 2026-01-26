import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { 
  FileText, Eye, Save, Plus, Trash2, X, Loader2, 
  User, Briefcase, GraduationCap, Award, Code, Languages, Trophy,
  ExternalLink, Link, Globe, Github, Linkedin, Copy, Check,
  FolderOpen, FileEdit, BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'
import PortfolioSection from './resume/PortfolioSection'
import CoverLetterSection from './resume/CoverLetterSection'
import ViewStatsSection from './resume/ViewStatsSection'
import ProfileImageUpload from './resume/ProfileImageUpload'

// Types
interface Resume {
  id: number
  resumeType: 'FREE' | 'SARAMIN'
  title: string
  name: string
  email: string
  phone: string
  birthDate: string
  gender: string
  address: string
  profileImageUrl: string
  bio: string
  freeContent: string
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
  certificates: Certificate[]
  languages: Language[]
  awards: AwardItem[]
}

interface Education {
  id: number
  schoolName: string
  major: string
  level: string
  startDate: string
  endDate: string
  graduationStatus: string
  gpa: string
  maxGpa: string
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
  startDate: string
  endDate: string
  projectUrl: string
  githubUrl: string
  techStacks: string[]
}

interface Skill {
  id: number
  name: string
  category: string
  level: string
}

interface Certificate {
  id: number
  name: string
  issuingOrganization: string
  acquiredDate: string
  grade: string
}

interface Language {
  id: number
  name: string
  testName: string
  score: string
  speakingLevel: string
}

interface AwardItem {
  id: number
  name: string
  organization: string
  awardedDate: string
  description: string
}

type TabType = 'settings' | 'basic' | 'education' | 'experience' | 'project' | 'skill' | 'certificate' | 'language' | 'award' | 'free' | 'portfolio' | 'coverletter' | 'stats'

export default function ResumeEditPage() {
  const [activeTab, setActiveTab] = useState<TabType>('settings')

  const { data: resume, isLoading } = useQuery({
    queryKey: ['myResume'],
    queryFn: async () => {
      const { data } = await api.get('/resume')
      return data.data as Resume
    },
  })

  // 양식 타입에 따라 탭 변경
  useEffect(() => {
    if (resume) {
      if (resume.resumeType === 'FREE' && activeTab !== 'settings' && activeTab !== 'basic' && activeTab !== 'free') {
        setActiveTab('free')
      }
    }
  }, [resume?.resumeType])

  const saraminTabs = [
    { key: 'settings', label: '설정', icon: Link },
    { key: 'basic', label: '기본 정보', icon: User },
    { key: 'education', label: '학력', icon: GraduationCap },
    { key: 'experience', label: '경력', icon: Briefcase },
    { key: 'project', label: '프로젝트', icon: Code },
    { key: 'skill', label: '기술', icon: Code },
    { key: 'certificate', label: '자격증', icon: Award },
    { key: 'language', label: '어학', icon: Languages },
    { key: 'award', label: '수상', icon: Trophy },
    { key: 'portfolio', label: '포트폴리오', icon: FolderOpen },
    { key: 'coverletter', label: '자기소개서', icon: FileEdit },
    { key: 'stats', label: '통계', icon: BarChart3 },
  ]

  const freeTabs = [
    { key: 'settings', label: '설정', icon: Link },
    { key: 'basic', label: '기본 정보', icon: User },
    { key: 'free', label: '자유 양식', icon: FileText },
    { key: 'portfolio', label: '포트폴리오', icon: FolderOpen },
    { key: 'coverletter', label: '자기소개서', icon: FileEdit },
    { key: 'stats', label: '통계', icon: BarChart3 },
  ]

  const tabs = resume?.resumeType === 'FREE' ? freeTabs : saraminTabs

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">이력서 편집</h1>
        {resume?.isPublic && resume?.slug && (
          <a
            href={`/resume/${resume.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-5 h-5" />
            공개 페이지 보기
          </a>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'settings' && resume && <SettingsForm resume={resume} />}
          {activeTab === 'basic' && resume && <BasicInfoForm resume={resume} />}
          {activeTab === 'education' && resume && <EducationSection resume={resume} />}
          {activeTab === 'experience' && resume && <ExperienceSection resume={resume} />}
          {activeTab === 'project' && resume && <ProjectSection resume={resume} />}
          {activeTab === 'skill' && resume && <SkillSection resume={resume} />}
          {activeTab === 'certificate' && resume && <CertificateSection resume={resume} />}
          {activeTab === 'language' && resume && <LanguageSection resume={resume} />}
          {activeTab === 'award' && resume && <AwardSection resume={resume} />}
          {activeTab === 'free' && resume && <FreeContentForm resume={resume} />}
          {activeTab === 'portfolio' && <PortfolioSection />}
          {activeTab === 'coverletter' && <CoverLetterSection />}
          {activeTab === 'stats' && <ViewStatsSection />}
        </div>
      </div>
    </div>
  )
}

// ==================== Settings Form ====================
function SettingsForm({ resume }: { resume: Resume }) {
  const [resumeType, setResumeType] = useState(resume.resumeType)
  const [isPublic, setIsPublic] = useState(resume.isPublic)
  const [slug, setSlug] = useState(resume.slug || '')
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => api.put('/resume/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('설정이 저장되었습니다')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '저장에 실패했습니다')
    },
  })

  const handleSave = () => {
    mutation.mutate({ resumeType, isPublic, slug })
  }

  const publicUrl = `${window.location.origin}/resume/${slug}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* 양식 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">이력서 양식</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setResumeType('SARAMIN')}
            className={cn(
              'p-4 border-2 rounded-lg text-left transition-all',
              resumeType === 'SARAMIN'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="font-medium mb-1">📋 사람인 양식</div>
            <p className="text-sm text-gray-500">
              학력, 경력, 자격증 등 정형화된 섹션으로 구성
            </p>
          </button>
          <button
            type="button"
            onClick={() => setResumeType('FREE')}
            className={cn(
              'p-4 border-2 rounded-lg text-left transition-all',
              resumeType === 'FREE'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="font-medium mb-1">✍️ 자유 양식</div>
            <p className="text-sm text-gray-500">
              마크다운으로 자유롭게 작성
            </p>
          </button>
        </div>
      </div>

      {/* 공개 URL 설정 */}
      <div className="pt-4 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-1">공개 URL</label>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-500 text-sm">{window.location.origin}/resume/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="my-resume"
          />
        </div>
        {isPublic && slug && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 flex-1 truncate">{publicUrl}</span>
            <button
              onClick={handleCopyUrl}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        )}
      </div>

      {/* 공개 여부 */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-5 h-5 text-primary-600 rounded"
        />
        <label htmlFor="isPublic" className="text-sm">
          <span className="font-medium">이력서 공개하기</span>
          <p className="text-gray-500">공개 URL로 누구나 이력서를 볼 수 있습니다</p>
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={mutation.isPending}
        className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        저장
      </button>
    </div>
  )
}

// ==================== Basic Info Form ====================
function BasicInfoForm({ resume }: { resume: Resume }) {
  const [name, setName] = useState(resume.name || '')
  const [email, setEmail] = useState(resume.email || '')
  const [phone, setPhone] = useState(resume.phone || '')
  const [birthDate, setBirthDate] = useState(resume.birthDate || '')
  const [address, setAddress] = useState(resume.address || '')
  const [bio, setBio] = useState(resume.bio || '')
  const [githubUrl, setGithubUrl] = useState(resume.githubUrl || '')
  const [linkedinUrl, setLinkedinUrl] = useState(resume.linkedinUrl || '')
  const [blogUrl, setBlogUrl] = useState(resume.blogUrl || '')
  const [portfolioUrl, setPortfolioUrl] = useState(resume.portfolioUrl || '')
  const queryClient = useQueryClient()

  const basicMutation = useMutation({
    mutationFn: (data: any) => api.put('/resume/basic-info', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('기본 정보가 저장되었습니다')
    },
  })

  const linksMutation = useMutation({
    mutationFn: (data: any) => api.put('/resume/links', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('링크가 저장되었습니다')
    },
  })

  return (
    <div className="space-y-8 max-w-2xl">
      {/* 프로필 이미지 */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">프로필 이미지</h3>
        <ProfileImageUpload currentImageUrl={resume.profileImageUrl} />
      </div>

      {/* 기본 정보 */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="font-medium text-gray-900">기본 정보</h3>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
            <input
              type="text"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="1990-01-01"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="서울시 강남구"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">자기소개</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="간단한 자기소개를 작성해주세요"
          />
        </div>
        <button
          onClick={() => basicMutation.mutate({ name, email, phone, birthDate, address, bio })}
          disabled={basicMutation.isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {basicMutation.isPending ? '저장 중...' : '기본 정보 저장'}
        </button>
      </div>

      {/* 링크 */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="font-medium text-gray-900">링크</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="https://github.com/username"
            />
          </div>
          <div className="flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={blogUrl}
              onChange={(e) => setBlogUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="https://blog.example.com"
            />
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="https://portfolio.example.com"
            />
          </div>
        </div>
        <button
          onClick={() => linksMutation.mutate({ githubUrl, linkedinUrl, blogUrl, portfolioUrl })}
          disabled={linksMutation.isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {linksMutation.isPending ? '저장 중...' : '링크 저장'}
        </button>
      </div>
    </div>
  )
}

// ==================== Free Content Form ====================
function FreeContentForm({ resume }: { resume: Resume }) {
  const [title, setTitle] = useState(resume.title || '')
  const [freeContent, setFreeContent] = useState(resume.freeContent || '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => api.put('/resume/free-content', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('저장되었습니다')
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="이력서 제목"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">내용 (마크다운 지원)</label>
        <textarea
          value={freeContent}
          onChange={(e) => setFreeContent(e.target.value)}
          rows={20}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm resize-none"
          placeholder={`# 자기소개

안녕하세요, 개발자 OOO입니다.

## 경력

### 회사명 (2020 - 현재)
- 주요 업무 내용
- 성과

## 기술 스택

- **Frontend**: React, TypeScript
- **Backend**: Node.js, Spring Boot
`}
        />
      </div>
      <button
        onClick={() => mutation.mutate({ title, freeContent })}
        disabled={mutation.isPending}
        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
      >
        {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        저장
      </button>
    </div>
  )
}

// ==================== Education Section ====================
function EducationSection({ resume }: { resume: Resume }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/educations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('삭제되었습니다')
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">학력 정보를 추가해주세요</p>
        <button
          onClick={() => { setShowForm(true); setEditingId(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>

      {resume.educations.length > 0 ? (
        <div className="space-y-3">
          {resume.educations.map((edu) => (
            <div key={edu.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{edu.schoolName}</h4>
                  <p className="text-sm text-gray-600">{edu.major} · {edu.level}</p>
                  <p className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate || '현재'} · {edu.graduationStatus}
                  </p>
                  {edu.gpa && <p className="text-sm text-gray-500">학점: {edu.gpa}/{edu.maxGpa}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingId(edu.id); setShowForm(true) }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(edu.id)}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>등록된 학력이 없습니다</p>
        </div>
      )}

      {showForm && (
        <EducationFormModal
          education={editingId ? resume.educations.find(e => e.id === editingId) : undefined}
          onClose={() => { setShowForm(false); setEditingId(null) }}
        />
      )}
    </div>
  )
}

function EducationFormModal({ education, onClose }: { education?: Education; onClose: () => void }) {
  const [schoolName, setSchoolName] = useState(education?.schoolName || '')
  const [major, setMajor] = useState(education?.major || '')
  const [level, setLevel] = useState(education?.level || 'UNIVERSITY')
  const [startDate, setStartDate] = useState(education?.startDate || '')
  const [endDate, setEndDate] = useState(education?.endDate || '')
  const [graduationStatus, setGraduationStatus] = useState(education?.graduationStatus || 'GRADUATED')
  const [gpa, setGpa] = useState(education?.gpa || '')
  const [maxGpa, setMaxGpa] = useState(education?.maxGpa || '4.5')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => education
      ? api.put(`/resume/educations/${education.id}`, data)
      : api.post('/resume/educations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success(education ? '수정되었습니다' : '추가되었습니다')
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{education ? '학력 수정' : '학력 추가'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">학교명 *</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="OO대학교"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전공</label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="컴퓨터공학과"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">학력</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="HIGH_SCHOOL">고등학교</option>
                <option value="COLLEGE">전문대</option>
                <option value="UNIVERSITY">대학교</option>
                <option value="GRADUATE">대학원(석사)</option>
                <option value="DOCTORATE">대학원(박사)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select value={graduationStatus} onChange={(e) => setGraduationStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="GRADUATED">졸업</option>
                <option value="ENROLLED">재학</option>
                <option value="LEAVE">휴학</option>
                <option value="EXPECTED">졸업예정</option>
                <option value="DROPPED">중퇴</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">입학</label>
              <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="2018.03" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">졸업</label>
              <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="2022.02" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">학점</label>
              <input type="text" value={gpa} onChange={(e) => setGpa(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="3.8" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">만점</label>
              <input type="text" value={maxGpa} onChange={(e) => setMaxGpa(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="4.5" />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">취소</button>
            <button
              onClick={() => mutation.mutate({ schoolName, major, level, startDate, endDate, graduationStatus, gpa, maxGpa })}
              disabled={!schoolName || mutation.isPending}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
            >
              {mutation.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Experience Section ====================
function ExperienceSection({ resume }: { resume: Resume }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/experiences/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('삭제되었습니다')
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">경력 정보를 추가해주세요</p>
        <button onClick={() => { setShowForm(true); setEditingId(null) }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>

      {resume.experiences.length > 0 ? (
        <div className="space-y-3">
          {resume.experiences.map((exp) => (
            <div key={exp.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{exp.company}</h4>
                  <p className="text-sm text-primary-600">{exp.position}</p>
                  <p className="text-sm text-gray-500">{exp.startDate} - {exp.isCurrent ? '현재' : exp.endDate}</p>
                  {exp.description && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{exp.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(exp.id); setShowForm(true) }} className="p-1 hover:bg-gray-100 rounded">
                    <FileText className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(exp.id)} className="p-1 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>등록된 경력이 없습니다</p>
        </div>
      )}

      {showForm && (
        <ExperienceFormModal
          experience={editingId ? resume.experiences.find(e => e.id === editingId) : undefined}
          onClose={() => { setShowForm(false); setEditingId(null) }}
        />
      )}
    </div>
  )
}

function ExperienceFormModal({ experience, onClose }: { experience?: Experience; onClose: () => void }) {
  const [company, setCompany] = useState(experience?.company || '')
  const [position, setPosition] = useState(experience?.position || '')
  const [startDate, setStartDate] = useState(experience?.startDate || '')
  const [endDate, setEndDate] = useState(experience?.endDate || '')
  const [isCurrent, setIsCurrent] = useState(experience?.isCurrent || false)
  const [description, setDescription] = useState(experience?.description || '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => experience ? api.put(`/resume/experiences/${experience.id}`, data) : api.post('/resume/experiences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success(experience ? '수정되었습니다' : '추가되었습니다')
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{experience ? '경력 수정' : '경력 추가'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">회사명 *</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">직책/포지션 *</label>
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">입사일 *</label>
              <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="2020.03" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">퇴사일</label>
              <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isCurrent} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" placeholder="2023.12" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isCurrent" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="isCurrent" className="text-sm">현재 재직 중</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">업무 내용</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded-lg resize-none" placeholder="담당 업무 및 성과를 작성해주세요" />
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">취소</button>
            <button onClick={() => mutation.mutate({ company, position, startDate, endDate: isCurrent ? null : endDate, isCurrent, description })} disabled={!company || !position || !startDate || mutation.isPending} className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {mutation.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Project Section ====================
function ProjectSection({ resume }: { resume: Resume }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('삭제되었습니다')
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">프로젝트를 추가해주세요</p>
        <button onClick={() => { setShowForm(true); setEditingId(null) }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>

      {resume.projects.length > 0 ? (
        <div className="space-y-3">
          {resume.projects.map((proj) => (
            <div key={proj.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{proj.title}</h4>
                  <p className="text-sm text-gray-500">{proj.startDate} - {proj.endDate || '진행중'}</p>
                  {proj.description && <p className="text-sm text-gray-600 mt-2">{proj.description}</p>}
                  {proj.techStacks && proj.techStacks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.techStacks.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(proj.id); setShowForm(true) }} className="p-1 hover:bg-gray-100 rounded">
                    <FileText className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(proj.id)} className="p-1 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>등록된 프로젝트가 없습니다</p>
        </div>
      )}

      {showForm && (
        <ProjectFormModal
          project={editingId ? resume.projects.find(p => p.id === editingId) : undefined}
          onClose={() => { setShowForm(false); setEditingId(null) }}
        />
      )}
    </div>
  )
}

function ProjectFormModal({ project, onClose }: { project?: Project; onClose: () => void }) {
  const [title, setTitle] = useState(project?.title || '')
  const [description, setDescription] = useState(project?.description || '')
  const [startDate, setStartDate] = useState(project?.startDate || '')
  const [endDate, setEndDate] = useState(project?.endDate || '')
  const [projectUrl, setProjectUrl] = useState(project?.projectUrl || '')
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl || '')
  const [techStacks, setTechStacks] = useState(project?.techStacks?.join(', ') || '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => project ? api.put(`/resume/projects/${project.id}`, data) : api.post('/resume/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success(project ? '수정되었습니다' : '추가되었습니다')
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{project ? '프로젝트 수정' : '프로젝트 추가'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트명 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
              <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="2023.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
              <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="2023.06" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">기술 스택 (쉼표로 구분)</label>
            <input type="text" value={techStacks} onChange={(e) => setTechStacks(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="React, TypeScript, Node.js" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
            <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">배포 URL</label>
            <input type="url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">취소</button>
            <button onClick={() => mutation.mutate({ title, description, startDate, endDate, projectUrl, githubUrl, techStacks: techStacks.split(',').map(s => s.trim()).filter(Boolean) })} disabled={!title || mutation.isPending} className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {mutation.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Skill Section ====================
function SkillSection({ resume }: { resume: Resume }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('INTERMEDIATE')
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: (data: any) => api.post('/resume/skills', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      setName('')
      setCategory('')
      toast.success('추가되었습니다')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
    },
  })

  const levelColors: Record<string, string> = {
    EXPERT: 'bg-primary-100 text-primary-700',
    ADVANCED: 'bg-blue-100 text-blue-700',
    INTERMEDIATE: 'bg-green-100 text-green-700',
    BEGINNER: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="기술명" className="px-3 py-2 border rounded-lg w-40" />
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="카테고리 (선택)" className="px-3 py-2 border rounded-lg w-32" />
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-3 py-2 border rounded-lg">
          <option value="BEGINNER">입문</option>
          <option value="INTERMEDIATE">중급</option>
          <option value="ADVANCED">고급</option>
          <option value="EXPERT">전문가</option>
        </select>
        <button onClick={() => name && addMutation.mutate({ name, category, level })} disabled={!name || addMutation.isPending} className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
          추가
        </button>
      </div>

      {resume.skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {resume.skills.map((skill) => (
            <span key={skill.id} className={cn('px-3 py-1 rounded-full text-sm flex items-center gap-2', levelColors[skill.level] || 'bg-gray-100')}>
              {skill.name}
              <button onClick={() => deleteMutation.mutate(skill.id)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>등록된 기술이 없습니다</p>
        </div>
      )}
    </div>
  )
}

// ==================== Certificate Section ====================
function CertificateSection({ resume }: { resume: Resume }) {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/certificates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('삭제되었습니다')
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">자격증을 추가해주세요</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>

      {resume.certificates.length > 0 ? (
        <div className="space-y-3">
          {resume.certificates.map((cert) => (
            <div key={cert.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-medium">{cert.name}</h4>
                <p className="text-sm text-gray-500">{cert.issuingOrganization} · {cert.acquiredDate}</p>
                {cert.grade && <p className="text-sm text-primary-600">{cert.grade}</p>}
              </div>
              <button onClick={() => deleteMutation.mutate(cert.id)} className="p-1 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>등록된 자격증이 없습니다</p>
        </div>
      )}

      {showForm && <CertificateFormModal onClose={() => setShowForm(false)} />}
    </div>
  )
}

function CertificateFormModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [issuingOrganization, setIssuingOrganization] = useState('')
  const [acquiredDate, setAcquiredDate] = useState('')
  const [grade, setGrade] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/resume/certificates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('추가되었습니다')
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">자격증 추가</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">자격증명 *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="정보처리기사" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">발급기관</label>
            <input type="text" value={issuingOrganization} onChange={(e) => setIssuingOrganization(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="한국산업인력공단" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">취득일</label>
              <input type="text" value={acquiredDate} onChange={(e) => setAcquiredDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="2023.06" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">등급/점수</label>
              <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="1급" />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">취소</button>
            <button onClick={() => mutation.mutate({ name, issuingOrganization, acquiredDate, grade })} disabled={!name || mutation.isPending} className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">저장</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Language Section ====================
function LanguageSection({ resume }: { resume: Resume }) {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/languages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">어학 능력을 추가해주세요</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>

      {resume.languages.length > 0 ? (
        <div className="space-y-3">
          {resume.languages.map((lang) => (
            <div key={lang.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-medium">{lang.name}</h4>
                <p className="text-sm text-gray-500">{lang.testName} {lang.score}</p>
              </div>
              <button onClick={() => deleteMutation.mutate(lang.id)} className="p-1 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Languages className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>등록된 어학 정보가 없습니다</p>
        </div>
      )}

      {showForm && <LanguageFormModal onClose={() => setShowForm(false)} />}
    </div>
  )
}

function LanguageFormModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [testName, setTestName] = useState('')
  const [score, setScore] = useState('')
  const [acquiredDate, setAcquiredDate] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/resume/languages', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('추가되었습니다')
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">어학 추가</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">언어 *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="영어" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시험명</label>
              <input type="text" value={testName} onChange={(e) => setTestName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="TOEIC" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">점수/등급</label>
              <input type="text" value={score} onChange={(e) => setScore(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="900" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">취득일</label>
            <input type="text" value={acquiredDate} onChange={(e) => setAcquiredDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="2023.06" />
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">취소</button>
            <button onClick={() => mutation.mutate({ name, testName, score, acquiredDate })} disabled={!name || mutation.isPending} className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">저장</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Award Section ====================
function AwardSection({ resume }: { resume: Resume }) {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/awards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">수상 경력을 추가해주세요</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-4 h-4" />
          추가
        </button>
      </div>

      {resume.awards.length > 0 ? (
        <div className="space-y-3">
          {resume.awards.map((award) => (
            <div key={award.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-medium">{award.name}</h4>
                <p className="text-sm text-gray-500">{award.organization} · {award.awardedDate}</p>
                {award.description && <p className="text-sm text-gray-600 mt-1">{award.description}</p>}
              </div>
              <button onClick={() => deleteMutation.mutate(award.id)} className="p-1 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>등록된 수상 경력이 없습니다</p>
        </div>
      )}

      {showForm && <AwardFormModal onClose={() => setShowForm(false)} />}
    </div>
  )
}

function AwardFormModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [awardedDate, setAwardedDate] = useState('')
  const [description, setDescription] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/resume/awards', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('추가되었습니다')
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">수상 추가</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">수상명 *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="대상" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">수여 기관</label>
            <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="OO대학교" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">수상일</label>
            <input type="text" value={awardedDate} onChange={(e) => setAwardedDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="2023.06" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg resize-none" />
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">취소</button>
            <button onClick={() => mutation.mutate({ name, organization, awardedDate, description })} disabled={!name || mutation.isPending} className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">저장</button>
          </div>
        </div>
      </div>
    </div>
  )
}
