import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Building2, DollarSign, MapPin, Calendar, CheckCircle2, XCircle, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Proposal, ProposalStatus } from '@/types/recruiter';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    loadProposals();
  }, [filter]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const params = filter !== 'ALL' ? { status: filter } : {};
      const response = await api.get('/api/proposals', { params });
      setProposals(response.data.data);
    } catch (error) {
      console.error('Failed to load proposals:', error);
      toast.error('제안 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (proposalId: number) => {
    if (!confirm('이 제안을 수락하시겠습니까?')) return;

    try {
      await api.post(`/api/proposals/${proposalId}/accept`);
      toast.success('제안을 수락했습니다! 채팅방이 열렸어요 💬');
      loadProposals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '수락 실패');
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedProposal) return;

    try {
      await api.post(`/api/proposals/${selectedProposal.id}/reject`, {
        responseMessage: reason
      });
      toast.info('제안을 거절했습니다');
      setShowRejectModal(false);
      setSelectedProposal(null);
      loadProposals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '거절 실패');
    }
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
    <div className="p-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">받은 면접 제안</h1>
        <p className="text-gray-600">총 {proposals.length}개의 제안</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        {[
          { value: 'ALL', label: '전체' },
          { value: 'PENDING', label: '대기 중' },
          { value: 'ACCEPTED', label: '수락함' },
          { value: 'REJECTED', label: '거절함' },
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

      {/* Proposals List */}
      {proposals.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'ALL' ? '아직 받은 제안이 없어요' : '해당하는 제안이 없어요'}
          </h3>
          <p className="text-gray-600">이력서를 공개하면 기업에서 연락이 올 거예요!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => (
            <div 
              key={proposal.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                
                {/* Company Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{proposal.companyName}</h3>
                      <p className="text-lg text-gray-700">{proposal.position}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {proposal.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        ⏳ 대기 중
                      </span>
                    )}
                    {proposal.status === 'ACCEPTED' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        수락함
                      </span>
                    )}
                    {proposal.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        <XCircle className="h-4 w-4" />
                        거절함
                      </span>
                    )}
                    {proposal.status === 'EXPIRED' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        만료됨
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {proposal.salaryRange && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{proposal.salaryRange}</span>
                    </div>
                  )}
                  {proposal.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{proposal.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(proposal.proposedAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {proposal.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  
                  {/* Pending: Accept/Reject */}
                  {proposal.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleAccept(proposal.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        관심있어요
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProposal(proposal);
                          setShowRejectModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="h-5 w-5" />
                        거절하기
                      </button>
                    </>
                  )}

                  {/* Accepted: Open Chat */}
                  {proposal.status === 'ACCEPTED' && proposal.threadId && (
                    <button
                      onClick={() => handleOpenChat(proposal.threadId!)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      채팅하기
                    </button>
                  )}

                </div>

                {/* Expiry Notice */}
                {proposal.status === 'PENDING' && proposal.expiresAt && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {new Date(proposal.expiresAt).toLocaleDateString('ko-KR')}까지 유효
                  </p>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedProposal && (
        <RejectModal
          proposal={selectedProposal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedProposal(null);
          }}
          onSubmit={handleReject}
        />
      )}

    </div>
  );
}

// 거절 모달
function RejectModal({ 
  proposal, 
  onClose, 
  onSubmit 
}: { 
  proposal: Proposal; 
  onClose: () => void; 
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            제안을 거절하시겠습니까?
          </h2>

          <p className="text-gray-600 mb-4">
            {proposal.companyName}의 {proposal.position} 포지션 제안을 거절합니다.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                거절 사유 (선택)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="예: 다른 회사에 합격했습니다"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                거절하기
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
