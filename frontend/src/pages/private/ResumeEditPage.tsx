import { useState } from 'react'
import { FileText, Eye, Save } from 'lucide-react'

export default function ResumeEditPage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'experience' | 'project' | 'skill'>('basic')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">이력서 편집</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="w-5 h-5" />
            미리보기
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Save className="w-5 h-5" />
            저장
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex border-b">
          {[
            { key: 'basic', label: '기본 정보' },
            { key: 'experience', label: '경력' },
            { key: 'project', label: '프로젝트' },
            { key: 'skill', label: '기술' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'basic' && <BasicInfoForm />}
          {activeTab === 'experience' && <ExperienceForm />}
          {activeTab === 'project' && <ProjectForm />}
          {activeTab === 'skill' && <SkillForm />}
        </div>
      </div>
    </div>
  )
}

function BasicInfoForm() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">직함 / 타이틀</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="예: Full Stack Developer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">자기소개</label>
        <textarea
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          rows={4}
          placeholder="간단한 자기소개를 작성해주세요"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
          <input
            type="url"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="https://github.com/username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
          <input
            type="url"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="https://linkedin.com/in/username"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">블로그 URL</label>
        <input
          type="url"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="https://blog.example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">공개 URL 슬러그</label>
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">pickmeup.com/resume/</span>
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="your-name"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPublic" className="w-4 h-4 text-primary-600" />
        <label htmlFor="isPublic" className="text-sm text-gray-700">
          이력서 공개하기
        </label>
      </div>
    </div>
  )
}

function ExperienceForm() {
  return (
    <div className="text-center py-12 text-gray-500">
      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>경력 정보를 추가해주세요</p>
      <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        경력 추가
      </button>
    </div>
  )
}

function ProjectForm() {
  return (
    <div className="text-center py-12 text-gray-500">
      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>프로젝트를 추가해주세요</p>
      <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        프로젝트 추가
      </button>
    </div>
  )
}

function SkillForm() {
  return (
    <div className="text-center py-12 text-gray-500">
      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>기술 스택을 추가해주세요</p>
      <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        기술 추가
      </button>
    </div>
  )
}
