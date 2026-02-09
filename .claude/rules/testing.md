# 🧪 PickMeUp 테스팅 가이드

> **원칙**: 테스트 없는 코드는 레거시다. 테스트는 문서이자 안전망이다.

---

## 📊 테스트 커버리지 기준

| 계층 | 최소 커버리지 | 목표 커버리지 | 비고 |
|------|-------------|-------------|------|
| Controller | 70% | 85% | Happy Path + 주요 에러 케이스 |
| Service | 80% | 90% | 모든 비즈니스 로직 |
| Repository | 60% | 75% | 커스텀 쿼리 위주 |
| Util/Helper | 90% | 100% | 모든 분기 커버 |
| **Critical Path** | **95%** | **100%** | 인증, 결제, 핵심 비즈니스 |

---

## 🏗️ 테스트 피라미드

```
                    ┌─────────┐
                    │   E2E   │  ← 최소한 (느림, 비용 높음)
                   ─┴─────────┴─
                  ┌─────────────┐
                  │ Integration │  ← 적당히 (API 테스트)
                 ─┴─────────────┴─
                ┌─────────────────┐
                │   Unit Tests    │  ← 대부분 (빠름, 격리됨)
               ─┴─────────────────┴─
```

---

## ☕ Backend 테스트 (Spring Boot)

### 1. 단위 테스트 (Unit Test)

```java
/**
 * Service 단위 테스트 템플릿
 * 
 * 원칙:
 * - Given-When-Then 패턴 필수
 * - 하나의 테스트 = 하나의 동작 검증
 * - 테스트명은 한글로 명확하게
 * - @Nested로 메서드별 그룹화
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("JobApplicationService 단위 테스트")
class JobApplicationServiceTest {
    
    @InjectMocks
    private JobApplicationService sut; // System Under Test
    
    @Mock
    private JobApplicationRepository applicationRepository;
    
    @Mock
    private CompanyRepository companyRepository;
    
    @Mock
    private ApplicationEventPublisher eventPublisher;
    
    @Nested
    @DisplayName("create 메서드")
    class Describe_create {
        
        @Nested
        @DisplayName("유효한 요청이 주어지면")
        class Context_with_valid_request {
            
            @Test
            @DisplayName("지원서를 생성하고 이벤트를 발행한다")
            void it_creates_application_and_publishes_event() {
                // Given
                Long userId = 1L;
                var request = createValidRequest();
                var company = createCompany();
                var savedApplication = createSavedApplication(userId, company);
                
                given(applicationRepository.existsByUserIdAndCompanyId(anyLong(), anyLong()))
                        .willReturn(false);
                given(companyRepository.findById(anyLong()))
                        .willReturn(Optional.of(company));
                given(applicationRepository.save(any()))
                        .willReturn(savedApplication);
                
                // When
                var result = sut.create(userId, request);
                
                // Then
                assertAll(
                    () -> assertThat(result.getId()).isEqualTo(1L),
                    () -> assertThat(result.getPosition()).isEqualTo("백엔드 개발자"),
                    () -> assertThat(result.getStatus()).isEqualTo(ApplicationStatus.APPLIED)
                );
                
                then(eventPublisher).should().publishEvent(any(ApplicationCreatedEvent.class));
            }
        }
        
        @Nested
        @DisplayName("이미 지원한 회사라면")
        class Context_with_duplicate_application {
            
            @Test
            @DisplayName("DuplicateApplicationException을 던진다")
            void it_throws_duplicate_exception() {
                // Given
                given(applicationRepository.existsByUserIdAndCompanyId(anyLong(), anyLong()))
                        .willReturn(true);
                
                // When & Then
                assertThatThrownBy(() -> sut.create(1L, createValidRequest()))
                        .isInstanceOf(DuplicateApplicationException.class)
                        .hasMessageContaining("이미 지원");
                
                then(applicationRepository).should(never()).save(any());
            }
        }
    }
    
    @Nested
    @DisplayName("changeStatus 메서드")
    class Describe_changeStatus {
        
        @ParameterizedTest(name = "{0} → {1} 전이 가능")
        @CsvSource({
            "APPLIED, DOCUMENT_PASSED",
            "APPLIED, REJECTED",
            "DOCUMENT_PASSED, INTERVIEW_SCHEDULED",
            "INTERVIEW_SCHEDULED, FINAL_PASSED"
        })
        @DisplayName("유효한 상태 전이는 성공한다")
        void valid_transition_succeeds(ApplicationStatus from, ApplicationStatus to) {
            // Given
            var application = createApplicationWithStatus(from);
            given(applicationRepository.findById(anyLong()))
                    .willReturn(Optional.of(application));
            
            // When
            sut.changeStatus(1L, 1L, to);
            
            // Then
            assertThat(application.getStatus()).isEqualTo(to);
        }
        
        @ParameterizedTest(name = "{0} → {1} 전이 불가")
        @CsvSource({
            "APPLIED, FINAL_PASSED",
            "REJECTED, APPLIED",
            "FINAL_PASSED, REJECTED"
        })
        @DisplayName("유효하지 않은 상태 전이는 예외를 던진다")
        void invalid_transition_throws(ApplicationStatus from, ApplicationStatus to) {
            // Given
            var application = createApplicationWithStatus(from);
            given(applicationRepository.findById(anyLong()))
                    .willReturn(Optional.of(application));
            
            // When & Then
            assertThatThrownBy(() -> sut.changeStatus(1L, 1L, to))
                    .isInstanceOf(InvalidStatusTransitionException.class);
        }
    }
    
    // ========== Test Fixtures ==========
    
    private JobApplicationCreateRequest createValidRequest() {
        return JobApplicationCreateRequest.builder()
                .companyId(1L)
                .position("백엔드 개발자")
                .build();
    }
    
    private Company createCompany() {
        return Company.builder()
                .id(1L)
                .name("테스트 회사")
                .build();
    }
    
    private JobApplication createSavedApplication(Long userId, Company company) {
        return JobApplication.builder()
                .id(1L)
                .userId(userId)
                .company(company)
                .position("백엔드 개발자")
                .status(ApplicationStatus.APPLIED)
                .appliedAt(LocalDateTime.now())
                .build();
    }
    
    private JobApplication createApplicationWithStatus(ApplicationStatus status) {
        return JobApplication.builder()
                .id(1L)
                .userId(1L)
                .company(createCompany())
                .position("개발자")
                .status(status)
                .appliedAt(LocalDateTime.now())
                .build();
    }
}
```

### 2. Controller 통합 테스트

```java
/**
 * Controller 통합 테스트
 * 
 * 특징:
 * - 실제 HTTP 요청/응답 검증
 * - Spring Security 포함
 * - Service는 Mock 처리
 */
@WebMvcTest(JobApplicationController.class)
@Import({SecurityConfig.class, JwtTokenProvider.class})
@DisplayName("JobApplicationController 통합 테스트")
class JobApplicationControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private JobApplicationService applicationService;
    
    @MockBean
    private JobApplicationQueryService queryService;
    
    private static final String BASE_URL = "/api/v1/applications";
    private String accessToken;
    
    @BeforeEach
    void setUp() {
        accessToken = createTestToken(1L, "test@test.com");
    }
    
    @Nested
    @DisplayName("POST /api/v1/applications")
    class Describe_create {
        
        @Test
        @DisplayName("201: 유효한 요청으로 지원서 생성")
        void returns_201_with_valid_request() throws Exception {
            // Given
            var request = Map.of(
                "companyId", 1,
                "position", "백엔드 개발자"
            );
            var response = createResponse(1L, "테스트회사", "백엔드 개발자");
            
            given(applicationService.create(eq(1L), any()))
                    .willReturn(response);
            
            // When & Then
            mockMvc.perform(post(BASE_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.position").value("백엔드 개발자"))
                .andDo(print());
        }
        
        @Test
        @DisplayName("400: 필수 필드 누락")
        void returns_400_when_required_field_missing() throws Exception {
            // Given
            var request = Map.of("position", "백엔드"); // companyId 누락
            
            // When & Then
            mockMvc.perform(post(BASE_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").exists());
        }
        
        @Test
        @DisplayName("401: 인증 토큰 없음")
        void returns_401_without_token() throws Exception {
            // Given
            var request = Map.of("companyId", 1, "position", "백엔드");
            
            // When & Then
            mockMvc.perform(post(BASE_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
        }
        
        @Test
        @DisplayName("409: 중복 지원")
        void returns_409_when_duplicate() throws Exception {
            // Given
            var request = Map.of("companyId", 1, "position", "백엔드");
            
            given(applicationService.create(anyLong(), any()))
                    .willThrow(new DuplicateApplicationException(1L, 1L));
            
            // When & Then
            mockMvc.perform(post(BASE_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("AP002"));
        }
    }
    
    @Nested
    @DisplayName("GET /api/v1/applications")
    class Describe_getList {
        
        @Test
        @DisplayName("200: 페이징된 목록 반환")
        void returns_200_with_paginated_list() throws Exception {
            // Given
            var content = List.of(
                createResponse(1L, "회사A", "백엔드"),
                createResponse(2L, "회사B", "프론트엔드")
            );
            var page = new PageImpl<>(content, PageRequest.of(0, 10), 2);
            
            given(queryService.findByUserId(eq(1L), any(Pageable.class)))
                    .willReturn(page);
            
            // When & Then
            mockMvc.perform(get(BASE_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .param("page", "0")
                    .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(2))
                .andExpect(jsonPath("$.data.totalElements").value(2));
        }
    }
}
```

### 3. Repository 통합 테스트

```java
/**
 * Repository 통합 테스트
 * 
 * 특징:
 * - 실제 DB 사용 (H2 또는 TestContainers)
 * - 트랜잭션 자동 롤백
 * - 커스텀 쿼리 검증
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(QueryDslConfig.class)
@DisplayName("JobApplicationRepository 통합 테스트")
class JobApplicationRepositoryTest {
    
    @Autowired
    private JobApplicationRepository repository;
    
    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private TestEntityManager em;
    
    private Company testCompany;
    
    @BeforeEach
    void setUp() {
        testCompany = companyRepository.save(
            Company.builder().name("테스트 회사").build()
        );
    }
    
    @Nested
    @DisplayName("findByUserIdOrderByAppliedAtDesc")
    class Describe_findByUserId {
        
        @Test
        @DisplayName("사용자의 지원서를 최신순으로 반환한다")
        void returns_applications_ordered_by_date_desc() {
            // Given
            Long userId = 1L;
            saveApplication(userId, "포지션1", LocalDateTime.now().minusDays(2));
            saveApplication(userId, "포지션2", LocalDateTime.now().minusDays(1));
            saveApplication(userId, "포지션3", LocalDateTime.now());
            saveApplication(2L, "다른유저", LocalDateTime.now()); // 다른 유저
            
            flushAndClear();
            
            // When
            Page<JobApplication> result = repository.findByUserIdOrderByAppliedAtDesc(
                userId, PageRequest.of(0, 10)
            );
            
            // Then
            assertThat(result.getContent()).hasSize(3);
            assertThat(result.getContent())
                .extracting("position")
                .containsExactly("포지션3", "포지션2", "포지션1");
        }
        
        @Test
        @DisplayName("페이징이 올바르게 동작한다")
        void pagination_works_correctly() {
            // Given
            Long userId = 1L;
            for (int i = 0; i < 25; i++) {
                saveApplication(userId, "포지션" + i, LocalDateTime.now().minusDays(i));
            }
            flushAndClear();
            
            // When
            Page<JobApplication> page1 = repository.findByUserIdOrderByAppliedAtDesc(
                userId, PageRequest.of(0, 10)
            );
            Page<JobApplication> page2 = repository.findByUserIdOrderByAppliedAtDesc(
                userId, PageRequest.of(1, 10)
            );
            
            // Then
            assertThat(page1.getContent()).hasSize(10);
            assertThat(page1.getTotalElements()).isEqualTo(25);
            assertThat(page1.getTotalPages()).isEqualTo(3);
            assertThat(page2.getContent()).hasSize(10);
        }
    }
    
    @Nested
    @DisplayName("existsByUserIdAndCompanyId")
    class Describe_existsByUserIdAndCompanyId {
        
        @Test
        @DisplayName("존재하면 true 반환")
        void returns_true_when_exists() {
            // Given
            saveApplication(1L, "백엔드", LocalDateTime.now());
            flushAndClear();
            
            // When
            boolean exists = repository.existsByUserIdAndCompanyId(1L, testCompany.getId());
            
            // Then
            assertThat(exists).isTrue();
        }
        
        @Test
        @DisplayName("존재하지 않으면 false 반환")
        void returns_false_when_not_exists() {
            // When
            boolean exists = repository.existsByUserIdAndCompanyId(999L, 999L);
            
            // Then
            assertThat(exists).isFalse();
        }
    }
    
    // ========== Helper Methods ==========
    
    private JobApplication saveApplication(Long userId, String position, LocalDateTime appliedAt) {
        return repository.save(JobApplication.builder()
                .userId(userId)
                .company(testCompany)
                .position(position)
                .status(ApplicationStatus.APPLIED)
                .appliedAt(appliedAt)
                .build());
    }
    
    private void flushAndClear() {
        em.flush();
        em.clear();
    }
}
```

---

## ⚛️ Frontend 테스트 (React / TypeScript)

### 1. 컴포넌트 테스트

```typescript
/**
 * 컴포넌트 테스트 템플릿
 * 
 * 원칙:
 * - 사용자 관점에서 테스트
 * - 구현 세부사항이 아닌 동작 테스트
 * - aria-* 속성 활용
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JobCard } from './JobCard';

// 테스트용 QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// 테스트 래퍼
const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('JobCard', () => {
  const mockApplication = {
    id: 1,
    company: { id: 1, name: '테스트 회사' },
    position: '백엔드 개발자',
    status: 'APPLIED',
    appliedAt: '2024-01-15T10:00:00',
  };
  
  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onClick: vi.fn(),
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('렌더링', () => {
    it('회사명과 포지션을 표시한다', () => {
      renderWithProviders(
        <JobCard application={mockApplication} {...mockHandlers} />
      );
      
      expect(screen.getByText('테스트 회사')).toBeInTheDocument();
      expect(screen.getByText('백엔드 개발자')).toBeInTheDocument();
    });
    
    it('상태 배지를 표시한다', () => {
      renderWithProviders(
        <JobCard application={mockApplication} {...mockHandlers} />
      );
      
      expect(screen.getByText('지원완료')).toBeInTheDocument();
    });
    
    it('지원일을 포맷팅하여 표시한다', () => {
      renderWithProviders(
        <JobCard application={mockApplication} {...mockHandlers} />
      );
      
      expect(screen.getByText(/2024년 1월 15일/)).toBeInTheDocument();
    });
  });
  
  describe('인터랙션', () => {
    it('카드 클릭 시 onClick 핸들러 호출', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JobCard application={mockApplication} {...mockHandlers} />
      );
      
      await user.click(screen.getByRole('button', { name: /테스트 회사/i }));
      
      expect(mockHandlers.onClick).toHaveBeenCalledWith(1);
    });
    
    it('수정 버튼 클릭 시 onEdit 핸들러 호출', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JobCard application={mockApplication} {...mockHandlers} />
      );
      
      await user.click(screen.getByRole('button', { name: /수정/i }));
      
      expect(mockHandlers.onEdit).toHaveBeenCalledWith(1);
      expect(mockHandlers.onClick).not.toHaveBeenCalled(); // 이벤트 전파 중단
    });
    
    it('삭제 버튼 클릭 시 확인 모달 표시', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JobCard application={mockApplication} {...mockHandlers} />
      );
      
      await user.click(screen.getByRole('button', { name: /삭제/i }));
      
      expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
    });
    
    it('삭제 확인 시 onDelete 핸들러 호출', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JobCard application={mockApplication} {...mockHandlers} />
      );
      
      await user.click(screen.getByRole('button', { name: /삭제/i }));
      await user.click(screen.getByRole('button', { name: /확인/i }));
      
      expect(mockHandlers.onDelete).toHaveBeenCalledWith(1);
    });
  });
  
  describe('로딩 상태', () => {
    it('isLoading=true일 때 스켈레톤 표시', () => {
      renderWithProviders(
        <JobCard 
          application={mockApplication} 
          {...mockHandlers} 
          isLoading={true}
        />
      );
      
      expect(screen.getByTestId('job-card-skeleton')).toBeInTheDocument();
      expect(screen.queryByText('테스트 회사')).not.toBeInTheDocument();
    });
  });
});
```

### 2. Hook 테스트

```typescript
/**
 * Custom Hook 테스트
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useJobApplications, useCreateApplication } from './useJobApplications';

// MSW 서버 설정
const server = setupServer(
  http.get('/api/v1/applications', () => {
    return HttpResponse.json({
      success: true,
      data: {
        content: [
          { id: 1, company: { name: '회사A' }, position: '백엔드' },
          { id: 2, company: { name: '회사B' }, position: '프론트' },
        ],
        totalElements: 2,
      },
    });
  }),
  
  http.post('/api/v1/applications', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: 3, ...body, status: 'APPLIED' },
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 테스트용 래퍼
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useJobApplications', () => {
  it('지원서 목록을 조회한다', async () => {
    const { result } = renderHook(() => useJobApplications(), {
      wrapper: createWrapper(),
    });
    
    // 초기 로딩 상태
    expect(result.current.isLoading).toBe(true);
    
    // 데이터 로드 완료
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data?.content).toHaveLength(2);
    expect(result.current.data?.content[0].company.name).toBe('회사A');
  });
  
  it('에러 발생 시 에러 상태 반환', async () => {
    server.use(
      http.get('/api/v1/applications', () => {
        return HttpResponse.json(
          { success: false, error: 'SERVER_ERROR' },
          { status: 500 }
        );
      })
    );
    
    const { result } = renderHook(() => useJobApplications(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useCreateApplication', () => {
  it('지원서를 생성하고 목록을 갱신한다', async () => {
    const { result } = renderHook(() => useCreateApplication(), {
      wrapper: createWrapper(),
    });
    
    // Mutation 실행
    result.current.mutate({
      companyId: 1,
      position: '풀스택 개발자',
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data?.id).toBe(3);
    expect(result.current.data?.position).toBe('풀스택 개발자');
  });
});
```

### 3. 통합 테스트 (페이지 레벨)

```typescript
/**
 * 페이지 통합 테스트
 */
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ApplicationsPage } from './ApplicationsPage';

describe('ApplicationsPage 통합 테스트', () => {
  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={['/applications']}>
        <Routes>
          <Route path="/applications" element={<ApplicationsPage />} />
        </Routes>
      </MemoryRouter>
    );
  };
  
  describe('목록 표시', () => {
    it('지원서 목록을 로드하여 표시한다', async () => {
      renderPage();
      
      // 로딩 표시
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
      
      // 데이터 표시
      await waitFor(() => {
        expect(screen.getByText('회사A')).toBeInTheDocument();
        expect(screen.getByText('회사B')).toBeInTheDocument();
      });
    });
    
    it('빈 목록일 때 안내 메시지 표시', async () => {
      server.use(
        http.get('/api/v1/applications', () => {
          return HttpResponse.json({
            success: true,
            data: { content: [], totalElements: 0 },
          });
        })
      );
      
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('등록된 지원서가 없습니다')).toBeInTheDocument();
      });
    });
  });
  
  describe('지원서 생성', () => {
    it('생성 폼 입력 후 제출하면 목록에 추가된다', async () => {
      const user = userEvent.setup();
      renderPage();
      
      // 목록 로드 대기
      await waitFor(() => {
        expect(screen.getByText('회사A')).toBeInTheDocument();
      });
      
      // 생성 버튼 클릭
      await user.click(screen.getByRole('button', { name: /새 지원서/i }));
      
      // 폼 입력
      const modal = screen.getByRole('dialog');
      await user.type(within(modal).getByLabelText('회사'), '새회사');
      await user.type(within(modal).getByLabelText('포지션'), '개발자');
      
      // 제출
      await user.click(within(modal).getByRole('button', { name: /저장/i }));
      
      // 목록 갱신 확인
      await waitFor(() => {
        expect(screen.getByText('새회사')).toBeInTheDocument();
      });
    });
  });
  
  describe('필터링', () => {
    it('상태 필터 변경 시 목록이 갱신된다', async () => {
      const user = userEvent.setup();
      renderPage();
      
      await waitFor(() => {
        expect(screen.getByText('회사A')).toBeInTheDocument();
      });
      
      // 필터 변경
      await user.click(screen.getByRole('combobox', { name: /상태/i }));
      await user.click(screen.getByRole('option', { name: /면접 예정/i }));
      
      // 필터된 결과 확인
      await waitFor(() => {
        expect(screen.queryByText('회사A')).not.toBeInTheDocument();
      });
    });
  });
});
```

---

## 🛠️ 테스트 유틸리티

### Test Fixtures Factory

```java
/**
 * 테스트 데이터 팩토리
 */
public class TestFixtures {
    
    private static final AtomicLong ID_GENERATOR = new AtomicLong(1);
    
    public static Company company() {
        return Company.builder()
                .id(ID_GENERATOR.getAndIncrement())
                .name("테스트 회사")
                .industry("IT")
                .build();
    }
    
    public static Company company(String name) {
        return Company.builder()
                .id(ID_GENERATOR.getAndIncrement())
                .name(name)
                .industry("IT")
                .build();
    }
    
    public static JobApplication application() {
        return JobApplication.builder()
                .id(ID_GENERATOR.getAndIncrement())
                .userId(1L)
                .company(company())
                .position("백엔드 개발자")
                .status(ApplicationStatus.APPLIED)
                .appliedAt(LocalDateTime.now())
                .build();
    }
    
    public static JobApplication application(Long userId, ApplicationStatus status) {
        return JobApplication.builder()
                .id(ID_GENERATOR.getAndIncrement())
                .userId(userId)
                .company(company())
                .position("백엔드 개발자")
                .status(status)
                .appliedAt(LocalDateTime.now())
                .build();
    }
    
    public static JobApplicationCreateRequest createRequest() {
        return JobApplicationCreateRequest.builder()
                .companyId(1L)
                .position("백엔드 개발자")
                .build();
    }
}
```

### TypeScript Test Utils

```typescript
/**
 * 테스트 유틸리티
 */
export const testUtils = {
  // Mock 응답 생성
  createApiResponse: <T>(data: T, success = true) => ({
    success,
    data,
    error: success ? null : 'ERROR',
  }),
  
  // Mock 페이지 응답
  createPageResponse: <T>(content: T[], page = 0, size = 10) => ({
    content,
    totalElements: content.length,
    totalPages: Math.ceil(content.length / size),
    number: page,
    size,
    first: page === 0,
    last: content.length < size,
  }),
  
  // 지연 실행 (비동기 테스트용)
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 테스트용 지원서 데이터
  createApplication: (overrides = {}) => ({
    id: 1,
    company: { id: 1, name: '테스트 회사' },
    position: '백엔드 개발자',
    status: 'APPLIED',
    appliedAt: new Date().toISOString(),
    ...overrides,
  }),
};
```

---

## 📋 테스트 체크리스트

### PR 제출 전 필수 확인

```bash
# Backend
./gradlew test                    # 모든 테스트 실행
./gradlew jacocoTestReport        # 커버리지 리포트 생성
./gradlew sonarqube               # 정적 분석 (선택)

# Frontend
npm test                          # 모든 테스트 실행
npm run test:coverage             # 커버리지 리포트
npm run test:e2e                  # E2E 테스트 (선택)
```

### 테스트 작성 체크리스트
- [ ] Happy Path 테스트 존재
- [ ] 주요 에러 케이스 테스트 존재
- [ ] 경계값 테스트 (Edge Case)
- [ ] 테스트 격리 (다른 테스트에 영향 없음)
- [ ] 테스트 이름이 명확함 (한글 권장)
- [ ] Given-When-Then 패턴 준수
- [ ] Mock 적절히 사용 (과도한 Mock 지양)
- [ ] 비동기 코드 적절히 처리 (waitFor 등)
