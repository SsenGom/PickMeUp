package com.pickmeup.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pickmeup.config.security.JwtTokenProvider;
import com.pickmeup.domain.user.User;
import com.pickmeup.domain.user.UserType;
import com.pickmeup.dto.recruiter.RecruiterDto.*;
import com.pickmeup.service.RecruiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * RecruiterController 통합 테스트
 * 
 * @WebMvcTest: Controller 레이어만 테스트 (Service는 Mock)
 * MockMvc: HTTP 요청을 시뮬레이션
 */
@WebMvcTest(RecruiterController.class)
@DisplayName("RecruiterController 통합 테스트")
class RecruiterControllerTest {

    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private RecruiterService recruiterService;
    
    @MockBean
    private JwtTokenProvider jwtTokenProvider;
    
    private User recruiter;
    
    @BeforeEach
    void setUp() {
        recruiter = User.builder()
                .id(1L)
                .email("recruiter@kakao.com")
                .name("김채용")
                .userType(UserType.RECRUITER)
                .companyName("카카오")
                .build();
    }

    @Test
    @DisplayName("GET /api/recruiter/feed - 이력서 피드 조회")
    @WithMockUser
    void getResumeFeed() throws Exception {
        // given
        List<ResumeFeedResponse> feed = Arrays.asList(
                ResumeFeedResponse.builder()
                        .resumeId(1L)
                        .userId(2L)
                        .name("홍길동")
                        .title("백엔드 개발자")
                        .techStacks(Arrays.asList("Java", "Spring"))
                        .build()
        );
        
        when(recruiterService.getResumeFeed(any(User.class), eq(20)))
                .thenReturn(feed);
        
        // when & then
        mockMvc.perform(get("/api/recruiter/feed")
                .param("limit", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].resumeId").value(1))
                .andExpect(jsonPath("$.data[0].name").value("홍길동"));
    }

    @Test
    @DisplayName("POST /api/recruiter/pick/{resumeId} - 이력서 픽")
    @WithMockUser
    void pickResume() throws Exception {
        // given
        PickCreateRequest request = new PickCreateRequest("좋은 경력");
        
        PickResponse response = PickResponse.builder()
                .id(1L)
                .resumeId(1L)
                .name("홍길동")
                .title("백엔드 개발자")
                .build();
        
        when(recruiterService.pickResume(any(User.class), eq(1L), any(PickCreateRequest.class)))
                .thenReturn(response);
        
        // when & then
        mockMvc.perform(post("/api/recruiter/pick/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.resumeId").value(1));
    }

    @Test
    @DisplayName("POST /api/recruiter/proposal/{resumeId} - 제안 발송")
    @WithMockUser
    void sendProposal() throws Exception {
        // given
        ProposalCreateRequest request = ProposalCreateRequest.builder()
                .position("백엔드 개발자")
                .salaryRange("6000-8000만원")
                .location("서울 강남")
                .workType("정규직")
                .message("함께 일하고 싶습니다")
                .build();
        
        ProposalResponse response = ProposalResponse.builder()
                .proposalId(1L)
                .companyName("카카오")
                .position("백엔드 개발자")
                .status(com.pickmeup.domain.recruiter.ProposalStatus.PENDING)
                .build();
        
        when(recruiterService.sendProposal(any(User.class), eq(1L), any(ProposalCreateRequest.class)))
                .thenReturn(response);
        
        // when & then
        mockMvc.perform(post("/api/recruiter/proposal/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.proposalId").value(1))
                .andExpect(jsonPath("$.data.companyName").value("카카오"));
    }

    @Test
    @DisplayName("GET /api/recruiter/picks - 픽 목록 조회")
    @WithMockUser
    void getMyPicks() throws Exception {
        // given
        List<PickResponse> picks = Arrays.asList(
                PickResponse.builder()
                        .id(1L)
                        .resumeId(1L)
                        .name("홍길동")
                        .title("백엔드 개발자")
                        .build()
        );
        
        when(recruiterService.getMyPicks(any(User.class), isNull()))
                .thenReturn(picks);
        
        // when & then
        mockMvc.perform(get("/api/recruiter/picks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].resumeId").value(1));
    }

    @Test
    @DisplayName("GET /api/recruiter/statistics - 통계 조회")
    @WithMockUser
    void getRecruiterStats() throws Exception {
        // given
        RecruiterStatsResponse stats = RecruiterStatsResponse.builder()
                .totalPicks(10L)
                .totalProposals(5L)
                .proposalAcceptanceRate(40.0)
                .build();
        
        when(recruiterService.getRecruiterStats(any(User.class)))
                .thenReturn(stats);
        
        // when & then
        mockMvc.perform(get("/api/recruiter/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalPicks").value(10))
                .andExpect(jsonPath("$.data.proposalAcceptanceRate").value(40.0));
    }
}
