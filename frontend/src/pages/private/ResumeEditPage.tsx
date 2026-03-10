/**
 * ResumeEditPage
 * 탭 구조:
 *   1. 이력서  - 기본정보 / 링크 / 경력&교육 / 학력 / 기술 / 포트폴리오파일 / 공개설정
 *   2. 프로젝트 - 목록 사이드바 + Tiptap 리치 에디터
 *   3. 포트폴리오 & 자소서 - 기존 PortfolioSection / CoverLetterSection
 */
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import AttachmentDropZone from './resume/AttachmentDropZone'
import ProjectRichEditor from './resume/ProjectRichEditor'
import {
  Plus, Trash2, X, Loader2, Pencil, Save, Check,
  User, Briefcase, GraduationCap, Code, Globe,
  Github, Linkedin, ExternalLink, Link, Copy, Eye,
  FolderOpen, FileText, ChevronRight, Image as ImageIcon,
  Camera,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type LayoutType = 'LAYOUT_1' | 'LAYOUT_2' | 'LAYOUT_3'
type InstitutionType = 'SCHOOL' | 'TRAINING' | 'ONLINE'
interface Education {
  id: number; schoolName: string; major: string; level: string
  institutionType: InstitutionType
  startDate: string; endDate: string; graduationStatus: string; gpa: string; maxGpa: string
  courseName: string; instructor: string
}
interface Experience {
  id: number; company: string; position: string
  startDate: string; endDate: string; isCurrent: boolean; description: string
}
interface Project {
  id: number; title: string; description: string; detailContent: string
  role: string; teamSize: number; achievements: string
  startDate: string; endDate: string; projectUrl: string; githubUrl: string
  demoUrl: string; thumbnailUrl: string; screenshots: string; techStacks: string[]
  isFeatured: boolean
}
interface Skill { id: number; name: string; category: string; level: string }
interface Resume {
  id: number; resumeType: string; layoutType: LayoutType
  title: string; name: string; email: string; phone: string; birthDate: string
  gender: string; address: string; profileImageUrl: string; bio: string
  freeContent: string; githubUrl: string; linkedinUrl: string
  blogUrl: string; portfolioUrl: string; slug: string; isPublic: boolean
  educations: Education[]; experiences: Experience[]; projects: Project[]; skills: Skill[]
}
type MainTab = 'resume' | 'projects'
type ResumeSection = 'basic' | 'links' | 'experience' | 'education' | 'skill' | 'attach' | 'settings'

// ─── 마일스톤 ─────────────────────────────────────────────────────────────────

function useMilestones(resume: Resume) {
  return [
    { id: 'basic' as ResumeSection, label: '기본 정보', done: !!(resume.name && resume.email && resume.phone) },
    { id: 'links' as ResumeSection, label: '링크', done: !!(resume.githubUrl || resume.linkedinUrl || resume.blogUrl) },
    { id: 'experience' as ResumeSection, label: '경력/교육', done: resume.experiences.length > 0 || resume.educations.some(e => e.institutionType !== 'SCHOOL') },
    { id: 'education' as ResumeSection, label: '학력', done: resume.educations.some(e => !e.institutionType || e.institutionType === 'SCHOOL') },
    { id: 'skill' as ResumeSection, label: '기술', done: resume.skills.length > 0 },
    { id: 'settings' as ResumeSection, label: '공개 설정', done: !!(resume.slug && resume.isPublic) },
  ]
}

// ─── Page Root ────────────────────────────────────────────────────────────────

export default function ResumeEditPage() {
  const [mainTab, setMainTab] = useState<MainTab>('resume')
  const { data: resume, isLoading } = useQuery({
    queryKey: ['myResume'],
    queryFn: async () => { const { data } = await api.get('/resume'); return data.data as Resume },
  })

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
  if (!resume) return null

  const TABS = [
    { key: 'resume' as MainTab, label: '이력서', icon: <FileText className="w-4 h-4" /> },
    { key: 'projects' as MainTab, label: '프로젝트', icon: <Code className="w-4 h-4" /> },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">이력서</h1>
        {resume.isPublic && resume.slug && (
          <a href={`/resume/${resume.slug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
            <Eye className="w-4 h-4" /> 공개 페이지
          </a>
        )}
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setMainTab(t.key)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              mainTab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {mainTab === 'resume' && <ResumeTab resume={resume} />}
      {mainTab === 'projects' && <ProjectsTab resume={resume} />}
    </div>
  )
}

function SectionWrap({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center gap-2 mb-4">{icon}<h3 className="font-semibold">{title}</h3></div>
      {children}
    </div>
  )
}

// ─── 이력서 탭 ────────────────────────────────────────────────────────────────

function ResumeTab({ resume }: { resume: Resume }) {
  const milestones = useMilestones(resume)
  const pct = Math.round((milestones.filter(m => m.done).length / milestones.length) * 100)
  const refs: Record<ResumeSection, React.RefObject<HTMLDivElement>> = {
    basic: useRef(null), links: useRef(null), experience: useRef(null),
    education: useRef(null), skill: useRef(null), attach: useRef(null), settings: useRef(null),
  }
  const scrollTo = (id: ResumeSection) => refs[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1 space-y-4 min-w-0">
        <div ref={refs.basic}><BasicInfoSection resume={resume} /></div>
        <div ref={refs.links}><LinksSection resume={resume} /></div>
        <div ref={refs.experience}><ExperienceSection resume={resume} /></div>
        <div ref={refs.education}><EducationSection resume={resume} /></div>
        <div ref={refs.skill}><SkillSection resume={resume} /></div>
        {/* 이력서 탭 내 포트폴리오/자소서 파일 첨부 */}
        <div ref={refs.attach}>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold">포트폴리오 & 자소서 파일</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <AttachmentDropZone label="포트폴리오" type="PORTFOLIO" />
              <AttachmentDropZone label="자기소개서" type="COVER_LETTER" accept=".pdf,.doc,.docx,.hwp,.txt" />
            </div>
          </div>
        </div>
        <div ref={refs.settings}><SettingsSection resume={resume} /></div>
      </div>

      {/* 마일스톤 패널 */}
      <div className="w-52 shrink-0 sticky top-6">
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">완성도</span>
            <span className="text-sm font-bold text-primary-600">{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="space-y-1">
            {milestones.map((m, i) => (
              <button key={m.id} onClick={() => scrollTo(m.id)}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 text-left group transition-colors">
                <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all',
                  m.done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200')}>
                  {m.done ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className={cn('text-sm', m.done ? 'text-gray-800 font-medium' : 'text-gray-400')}>{m.label}</span>
              </button>
            ))}
          </div>
          {pct === 100 && (
            <div className="mt-4 p-2.5 bg-green-50 rounded-lg text-center">
              <div className="text-lg">🎉</div>
              <div className="text-xs text-green-700 font-medium">이력서 완성!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 프로젝트 탭 ──────────────────────────────────────────────────────────────

function ProjectsTab({ resume }: { resume: Resume }) {
  const qc = useQueryClient()
  const [selectedId, setSelectedId] = useState<number | null>(resume.projects[0]?.id ?? null)
  const [showNew, setShowNew] = useState(false)

  const del = useMutation({
    mutationFn: (id: number) => api.delete(`/resume/projects/${id}`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['myResume'] })
      if (selectedId === id) setSelectedId(null)
      toast.success('삭제됨')
    },
  })

  const selected = resume.projects.find(p => p.id === selectedId) ?? null

  // 저장 완료 콜백: 새 프로젝트면 생성된 id로 선택, 수정이면 그대로 유지
  const handleSaved = (newId?: number) => {
    if (showNew && newId) {
      // 새 프로젝트 → 생성된 id로 선택 전환
      setSelectedId(newId)
      setShowNew(false)
    } else if (newId && newId !== selectedId) {
      // 혹시 id가 바뀐 케이스 대응
      setSelectedId(newId)
    }
    // 수정 케이스: selectedId 그대로, 폼도 그대로 → 아무것도 안 함
    qc.invalidateQueries({ queryKey: ['myResume'] })
  }

  return (
    <div className="flex gap-4 items-start min-h-[640px]">
      {/* 사이드바 */}
      <div className="w-56 shrink-0">
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">프로젝트</span>
            <button onClick={() => { setSelectedId(null); setShowNew(true) }}
              className="p-1 hover:bg-gray-200 rounded-lg text-primary-600">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y max-h-[calc(100vh-220px)] overflow-y-auto">
            {resume.projects.length === 0 && (
              <div className="py-10 text-center text-sm text-gray-400">
                <Code className="w-8 h-8 mx-auto mb-2 opacity-30" />프로젝트 없음
              </div>
            )}
            {resume.projects.map(p => (
              <button key={p.id} onClick={() => { setSelectedId(p.id); setShowNew(false) }}
                className={cn('w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-2',
                  selectedId === p.id && !showNew ? 'bg-primary-50 border-l-2 border-primary-500' : '')}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  {p.techStacks?.length > 0 && (
                    <div className="text-xs text-gray-400 truncate mt-0.5">{p.techStacks.slice(0, 3).join(', ')}</div>
                  )}
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 에디터 */}
      <div className="flex-1 min-w-0">
        {showNew || resume.projects.length === 0
          ? <ProjectEditor key="new" project={null} onSaved={handleSaved} />
          : selected
            ? <ProjectEditor key={selected.id} project={selected}
                onSaved={handleSaved}
                onDeleted={() => del.mutate(selected.id)} />
            : (
              <div className="bg-white border rounded-xl h-64 flex items-center justify-center text-gray-400">
                <div className="text-center"><Code className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">프로젝트를 선택하거나 추가해주세요</p>
                </div>
              </div>
            )
        }
      </div>
    </div>
  )
}

function ProjectEditor({ project, onSaved, onDeleted }: {
  project: Project | null; onSaved: (newId?: number) => void; onDeleted?: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [meta, setMeta] = useState({
    title: project?.title || '',
    description: project?.description || '',
    role: project?.role || '',
    teamSize: project?.teamSize?.toString() || '',
    achievements: project?.achievements || '',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    githubUrl: project?.githubUrl || '',
    projectUrl: project?.projectUrl || '',
    demoUrl: project?.demoUrl || '',
    techStacks: project?.techStacks?.join(', ') || '',
    isFeatured: project?.isFeatured || false,
    thumbnailUrl: project?.thumbnailUrl || '',
  })
  const [detailContent, setDetailContent] = useState(project?.detailContent || '')
  const [thumbPreview, setThumbPreview] = useState(project?.thumbnailUrl || '')
  // 저장 후 수정 화면 유지를 위한 id 추적
  const currentProjectId = useRef<number | null>(project?.id ?? null)

  const fm = (k: keyof typeof meta) => (v: any) => setMeta(p => ({ ...p, [k]: v }))

  const save = useMutation({
    mutationFn: (d: any) => project
      ? api.put(`/resume/projects/${project.id}`, d)
      : api.post('/resume/projects', d),
    onSuccess: (res) => {
      const saved = res?.data?.data as Project | undefined
      toast.success(project ? '수정됨' : '추가됨')
      if (saved) {
        // 서버 응답 전체 객체가 오면 폼 동기화
        setMeta({
          title: saved.title || '',
          description: saved.description || '',
          role: saved.role || '',
          teamSize: saved.teamSize?.toString() || '',
          achievements: saved.achievements || '',
          startDate: saved.startDate || '',
          endDate: saved.endDate || '',
          githubUrl: saved.githubUrl || '',
          projectUrl: saved.projectUrl || '',
          demoUrl: saved.demoUrl || '',
          techStacks: saved.techStacks?.join(', ') || '',
          isFeatured: saved.isFeatured || false,
          thumbnailUrl: saved.thumbnailUrl || '',
        })
        setDetailContent(saved.detailContent || '')
        setThumbPreview(saved.thumbnailUrl || '')
        currentProjectId.current = saved.id
        onSaved(saved.id)
      } else {
        // 백엔드가 전체 객체 안 줄 때: 폼 유지, id만 넘겨줌
        onSaved(currentProjectId.current ?? undefined)
      }
    },
    onError: (e: any) => toast.error(e.response?.data?.message || '저장 실패'),
  })

  const uploadThumb = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post('/resume/project-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      const url = data.data?.url || ''
      setThumbPreview(url); fm('thumbnailUrl')(url)
      toast.success('썸네일 업로드됨')
    } catch {
      // 업로드 실패 시 미리보기만 보여주고 DB엔 저장 안 함 (base64는 너무 커서 DB 오류)
      const reader = new FileReader()
      reader.onloadend = () => { setThumbPreview(reader.result as string) }
      reader.readAsDataURL(file)
      toast.error('썸네일 업로드 실패. 서버 연결을 확인해주세요.')
    }
  }

  const handleSave = () => {
    save.mutate({
      ...meta,
      detailContent,
      teamSize: meta.teamSize ? parseInt(meta.teamSize) : null,
      techStacks: meta.techStacks.split(',').map(s => s.trim()).filter(Boolean),
    })
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-800">
          {currentProjectId.current
            ? `✏️ ${meta.title || '프로젝트 수정'}`
            : '새 프로젝트'
          }
        </h3>
        <div className="flex gap-2">
          {onDeleted && (
            <button onClick={onDeleted} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" /> 삭제
            </button>
          )}
          <button onClick={handleSave} disabled={!meta.title || save.isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-primary-700">
            {save.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} 저장
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-180px)]">
        {/* 썸네일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">대표 썸네일</label>
          <div className="flex gap-3 items-center">
            <div onClick={() => fileRef.current?.click()}
              className="w-28 h-18 min-h-[72px] border-2 border-dashed border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors shrink-0 relative group">
              {thumbPreview
                ? <img src={thumbPreview} alt="썸네일" className="w-full h-full object-cover" />
                : <div className="text-center text-gray-400 p-2"><ImageIcon className="w-5 h-5 mx-auto mb-1" /><span className="text-xs">클릭 업로드</span></div>}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadThumb(e.target.files[0])} />
            <p className="text-xs text-gray-400">JPG, PNG, GIF 최대 10MB</p>
          </div>
        </div>

        {/* 메타 정보 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label="프로젝트명 *" value={meta.title} onChange={fm('title')} /></div>
          <Field label="역할" value={meta.role} onChange={fm('role')} placeholder="풀스택 개발자" />
          <Field label="팀 규모" value={meta.teamSize} onChange={fm('teamSize')} type="number" placeholder="1" />
          <Field label="시작일" value={meta.startDate} onChange={fm('startDate')} placeholder="2023.01" />
          <Field label="종료일" value={meta.endDate} onChange={fm('endDate')} placeholder="2023.12" />
          <Field label="GitHub" value={meta.githubUrl} onChange={fm('githubUrl')} type="url" />
          <Field label="배포 URL" value={meta.projectUrl} onChange={fm('projectUrl')} type="url" />
          <div className="col-span-2"><Field label="기술 스택 (쉼표 구분)" value={meta.techStacks} onChange={fm('techStacks')} placeholder="React, TypeScript, Spring Boot" /></div>
          <div className="col-span-2"><Field label="한줄 요약" value={meta.description} onChange={fm('description')} textarea placeholder="이 프로젝트를 한 줄로 설명" /></div>
        </div>

        {/* 상세 설명 - Tiptap 에디터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상세 설명
            <span className="ml-2 text-xs text-gray-400 font-normal">이미지 드래그앤드롭 · AI 다이어그램 지원</span>
          </label>
          <ProjectRichEditor
            content={detailContent}
            onChange={setDetailContent}
            placeholder="프로젝트 개요, 주요 기능, 기술적 도전과 해결 방법 등을 상세히 작성해주세요..."
          />
        </div>

        {/* 주요 성과 */}
        <Field label="주요 성과/결과" value={meta.achievements} onChange={fm('achievements')} textarea
          placeholder="• 월 활성 사용자 1,000명 달성&#10;• 응답 속도 40% 개선" />

        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={meta.isFeatured} onChange={e => fm('isFeatured')(e.target.checked)} className="w-4 h-4" />
          <span className="font-medium">대표 프로젝트로 설정</span>
          <span className="text-gray-400">(공개 이력서 상단 노출)</span>
        </label>
      </div>
    </div>
  )
}

// ─── 기본 정보 (프로필 이미지 업로드 포함) ───────────────────────────────────

function BasicInfoSection({ resume }: { resume: Resume }) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: resume.name || '', email: resume.email || '', phone: resume.phone || '',
    birthDate: resume.birthDate || '', address: resume.address || '', bio: resume.bio || '',
    profileImageUrl: resume.profileImageUrl || '',
  })
  const f = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }))
  const mut = useMutation({
    mutationFn: (d: any) => api.put('/resume/basic-info', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myResume'] }); toast.success('저장됨'); setEditing(false) },
    onError: (e: any) => toast.error(e.response?.data?.message || '저장 실패'),
  })
  const done = !!(resume.name && resume.email && resume.phone)

  // 이미지 업로드 (ProfileImageUpload 컴포넌트 대신 여기서 직접 처리 - URL 반영을 위해)
  const imgRef = useRef<HTMLInputElement>(null)
  const [imgPreview, setImgPreview] = useState(resume.profileImageUrl || '')
  const uploadImg = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error('5MB 이하만 가능'); return }
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post('/resume/profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      const url = data.data?.url || ''
      setImgPreview(url)
      setForm(p => ({ ...p, profileImageUrl: url }))
      // 즉시 저장
      qc.invalidateQueries({ queryKey: ['myResume'] })
      toast.success('프로필 이미지 업데이트됨')
    } catch {
      // fallback: base64 미리보기만 (DB 저장 안 함 - base64는 너무 길어서 DB 오류 발생)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImgPreview(reader.result as string)
        // form.profileImageUrl은 업데이트하지 않음 - 서버 업로드 실패 시 이전 URL 유지
      }
      reader.readAsDataURL(file)
      toast.error('이미지 업로드 실패. 서버 연결을 확인해주세요.')
    }
  }

  return (
    <SectionCard title="기본 정보" icon={<User className="w-4 h-4" />} done={done}
      editing={editing} onEdit={() => setEditing(true)} onCancel={() => setEditing(false)}
      onSave={() => mut.mutate(form)} saving={mut.isPending}>
      {editing ? (
        <div className="space-y-4">
          {/* 프로필 이미지 */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 cursor-pointer group shrink-0"
              onClick={() => imgRef.current?.click()}>
              {imgPreview
                ? <img src={imgPreview} alt="프로필" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-gray-300" /></div>}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImg(e.target.files[0])} />
            <div>
              <button onClick={() => imgRef.current?.click()} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
                이미지 변경
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG 최대 5MB</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="이름 *" value={form.name} onChange={f('name')} />
            <Field label="이메일 *" value={form.email} onChange={f('email')} type="email" />
            <Field label="전화번호 *" value={form.phone} onChange={f('phone')} placeholder="010-0000-0000" />
            <Field label="생년월일" value={form.birthDate} onChange={f('birthDate')} placeholder="1990-01-01" />
            <div className="col-span-2"><Field label="주소" value={form.address} onChange={f('address')} /></div>
            <div className="col-span-2"><Field label="한줄 소개" value={form.bio} onChange={f('bio')} textarea /></div>
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          {resume.profileImageUrl
            ? <img src={resume.profileImageUrl} alt="프로필" className="w-16 h-16 rounded-full object-cover shrink-0" />
            : <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><User className="w-7 h-7 text-gray-300" /></div>
          }
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <InfoRow label="이름" value={resume.name} />
            <InfoRow label="이메일" value={resume.email} />
            <InfoRow label="전화번호" value={resume.phone} />
            <InfoRow label="생년월일" value={resume.birthDate} />
            {resume.address && <InfoRow label="주소" value={resume.address} />}
            {resume.bio && <div className="mt-1 text-sm text-gray-500 italic">"{resume.bio}"</div>}
            {!resume.name && <div className="text-sm text-gray-400">수정 버튼을 눌러 입력해주세요</div>}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

// ─── 링크 ─────────────────────────────────────────────────────────────────────

function LinksSection({ resume }: { resume: Resume }) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    githubUrl: resume.githubUrl || '', linkedinUrl: resume.linkedinUrl || '',
    blogUrl: resume.blogUrl || '', portfolioUrl: resume.portfolioUrl || '',
  })
  const f = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }))
  const mut = useMutation({
    mutationFn: (d: any) => api.put('/resume/links', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myResume'] }); toast.success('저장됨'); setEditing(false) },
    onError: (e: any) => toast.error(e.response?.data?.message || '저장 실패'),
  })
  const done = !!(resume.githubUrl || resume.linkedinUrl || resume.blogUrl || resume.portfolioUrl)

  return (
    <SectionCard title="링크" icon={<Link className="w-4 h-4" />} done={done}
      editing={editing} onEdit={() => setEditing(true)} onCancel={() => setEditing(false)}
      onSave={() => mut.mutate(form)} saving={mut.isPending}>
      {editing ? (
        <div className="space-y-3">
          <IconField icon={<Github className="w-4 h-4 text-gray-400" />} value={form.githubUrl} onChange={f('githubUrl')} placeholder="https://github.com/username" />
          <IconField icon={<Linkedin className="w-4 h-4 text-gray-400" />} value={form.linkedinUrl} onChange={f('linkedinUrl')} placeholder="https://linkedin.com/in/username" />
          <IconField icon={<Globe className="w-4 h-4 text-gray-400" />} value={form.blogUrl} onChange={f('blogUrl')} placeholder="블로그 URL" />
          <IconField icon={<ExternalLink className="w-4 h-4 text-gray-400" />} value={form.portfolioUrl} onChange={f('portfolioUrl')} placeholder="포트폴리오 URL" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {resume.githubUrl && <LinkBadge icon={<Github className="w-3.5 h-3.5" />} url={resume.githubUrl} label="GitHub" />}
          {resume.linkedinUrl && <LinkBadge icon={<Linkedin className="w-3.5 h-3.5" />} url={resume.linkedinUrl} label="LinkedIn" />}
          {resume.blogUrl && <LinkBadge icon={<Globe className="w-3.5 h-3.5" />} url={resume.blogUrl} label="블로그" />}
          {resume.portfolioUrl && <LinkBadge icon={<ExternalLink className="w-3.5 h-3.5" />} url={resume.portfolioUrl} label="포트폴리오" />}
          {!done && <span className="text-sm text-gray-400">링크를 추가해주세요</span>}
        </div>
      )}
    </SectionCard>
  )
}

// ─── 경력 & 교육/훈련 ────────────────────────────────────────────────────────

function ExperienceSection({ resume }: { resume: Resume }) {
  const qc = useQueryClient()
  const [expModal, setExpModal] = useState<{ open: boolean; item?: Experience }>({ open: false })
  const [trainModal, setTrainModal] = useState<{ open: boolean; item?: Education }>({ open: false })
  const [subTab, setSubTab] = useState<'career' | 'training'>('career')
  const trainings = resume.educations.filter(e => e.institutionType && e.institutionType !== 'SCHOOL')
  const done = resume.experiences.length > 0 || trainings.length > 0

  const delExp = useMutation({ mutationFn: (id: number) => api.delete(`/resume/experiences/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['myResume'] }); toast.success('삭제됨') } })
  const delTrain = useMutation({ mutationFn: (id: number) => api.delete(`/resume/educations/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['myResume'] }); toast.success('삭제됨') } })

  return (
    <div className={cn('bg-white rounded-xl border p-4', done && 'border-green-200')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold">경력 & 교육/훈련</h3>
          {done && <DoneBadge />}
        </div>
        <button onClick={() => subTab === 'career' ? setExpModal({ open: true }) : setTrainModal({ open: true })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
          <Plus className="w-3.5 h-3.5" /> {subTab === 'career' ? '경력 추가' : '교육 추가'}
        </button>
      </div>
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit text-sm">
        {(['career', 'training'] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)}
            className={cn('px-3 py-1.5 rounded-md transition-all', subTab === t ? 'bg-white shadow-sm font-medium' : 'text-gray-500')}>
            {t === 'career' ? `경력 (${resume.experiences.length})` : `교육/훈련 (${trainings.length})`}
          </button>
        ))}
      </div>
      {subTab === 'career' ? (
        <div className="space-y-3">
          {resume.experiences.length === 0
            ? <Empty label="경력을 추가해주세요. 신입이라면 교육/훈련 탭을 활용해보세요." />
            : resume.experiences.map(e => (
              <ItemRow key={e.id} title={e.company} sub={e.position}
                meta={`${e.startDate} – ${e.isCurrent ? '현재' : e.endDate}`} desc={e.description}
                onEdit={() => setExpModal({ open: true, item: e })} onDelete={() => delExp.mutate(e.id)} />
            ))}
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.length === 0
            ? <Empty label="학원, 부트캠프, 온라인 강의 등 교육 이력을 추가해주세요." />
            : trainings.map(e => (
              <ItemRow key={e.id} title={e.schoolName}
                sub={e.institutionType === 'TRAINING' ? '📚 교육/훈련' : '💻 온라인 강의'}
                meta={[e.startDate, e.endDate || '진행중', e.courseName].filter(Boolean).join(' · ')}
                desc={e.instructor ? `강사: ${e.instructor}` : undefined}
                onEdit={() => setTrainModal({ open: true, item: e })} onDelete={() => delTrain.mutate(e.id)} />
            ))}
        </div>
      )}
      {expModal.open && <ExperienceModal item={expModal.item} onClose={() => setExpModal({ open: false })} />}
      {trainModal.open && <TrainingModal item={trainModal.item} onClose={() => setTrainModal({ open: false })} />}
    </div>
  )
}

function ExperienceModal({ item, onClose }: { item?: Experience; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ company: item?.company || '', position: item?.position || '', startDate: item?.startDate || '', endDate: item?.endDate || '', isCurrent: item?.isCurrent || false, description: item?.description || '' })
  const f = (k: keyof typeof form) => (v: any) => setForm(p => ({ ...p, [k]: v }))
  const mut = useMutation({
    mutationFn: (d: any) => item ? api.put(`/resume/experiences/${item.id}`, d) : api.post('/resume/experiences', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myResume'] }); toast.success(item ? '수정됨' : '추가됨'); onClose() },
    onError: (e: any) => toast.error(e.response?.data?.message || '저장 실패'),
  })
  return (
    <Modal title={item ? '경력 수정' : '경력 추가'} onClose={onClose}
      onSave={() => mut.mutate({ ...form, endDate: form.isCurrent ? null : form.endDate })}
      disabled={!form.company || !form.position || !form.startDate} saving={mut.isPending}>
      <Field label="회사명 *" value={form.company} onChange={f('company')} />
      <Field label="직책/직무 *" value={form.position} onChange={f('position')} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="입사일 *" value={form.startDate} onChange={f('startDate')} placeholder="2020.03" />
        <Field label="퇴사일" value={form.endDate} onChange={f('endDate')} placeholder="2023.12" disabled={form.isCurrent} />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={form.isCurrent} onChange={e => f('isCurrent')(e.target.checked)} /> 현재 재직 중
      </label>
      <Field label="업무 내용" value={form.description} onChange={f('description')} textarea placeholder="담당 업무 및 성과" />
    </Modal>
  )
}

function TrainingModal({ item, onClose }: { item?: Education; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    schoolName: item?.schoolName || '',
    institutionType: (item?.institutionType || 'TRAINING') as 'TRAINING' | 'ONLINE',
    courseName: item?.courseName || '', instructor: item?.instructor || '',
    startDate: item?.startDate || '', endDate: item?.endDate || '',
  })
  const f = (k: keyof typeof form) => (v: any) => setForm(p => ({ ...p, [k]: v }))
  const mut = useMutation({
    mutationFn: (d: any) => item ? api.put(`/resume/educations/${item.id}`, d) : api.post('/resume/educations', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myResume'] }); toast.success(item ? '수정됨' : '추가됨'); onClose() },
    onError: (e: any) => toast.error(e.response?.data?.message || '저장 실패'),
  })
  return (
    <Modal title={item ? '교육 수정' : '교육/훈련 추가'} onClose={onClose}
      onSave={() => mut.mutate(form)} disabled={!form.schoolName} saving={mut.isPending}>
      <div className="grid grid-cols-2 gap-2">
        {(['TRAINING', 'ONLINE'] as const).map(t => (
          <button key={t} onClick={() => f('institutionType')(t)}
            className={cn('p-2.5 border-2 rounded-lg text-sm text-left transition-all', form.institutionType === t ? 'border-primary-500 bg-primary-50' : 'border-gray-200')}>
            {t === 'TRAINING' ? '📚 학원/부트캠프' : '💻 온라인 강의'}
          </button>
        ))}
      </div>
      <Field label="기관명 *" value={form.schoolName} onChange={f('schoolName')} placeholder="패스트캠퍼스, 인프런 등" />
      <Field label="과정명" value={form.courseName} onChange={f('courseName')} />
      <Field label="강사/담당자" value={form.instructor} onChange={f('instructor')} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="시작일" value={form.startDate} onChange={f('startDate')} placeholder="2023.01" />
        <Field label="종료일" value={form.endDate} onChange={f('endDate')} placeholder="2023.06" />
      </div>
    </Modal>
  )
}

// ─── 학력 ─────────────────────────────────────────────────────────────────────

function EducationSection({ resume }: { resume: Resume }) {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; item?: Education }>({ open: false })
  const schools = resume.educations.filter(e => !e.institutionType || e.institutionType === 'SCHOOL')
  const del = useMutation({ mutationFn: (id: number) => api.delete(`/resume/educations/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['myResume'] }); toast.success('삭제됨') } })
  const lvl: Record<string, string> = { HIGH_SCHOOL: '고등학교', ASSOCIATE: '전문대', BACHELOR: '대학교', MASTER: '대학원(석사)', DOCTOR: '대학원(박사)', OTHER: '기타' }
  const sts: Record<string, string> = { GRADUATED: '졸업', ENROLLED: '재학', LEAVE: '휴학', EXPECTED: '졸업예정', DROPPED: '중퇴' }
  return (
    <ListCard title="학력" icon={<GraduationCap className="w-4 h-4" />} done={schools.length > 0} onAdd={() => setModal({ open: true })}>
      {schools.length === 0 ? <Empty label="학력을 추가해주세요" />
        : schools.map(e => (
          <ItemRow key={e.id} title={e.schoolName}
            sub={[lvl[e.level], e.major].filter(Boolean).join(' · ')}
            meta={`${e.startDate} – ${e.endDate || '현재'} · ${sts[e.graduationStatus] || e.graduationStatus}${e.gpa ? ` · GPA ${e.gpa}/${e.maxGpa}` : ''}`}
            onEdit={() => setModal({ open: true, item: e })} onDelete={() => del.mutate(e.id)} />
        ))}
      {modal.open && <EducationModal item={modal.item} onClose={() => setModal({ open: false })} />}
    </ListCard>
  )
}

function EducationModal({ item, onClose }: { item?: Education; onClose: () => void }) {
  const qc = useQueryClient()
  const [level, setLevel] = useState(item?.level || 'BACHELOR')
  const [form, setForm] = useState({
    schoolName: item?.schoolName || '', major: item?.major || '',
    startDate: item?.startDate || '', endDate: item?.endDate || '',
    graduationStatus: item?.graduationStatus || 'GRADUATED',
    gpa: item?.gpa || '', maxGpa: item?.maxGpa || '4.5',
  })
  const f = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }))
  const mut = useMutation({
    mutationFn: (d: any) => item ? api.put(`/resume/educations/${item.id}`, d) : api.post('/resume/educations', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myResume'] }); toast.success(item ? '수정됨' : '추가됨'); onClose() },
    onError: (e: any) => toast.error(e.response?.data?.message || '저장 실패'),
  })
  const needsMajor = ['ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTOR'].includes(level)
  const needsGPA = needsMajor
  const needsStatus = level !== 'HIGH_SCHOOL'
  return (
    <Modal title={item ? '학력 수정' : '학력 추가'} onClose={onClose}
      onSave={() => mut.mutate({ ...form, level, institutionType: 'SCHOOL' })}
      disabled={!form.schoolName} saving={mut.isPending}>
      <div className="grid grid-cols-3 gap-1.5">
        {[['HIGH_SCHOOL', '고등학교'], ['ASSOCIATE', '전문대'], ['BACHELOR', '대학교'], ['MASTER', '석사'], ['DOCTOR', '박사'], ['OTHER', '기타']].map(([v, l]) => (
          <button key={v} onClick={() => setLevel(v)}
            className={cn('py-2 rounded-lg text-xs font-medium border-2 transition-all', level === v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600')}>
            {l}
          </button>
        ))}
      </div>
      <Field label={level === 'HIGH_SCHOOL' ? '학교명 *' : '학교/대학교명 *'} value={form.schoolName} onChange={f('schoolName')} />
      {needsMajor && <Field label="전공" value={form.major} onChange={f('major')} placeholder="컴퓨터공학과" />}
      <div className="grid grid-cols-2 gap-3">
        <Field label="입학" value={form.startDate} onChange={f('startDate')} placeholder="2018.03" />
        <Field label="졸업/수료" value={form.endDate} onChange={f('endDate')} placeholder="2022.02" />
      </div>
      {needsStatus && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">졸업 상태</label>
          <select value={form.graduationStatus} onChange={e => f('graduationStatus')(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
            {[['GRADUATED', '졸업'], ['ENROLLED', '재학'], ['LEAVE', '휴학'], ['EXPECTED', '졸업예정'], ['DROPPED', '중퇴']].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      )}
      {needsGPA && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="학점" value={form.gpa} onChange={f('gpa')} placeholder="3.8" />
          <Field label="만점" value={form.maxGpa} onChange={f('maxGpa')} placeholder="4.5" />
        </div>
      )}
    </Modal>
  )
}

// ─── 기술 ─────────────────────────────────────────────────────────────────────

function SkillSection({ resume }: { resume: Resume }) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('INTERMEDIATE')
  const lvlColor: Record<string, string> = {
    EXPERT: 'bg-purple-100 text-purple-700', ADVANCED: 'bg-blue-100 text-blue-700',
    INTERMEDIATE: 'bg-green-100 text-green-700', BEGINNER: 'bg-gray-100 text-gray-600',
  }
  const add = useMutation({ mutationFn: (d: any) => api.post('/resume/skills', d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['myResume'] }); setName(''); setCategory('') }, onError: (e: any) => toast.error(e.response?.data?.message || '저장 실패') })
  const del = useMutation({ mutationFn: (id: number) => api.delete(`/resume/skills/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['myResume'] }) })
  return (
    <div className={cn('bg-white rounded-xl border p-4', resume.skills.length > 0 && 'border-green-200')}>
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-4 h-4 text-gray-400" /><h3 className="font-semibold">기술</h3>
        {resume.skills.length > 0 && <DoneBadge />}
      </div>
      <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
        {resume.skills.length === 0 && <span className="text-sm text-gray-400">기술 스택을 추가해주세요</span>}
        {resume.skills.map(s => (
          <span key={s.id} className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-sm', lvlColor[s.level] || 'bg-gray-100')}>
            {s.name}
            <button onClick={() => del.mutate(s.id)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && name && add.mutate({ name, category, level })}
          placeholder="기술명 입력 후 Enter" className="px-3 py-2 border rounded-lg text-sm flex-1 min-w-[140px]" />
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="카테고리" className="px-3 py-2 border rounded-lg text-sm w-28" />
        <select value={level} onChange={e => setLevel(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          {[['BEGINNER', '입문'], ['INTERMEDIATE', '중급'], ['ADVANCED', '고급'], ['EXPERT', '전문가']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button onClick={() => name && add.mutate({ name, category, level })} disabled={!name || add.isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── 공개 설정 (레이아웃 3종 명확 구분) ──────────────────────────────────────
// Layout 1: 사람인 스타일 - 좌측 사진+기본정보 사이드바, 우측 내용
// Layout 2: LinkedIn 스타일 - 상단 배너+프로필, 섹션별 카드
// Layout 3: 리멤버 스타일 - 깔끔한 단일 컬럼, 헤더 강조

const LAYOUTS: Array<{
  key: LayoutType
  label: string
  style: string
  preview: React.ReactNode
}> = [
  {
    key: 'LAYOUT_1',
    label: '사람인형',
    style: '좌측 사이드바 · 2단 구성',
    preview: (
      <div className="w-full h-full flex bg-white text-[4px]">
        {/* 좌측 사이드바 */}
        <div className="w-[38%] bg-slate-700 p-1.5 flex flex-col gap-1">
          <div className="w-7 h-7 rounded-full bg-slate-400 mx-auto mb-0.5" />
          <div className="bg-white/70 h-0.5 rounded w-full" />
          <div className="bg-white/50 h-0.5 rounded w-3/4" />
          <div className="bg-white/40 h-0.5 rounded w-1/2 mt-1" />
          <div className="bg-white/50 h-0.5 rounded w-full" />
          <div className="bg-white/40 h-0.5 rounded w-2/3" />
          <div className="mt-1 bg-white/30 h-2.5 rounded w-full" />
          <div className="bg-white/30 h-2.5 rounded w-full" />
        </div>
        {/* 우측 컨텐츠 */}
        <div className="flex-1 p-1.5 flex flex-col gap-1">
          <div className="bg-slate-700 h-1.5 rounded w-2/3" />
          <div className="bg-gray-200 h-0.5 rounded w-full" />
          <div className="bg-gray-200 h-0.5 rounded w-4/5" />
          <div className="bg-gray-300 h-px w-full mt-0.5" />
          <div className="bg-slate-600 h-1 rounded w-1/3 mt-0.5" />
          <div className="bg-gray-200 h-0.5 rounded w-full" />
          <div className="bg-gray-200 h-0.5 rounded w-3/4" />
          <div className="bg-slate-600 h-1 rounded w-1/3 mt-0.5" />
          <div className="bg-gray-200 h-0.5 rounded w-full" />
          <div className="bg-gray-200 h-0.5 rounded w-2/3" />
        </div>
      </div>
    ),
  },
  {
    key: 'LAYOUT_2',
    label: 'LinkedIn형',
    style: '상단 배너 · 섹션 카드',
    preview: (
      <div className="w-full h-full bg-gray-100 text-[4px] p-1">
        {/* 배너 */}
        <div className="bg-blue-600 rounded h-5 w-full mb-1 relative">
          <div className="absolute -bottom-2 left-2 w-5 h-5 rounded-full bg-white border-2 border-white overflow-hidden">
            <div className="w-full h-full bg-blue-300 rounded-full" />
          </div>
        </div>
        {/* 기본 정보 카드 */}
        <div className="bg-white rounded p-1.5 mt-2 mb-1 shadow-sm">
          <div className="bg-gray-800 h-1.5 rounded w-1/2 mb-0.5" />
          <div className="bg-blue-400 h-0.5 rounded w-1/3" />
          <div className="flex gap-1 mt-0.5">
            <div className="bg-gray-200 h-0.5 rounded w-8" />
            <div className="bg-gray-200 h-0.5 rounded w-8" />
          </div>
        </div>
        {/* 섹션 카드들 */}
        <div className="bg-white rounded p-1 mb-1 shadow-sm">
          <div className="bg-gray-700 h-1 rounded w-1/4 mb-0.5" />
          <div className="bg-gray-200 h-0.5 rounded w-full" />
          <div className="bg-gray-200 h-0.5 rounded w-4/5" />
        </div>
        <div className="bg-white rounded p-1 shadow-sm">
          <div className="bg-gray-700 h-1 rounded w-1/4 mb-0.5" />
          <div className="flex gap-0.5">
            {[1,2,3,4].map(i => <div key={i} className="bg-blue-100 border border-blue-300 rounded h-1.5 flex-1" />)}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'LAYOUT_3',
    label: '리멤버형',
    style: '단일 컬럼 · 미니멀',
    preview: (
      <div className="w-full h-full bg-white text-[4px] p-2">
        {/* 이름/헤드라인 상단 강조 */}
        <div className="border-b-2 border-gray-900 pb-1 mb-1.5">
          <div className="bg-gray-900 h-2 rounded w-1/2 mb-0.5" />
          <div className="bg-gray-400 h-0.5 rounded w-1/3 mb-0.5" />
          <div className="flex gap-1">
            <div className="bg-gray-200 h-0.5 rounded flex-1" />
            <div className="bg-gray-200 h-0.5 rounded flex-1" />
          </div>
        </div>
        {/* 경력 */}
        <div className="mb-1">
          <div className="flex items-center gap-0.5 mb-0.5">
            <div className="w-0.5 h-2.5 bg-gray-900 rounded" />
            <div className="bg-gray-800 h-1 rounded flex-1" />
          </div>
          <div className="pl-1 space-y-0.5">
            <div className="bg-gray-200 h-0.5 rounded w-full" />
            <div className="bg-gray-200 h-0.5 rounded w-3/4" />
          </div>
        </div>
        {/* 학력 */}
        <div className="mb-1">
          <div className="flex items-center gap-0.5 mb-0.5">
            <div className="w-0.5 h-2.5 bg-gray-900 rounded" />
            <div className="bg-gray-800 h-1 rounded flex-1" />
          </div>
          <div className="pl-1 space-y-0.5">
            <div className="bg-gray-200 h-0.5 rounded w-full" />
          </div>
        </div>
        {/* 기술 태그 */}
        <div className="flex gap-0.5 flex-wrap">
          {[1,2,3,4,5].map(i => <div key={i} className="bg-gray-100 border border-gray-300 rounded-full h-1.5 w-4" />)}
        </div>
      </div>
    ),
  },
]

function SettingsSection({ resume }: { resume: Resume }) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    layoutType: (resume.layoutType || 'LAYOUT_1') as LayoutType,
    isPublic: resume.isPublic,
    slug: resume.slug || '',
  })
  const mut = useMutation({
    mutationFn: (d: any) => api.put('/resume/settings', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myResume'] }); toast.success('저장됨'); setEditing(false) },
    onError: (e: any) => toast.error(e.response?.data?.message || '저장 실패'),
  })
  const done = !!(resume.slug && resume.isPublic)
  const curLayout = LAYOUTS.find(l => l.key === (resume.layoutType || 'LAYOUT_1'))!

  return (
    <SectionCard title="공개 설정" icon={<Globe className="w-4 h-4" />} done={done}
      editing={editing} onEdit={() => setEditing(true)} onCancel={() => setEditing(false)}
      onSave={() => mut.mutate(form)} saving={mut.isPending}>
      {editing ? (
        <div className="space-y-5">
          {/* 레이아웃 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">이력서 레이아웃 선택</label>
            <div className="grid grid-cols-3 gap-3">
              {LAYOUTS.map(layout => (
                <div key={layout.key}
                  onClick={() => setForm(p => ({ ...p, layoutType: layout.key }))}
                  className={cn('border-2 rounded-xl overflow-hidden cursor-pointer transition-all',
                    form.layoutType === layout.key ? 'border-primary-500 shadow-md' : 'border-gray-200 hover:border-gray-300')}>
                  {/* 미리보기 */}
                  <div className="h-28 bg-gray-50 overflow-hidden">{layout.preview}</div>
                  <div className={cn('px-3 py-2', form.layoutType === layout.key ? 'bg-primary-50' : 'bg-white')}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">{layout.label}</span>
                      {form.layoutType === layout.key && <Check className="w-4 h-4 text-primary-500" />}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{layout.style}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 슬러그 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">공개 URL</label>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-sm shrink-0">/resume/</span>
              <input value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm" placeholder="my-resume" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.isPublic} onChange={e => setForm(p => ({ ...p, isPublic: e.target.checked }))} className="w-4 h-4" />
            이력서 공개하기
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-20 h-14 border rounded-xl overflow-hidden bg-gray-50 shrink-0">{curLayout.preview}</div>
            <div>
              <div className="text-sm font-semibold text-gray-800">{curLayout.label}</div>
              <div className="text-xs text-gray-400">{curLayout.style}</div>
              <div className={cn('mt-1.5 inline-block px-2 py-0.5 rounded-full text-xs', resume.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                {resume.isPublic ? '🟢 공개' : '🔒 비공개'}
              </div>
            </div>
          </div>
          {resume.isPublic && resume.slug && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500 text-xs flex-1 truncate">/resume/{resume.slug}</span>
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/resume/${resume.slug}`); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                className="p-1 hover:bg-gray-200 rounded">
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              </button>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  )
}

// ─── 공통 컴포넌트 ────────────────────────────────────────────────────────────

function DoneBadge() {
  return <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><Check className="w-3.5 h-3.5" />완료</span>
}

function SectionCard({ title, icon, children, done, editing, onEdit, onCancel, onSave, saving }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; done: boolean
  editing: boolean; onEdit: () => void; onCancel: () => void; onSave: () => void; saving: boolean
}) {
  return (
    <div className={cn('bg-white rounded-xl border p-4', done && !editing && 'border-green-200')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">{icon}<span className="font-semibold">{title}</span>{done && !editing && <DoneBadge />}</div>
        {editing
          ? <div className="flex gap-2">
              <button onClick={onCancel} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">취소</button>
              <button onClick={onSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}저장
              </button>
            </div>
          : <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
              <Pencil className="w-3.5 h-3.5" />수정
            </button>
        }
      </div>
      {children}
    </div>
  )
}

function ListCard({ title, icon, done, children, onAdd }: {
  title: string; icon: React.ReactNode; done: boolean; children: React.ReactNode; onAdd: () => void
}) {
  return (
    <div className={cn('bg-white rounded-xl border p-4', done && 'border-green-200')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">{icon}<h3 className="font-semibold">{title}</h3>{done && <DoneBadge />}</div>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
          <Plus className="w-3.5 h-3.5" />추가
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function ItemRow({ title, sub, meta, desc, onEdit, onDelete }: {
  title: string; sub?: string; meta?: string; desc?: string; onEdit: () => void; onDelete: () => void
}) {
  return (
    <div className="border rounded-lg p-3 flex justify-between items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 text-sm">{title}</div>
        {sub && <div className="text-sm text-primary-600 mt-0.5">{sub}</div>}
        {meta && <div className="text-xs text-gray-400 mt-0.5">{meta}</div>}
        {desc && <div className="text-sm text-gray-600 mt-1.5 line-clamp-2">{desc}</div>}
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
        <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
      </div>
    </div>
  )
}

function Modal({ title, children, onClose, onSave, disabled, saving }: {
  title: string; children: React.ReactNode; onClose: () => void; onSave: () => void; disabled?: boolean; saving?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">{children}</div>
        <div className="flex gap-2 p-4 border-t">
          <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-sm">취소</button>
          <button onClick={onSave} disabled={disabled || saving} className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50">
            {saving ? <span className="flex items-center justify-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" />저장 중</span> : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, textarea, disabled }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; textarea?: boolean; disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:outline-none" />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:bg-gray-50" />
      }
    </div>
  )
}

function IconField({ icon, value, onChange, placeholder }: {
  icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <input type="url" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <span className="text-xs text-gray-400 shrink-0 w-16">{label}</span>
      <span className="text-sm text-gray-800 truncate">{value}</span>
    </div>
  )
}

function LinkBadge({ icon, url, label }: { icon: React.ReactNode; url: string; label: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 text-gray-700">
      {icon}{label}
    </a>
  )
}

function Empty({ label }: { label: string }) {
  return <div className="text-center py-5 text-sm text-gray-400">{label}</div>
}
