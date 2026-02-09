package com.pickmeup.service;

import com.pickmeup.domain.recruiter.ContactProposal;
import com.pickmeup.domain.recruiter.PickStatus;
import com.pickmeup.domain.recruiter.ProposalStatus;
import com.pickmeup.domain.recruiter.ResumePick;
import com.pickmeup.domain.resume.Resume;
import com.pickmeup.domain.user.User;
import com.pickmeup.domain.user.UserType;
import com.pickmeup.dto.recruiter.RecruiterDto.*;
import com.pickmeup.exception.BusinessException;
import com.pickmeup.exception.ErrorCode;
import com.pickmeup.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * RecruiterService 단위 테스트
 * 
 * Mockito 사용:
 * - @Mock: 가짜 객체 생성 (Repository 등)
 * - @InjectMocks: Mock 객체를 주입받는 실제 테스트 대상
 * - when().thenReturn(): Mock 동작 정의
 * - verify(): 메서드 호출 검증
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("RecruiterService 테스트")
class RecruiterServiceTest {

    @Mock
    private ResumeRepository resumeRepository;
    
    @Mock
    private ResumePickRepository pickRepository;
    
    @Mock
    private ContactProposalRepository proposalRepository;
    
    @Mock
    private ThreadRepository threadRepository;
    
    @Mock
    private MessageService messageService;
    
    @InjectMocks
    private RecruiterService recruiterService;
    
    private User recruiter;
    private User jobSeeker;
    private Resume resume;
    
    @BeforeEach
    void setUp() {
        // 헤드헌터 생성
        recruiter = User.builder()
                .id(1L)
                .email("recruiter@kakao.com")
                .name("김채용")
                .userType(UserType.RECRUITER)
                .companyName("카카오")
                .build();
        
        // 구직자 생성
        jobSeeker = User.builder()
                .id(2L)
                .email("job@gmail.com")
                .name("홍길동")
                .userType(UserType.JOB_SEEKER)
                .build();
        
        // 이력서 생성
        resume = Resume.builder()
                .id(1L)
                .user(jobSeeker)
                .title("백엔드 개발자")
                .isPublic(true)
                .slug("hong-backend")
                .build();
    }

    // ==================== Pick 테스트 ====================

    @Test
    @DisplayName("이력서 픽 성공")
    void pickResume_Success() {
        // given
        PickCreateRequest request = new PickCreateRequest("좋은 경력");
        
        when(resumeRepository.findById(1L)).thenReturn(Optional.of(resume));
        when(pickRepository.existsByRecruiterAndResume(recruiter, resume)).thenReturn(false);
        when(pickRepository.save(any(ResumePick.class))).thenAnswer(i -> i.getArgument(0));
        
        // when
        PickResponse response = recruiterService.pickResume(recruiter, 1L, request);
        
        // then
        assertThat(response).isNotNull();
        verify(pickRepository).save(any(ResumePick.class));
    }
    
    @Test
    @DisplayName("헤드헌터가 아닌 사용자는 픽 불가")
    void pickResume_NotRecruiter() {
        // given
        User normalUser = User.builder()
                .id(3L)
                .userType(UserType.JOB_SEEKER)
                .build();
        
        PickCreateRequest request = new PickCreateRequest("메모");
        
        // when & then
        assertThatThrownBy(() -> recruiterService.pickResume(normalUser, 1L, request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOT_RECRUITER);
    }
    
    @Test
    @DisplayName("비공개 이력서는 픽 불가")
    void pickResume_NotPublic() {
        // given
        resume.setPublic(false);
        
        PickCreateRequest request = new PickCreateRequest("메모");
        
        when(resumeRepository.findById(1L)).thenReturn(Optional.of(resume));
        
        // when & then
        assertThatThrownBy(() -> recruiterService.pickResume(recruiter, 1L, request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESUME_NOT_PUBLIC);
    }
    
    @Test
    @DisplayName("이미 픽한 이력서는 중복 픽 불가")
    void pickResume_AlreadyPicked() {
        // given
        PickCreateRequest request = new PickCreateRequest("메모");
        
        when(resumeRepository.findById(1L)).thenReturn(Optional.of(resume));
        when(pickRepository.existsByRecruiterAndResume(recruiter, resume)).thenReturn(true);
        
        // when & then
        assertThatThrownBy(() -> recruiterService.pickResume(recruiter, 1L, request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ALREADY_PICKED);
    }
    
    @Test
    @DisplayName("자기 자신의 이력서는 픽 불가")
    void pickResume_OwnResume() {
        // given
        Resume ownResume = Resume.builder()
                .id(2L)
                .user(recruiter)  // 헤드헌터 자신의 이력서
                .isPublic(true)
                .build();
        
        PickCreateRequest request = new PickCreateRequest("메모");
        
        when(resumeRepository.findById(2L)).thenReturn(Optional.of(ownResume));
        when(pickRepository.existsByRecruiterAndResume(recruiter, ownResume)).thenReturn(false);
        
        // when & then
        assertThatThrownBy(() -> recruiterService.pickResume(recruiter, 2L, request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CANNOT_PICK_OWN_RESUME);
    }

    // ==================== 제안 테스트 ====================

    @Test
    @DisplayName("제안 발송 성공")
    void sendProposal_Success() {
        // given
        ProposalCreateRequest request = ProposalCreateRequest.builder()
                .position("백엔드 개발자")
                .salaryRange("6000-8000만원")
                .message("함께 일하고 싶습니다")
                .build();
        
        when(resumeRepository.findById(1L)).thenReturn(Optional.of(resume));
        when(pickRepository.findByRecruiterAndResume(recruiter, resume))
                .thenReturn(Optional.empty());
        when(proposalRepository.save(any(ContactProposal.class)))
                .thenAnswer(i -> i.getArgument(0));
        
        // when
        ProposalResponse response = recruiterService.sendProposal(recruiter, 1L, request);
        
        // then
        assertThat(response).isNotNull();
        assertThat(response.getCompanyName()).isEqualTo("카카오");
        assertThat(response.getPosition()).isEqualTo("백엔드 개발자");
        verify(proposalRepository).save(any(ContactProposal.class));
    }
    
    @Test
    @DisplayName("제안 수락 성공")
    void acceptProposal_Success() {
        // given
        ContactProposal proposal = ContactProposal.builder()
                .id(1L)
                .recruiter(recruiter)
                .jobSeeker(jobSeeker)
                .companyName("카카오")
                .position("백엔드 개발자")
                .message("제안합니다")
                .status(ProposalStatus.PENDING)
                .build();
        
        when(proposalRepository.findById(1L)).thenReturn(Optional.of(proposal));
        when(messageService.createProposalThread(proposal))
                .thenReturn(com.pickmeup.domain.message.Thread.builder().id(100L).build());
        
        // when
        ProposalResponse response = recruiterService.acceptProposal(jobSeeker, 1L);
        
        // then
        assertThat(response).isNotNull();
        assertThat(proposal.getStatus()).isEqualTo(ProposalStatus.ACCEPTED);
        assertThat(proposal.getThreadId()).isEqualTo(100L);
        verify(messageService).createProposalThread(proposal);
    }
    
    @Test
    @DisplayName("다른 사람의 제안은 수락 불가")
    void acceptProposal_AccessDenied() {
        // given
        ContactProposal proposal = ContactProposal.builder()
                .id(1L)
                .recruiter(recruiter)
                .jobSeeker(jobSeeker)
                .status(ProposalStatus.PENDING)
                .build();
        
        User otherUser = User.builder().id(999L).build();
        
        when(proposalRepository.findById(1L)).thenReturn(Optional.of(proposal));
        
        // when & then
        assertThatThrownBy(() -> recruiterService.acceptProposal(otherUser, 1L))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ACCESS_DENIED);
    }
    
    @Test
    @DisplayName("이미 응답한 제안은 수락 불가")
    void acceptProposal_AlreadyResponded() {
        // given
        ContactProposal proposal = ContactProposal.builder()
                .id(1L)
                .recruiter(recruiter)
                .jobSeeker(jobSeeker)
                .status(ProposalStatus.ACCEPTED)  // 이미 수락됨
                .build();
        
        when(proposalRepository.findById(1L)).thenReturn(Optional.of(proposal));
        
        // when & then
        assertThatThrownBy(() -> recruiterService.acceptProposal(jobSeeker, 1L))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PROPOSAL_ALREADY_RESPONDED);
    }

    // ==================== 통계 테스트 ====================

    @Test
    @DisplayName("헤드헌터 통계 조회 성공")
    void getRecruiterStats_Success() {
        // given
        when(pickRepository.countByRecruiter(recruiter)).thenReturn(10L);
        when(pickRepository.countByRecruiterAndStatus(recruiter, PickStatus.PICKED)).thenReturn(7L);
        when(pickRepository.countByRecruiterAndStatus(recruiter, PickStatus.CONTACTED)).thenReturn(3L);
        when(pickRepository.countByRecruiterAndStatus(recruiter, PickStatus.REJECTED)).thenReturn(0L);
        when(proposalRepository.findByRecruiterOrderByProposedAtDesc(recruiter))
                .thenReturn(Arrays.asList(new ContactProposal(), new ContactProposal()));
        when(proposalRepository.countByRecruiterAndStatus(recruiter, ProposalStatus.PENDING)).thenReturn(1L);
        when(proposalRepository.countByRecruiterAndStatus(recruiter, ProposalStatus.ACCEPTED)).thenReturn(1L);
        when(proposalRepository.countByRecruiterAndStatus(recruiter, ProposalStatus.REJECTED)).thenReturn(0L);
        
        // when
        RecruiterStatsResponse stats = recruiterService.getRecruiterStats(recruiter);
        
        // then
        assertThat(stats.getTotalPicks()).isEqualTo(10L);
        assertThat(stats.getPickedOnly()).isEqualTo(7L);
        assertThat(stats.getTotalProposals()).isEqualTo(2L);
        assertThat(stats.getProposalAcceptanceRate()).isEqualTo(50.0);
    }
}
