import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Heart, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Pick, PickStatus } from '@/types/recruiter';

export default function MyPicksPage() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PICKED' | 'CONTACTED' | 'REJECTED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null);

  useEffect(() => {
    loadPicks();
  }, [filter]);

  const loadPicks = async () => {
    try {
      setLoading(true);
      const params = filter !== 'ALL' ? { status: filter } : {};
      const response = await api.get('/api/recruiter/picks', { params });
      setPicks(response.data.data);
    } catch (error) {
      console.error('Failed to load picks:', error);
      toast.error('픽 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSendProposal = (pick: Pick) => {
    setSelectedPick(pick);
    setShowProposalModal(true);
  };

  const handleOpenChat = (threadId: number) => {
    window.location.href = `/inbox?thread=${threadId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">내가 픽한 사람들</h1>
        <p className="text-gray-600">총 {picks.length}명</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        {[
          { value: 'ALL', label: '전체' },
          { value: 'PICKED', label: '픽만 함' },
          { value: 'CONTACTED', label: '제안 보냄' },
          { value: 'REJECTED', label: '패스' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === tab.value
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Picks Grid */}
      {picks.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-purple-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'ALL' ? '아직 픽한 인재가 없어요' : `${filter} 상태의 픽이 없어요`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'ALL' ? 
              '마음에 드는 인재를 찾아보세요!' : 
              '다른 필터를 선택해보세요'
            }
          </p>
          {filter === 'ALL' && (
            <a
              href="/recruiter/swipe"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              이력서 둘러보기 →
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {picks.map((pick) => (
            <div key={pick.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              
              {/* Profile */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {pick.profileImageUrl ? (
                      <img src={pick.profileImageUrl} alt={pick.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      pick.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{pick.name}</h3>
                    <p className="text-sm text-gray-600">{pick.title}</p>
                    <p className="text-xs text-gray-500 mt-1">경력 {pick.experienceYears}년</p>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {pick.techStacks.slice(0, 3).map((tech, idx) => (
                    <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {tech}
                    </span>
                  ))}
                  {pick.techStacks.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{pick.techStacks.length - 3}
                    </span>
                  )}
                </div>

                {/* Memo */}
                {pick.memo && (
                  <p className="text-sm text-gray-600 mb-4 italic">
                    "{pick.memo}"
                  </p>
                )}

                {/* Status Badge */}
                <div className="mb-4">
                  {pick.proposal?.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      ⏳ 제안 대기 중
                    </span>
                  )}
                  {pick.proposal?.status === 'ACCEPTED' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      ✅ 수락됨
                    </span>
                  )}
                  {pick.proposal?.status === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      ❌ 거절됨
                    </span>
                  )}
                  {!pick.proposal && pick.status === 'PICKED' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      <Heart className="h-3 w-3" fill="currentColor" />
                      픽됨
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  
                  {/* 제안 수락 시 채팅 */}
                  {pick.proposal?.status === 'ACCEPTED' && pick.proposal.threadId && (
                    <button
                      onClick={() => handleOpenChat(pick.proposal!.threadId!)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      채팅하기
                    </button>
                  )}
                  
                  {/* 제안 보내기 */}
                  {!pick.proposal && (
                    <button
                      onClick={() => handleSendProposal(pick)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      제안하기
                    </button>
                  )}
                  
                  {/* 이력서 보기 */}
                  <a
                    href={pick.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  
                </div>

                {/* Picked Date */}
                <p className="text-xs text-gray-500 mt-3 text-center">
                  {new Date(pick.pickedAt).toLocaleDateString('ko-KR')} 픽함
                </p>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Proposal Modal */}
      {showProposalModal && selectedPick && (
        <ProposalModal
          pick={selectedPick}
          onClose={() => {
            setShowProposalModal(false);
            setSelectedPick(null);
          }}
          onSuccess={() => {
            loadPicks();
            setShowProposalModal(false);
            setSelectedPick(null);
          }}
        />
      )}

    </div>
  );
}

// 제안 모달 컴포넌트
function ProposalModal({ pick, onClose, onSuccess }: { pick: Pick; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    position: '',
    salaryRange: '',
    location: '',
    workType: '정규직',
    message: `안녕하세요!

${pick.name}님의 이력서를 보고 연락드립니다.
저희와 함께 일하실 의향이 있으신지 여쭙고 싶습니다.

관심 있으시다면 면접 일정을 조율하고 싶습니다.

감사합니다.`,
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.position || !formData.message) {
      toast.error('포지션과 메시지는 필수입니다');
      return;
    }

    try {
      setSending(true);
      await api.post(`/api/recruiter/proposal/${pick.resumeId}`, formData);
      toast.success('제안을 보냈습니다! 📧');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '제안 발송 실패');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {pick.name}님에게 제안 보내기
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                포지션 *
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="예: 백엔드 개발자"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                급여 범위
              </label>
              <input
                type="text"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                placeholder="예: 5000-7000만원 또는 협의 가능"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                근무지
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="예: 서울 강남구"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                고용 형태
              </label>
              <select
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="정규직">정규직</option>
                <option value="계약직">계약직</option>
                <option value="인턴">인턴</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제안 메시지 *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {sending ? '발송 중...' : '제안 보내기'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
