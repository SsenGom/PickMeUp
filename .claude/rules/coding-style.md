# 🏗️ PickMeUp 코딩 스타일 가이드

> **원칙**: 읽기 쉬운 코드가 좋은 코드다. 6개월 후의 내가 이해할 수 있어야 한다.

---

## 📐 아키텍처 원칙

### Clean Architecture 계층 구조
```
┌─────────────────────────────────────────────────────┐
│                    Presentation                      │
│    Controller / DTO / Exception Handler             │
├─────────────────────────────────────────────────────┤
│                    Application                       │
│           Service / UseCase / Facade                │
├─────────────────────────────────────────────────────┤
│                      Domain                          │
│        Entity / Repository Interface / Event        │
├─────────────────────────────────────────────────────┤
│                   Infrastructure                     │
│      Repository Impl / External API / Config        │
└─────────────────────────────────────────────────────┘
```

### 의존성 규칙
- **상위 계층 → 하위 계층 의존 금지**
- Domain 계층은 외부 의존성 없음 (순수 Java)
- Infrastructure는 Domain의 인터페이스 구현

---

## ☕ Backend (Spring Boot 3 / Java 17+)

### 패키지 구조
```
com.pickmeup/
├── global/
│   ├── config/           # 설정 클래스
│   ├── error/            # 전역 예외 처리
│   │   ├── ErrorCode.java
│   │   ├── ErrorResponse.java
│   │   └── GlobalExceptionHandler.java
│   ├── security/         # 인증/인가
│   └── util/             # 공통 유틸리티
│
├── domain/
│   └── [도메인명]/
│       ├── controller/
│       │   └── [Domain]Controller.java
│       ├── service/
│       │   ├── [Domain]Service.java
│       │   └── [Domain]QueryService.java  # 조회 전용
│       ├── repository/
│       │   ├── [Domain]Repository.java    # JPA
│       │   └── [Domain]QueryRepository.java  # QueryDSL
│       ├── entity/
│       │   └── [Domain].java
│       ├── dto/
│       │   ├── request/
│       │   └── response/
│       └── exception/
│           └── [Domain]Exception.java
│
└── infra/
    ├── redis/
    ├── mongodb/
    └── external/         # 외부 API 연동
```

### Controller 규칙
```java
/**
 * 취업 지원서 관리 API
 * 
 * @author PickMeUp Team
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "JobApplication", description = "취업 지원서 API")
public class JobApplicationController {
    
    private final JobApplicationService applicationService;
    private final JobApplicationQueryService queryService;
    
    /**
     * 지원서 생성
     * 
     * @param request 지원서 생성 요청
     * @return 생성된 지원서 정보
     */
    @PostMapping
    @Operation(summary = "지원서 생성", description = "새로운 취업 지원서를 생성합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    public ResponseEntity<ApiResult<JobApplicationResponse>> create(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody JobApplicationCreateRequest request
    ) {
        JobApplicationResponse response = applicationService.create(user.getId(), request);
        return ResponseEntity.ok(ApiResult.success(response));
    }
    
    /**
     * 지원서 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<ApiResult<Page<JobApplicationResponse>>> getList(
            @AuthenticationPrincipal UserPrincipal user,
            @ParameterObject Pageable pageable
    ) {
        Page<JobApplicationResponse> response = queryService.findByUserId(user.getId(), pageable);
        return ResponseEntity.ok(ApiResult.success(response));
    }
}
```

### Service 규칙
```java
/**
 * 취업 지원서 비즈니스 로직
 * 
 * 주요 책임:
 * - 지원서 CRUD
 * - 상태 변경 로직
 * - 도메인 이벤트 발행
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class JobApplicationService {
    
    private final JobApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationEventPublisher eventPublisher;
    
    /**
     * 지원서 생성
     * 
     * @param userId 사용자 ID
     * @param request 생성 요청 DTO
     * @return 생성된 지원서 응답 DTO
     * @throws DuplicateApplicationException 동일 회사에 중복 지원 시
     */
    @Transactional
    public JobApplicationResponse create(Long userId, JobApplicationCreateRequest request) {
        // 1. 중복 검증
        validateDuplicateApplication(userId, request.getCompanyId());
        
        // 2. 회사 조회
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new CompanyNotFoundException(request.getCompanyId()));
        
        // 3. 엔티티 생성
        JobApplication application = JobApplication.builder()
                .userId(userId)
                .company(company)
                .position(request.getPosition())
                .status(ApplicationStatus.APPLIED)
                .appliedAt(LocalDateTime.now())
                .build();
        
        // 4. 저장
        JobApplication saved = applicationRepository.save(application);
        
        // 5. 이벤트 발행
        eventPublisher.publishEvent(new ApplicationCreatedEvent(saved));
        
        log.info("지원서 생성 완료: userId={}, applicationId={}", userId, saved.getId());
        
        return JobApplicationResponse.from(saved);
    }
    
    private void validateDuplicateApplication(Long userId, Long companyId) {
        if (applicationRepository.existsByUserIdAndCompanyId(userId, companyId)) {
            throw new DuplicateApplicationException(userId, companyId);
        }
    }
}
```

### Entity 규칙
```java
/**
 * 취업 지원서 엔티티
 * 
 * 불변성 원칙:
 * - Setter 사용 금지 (비즈니스 메서드로 상태 변경)
 * - 생성자는 Builder 패턴 사용
 */
@Entity
@Table(
    name = "job_applications",
    indexes = {
        @Index(name = "idx_application_user_id", columnList = "user_id"),
        @Index(name = "idx_application_status", columnList = "status"),
        @Index(name = "idx_application_applied_at", columnList = "applied_at")
    },
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_user_company",
            columnNames = {"user_id", "company_id"}
        )
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobApplication extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
    
    @Column(nullable = false, length = 100)
    private String position;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;
    
    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;
    
    @Column(length = 1000)
    private String memo;
    
    @Builder
    private JobApplication(Long userId, Company company, String position,
                          ApplicationStatus status, LocalDateTime appliedAt) {
        this.userId = userId;
        this.company = company;
        this.position = position;
        this.status = status;
        this.appliedAt = appliedAt;
    }
    
    // ============ 비즈니스 메서드 ============
    
    /**
     * 지원 상태 변경
     * 
     * @param newStatus 새로운 상태
     * @throws InvalidStatusTransitionException 유효하지 않은 상태 전이 시
     */
    public void changeStatus(ApplicationStatus newStatus) {
        validateStatusTransition(newStatus);
        this.status = newStatus;
    }
    
    /**
     * 메모 수정
     */
    public void updateMemo(String memo) {
        this.memo = memo;
    }
    
    private void validateStatusTransition(ApplicationStatus newStatus) {
        if (!this.status.canTransitionTo(newStatus)) {
            throw new InvalidStatusTransitionException(this.status, newStatus);
        }
    }
}
```

### DTO 규칙
```java
/**
 * 지원서 생성 요청 DTO
 * 
 * 검증 규칙:
 * - 필수값: @NotNull, @NotBlank
 * - 길이 제한: @Size
 * - 커스텀 검증: @ValidEnum
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Schema(description = "지원서 생성 요청")
public class JobApplicationCreateRequest {
    
    @NotNull(message = "회사 ID는 필수입니다")
    @Schema(description = "회사 ID", example = "1")
    private Long companyId;
    
    @NotBlank(message = "포지션은 필수입니다")
    @Size(min = 2, max = 100, message = "포지션은 2-100자 사이여야 합니다")
    @Schema(description = "지원 포지션", example = "백엔드 개발자")
    private String position;
    
    @Size(max = 1000, message = "메모는 1000자를 초과할 수 없습니다")
    @Schema(description = "메모", example = "1차 면접 준비 필요")
    private String memo;
    
    @Builder  // 테스트용
    private JobApplicationCreateRequest(Long companyId, String position, String memo) {
        this.companyId = companyId;
        this.position = position;
        this.memo = memo;
    }
}

/**
 * 지원서 응답 DTO
 */
@Getter
@Builder
@Schema(description = "지원서 응답")
public class JobApplicationResponse {
    
    @Schema(description = "지원서 ID")
    private final Long id;
    
    @Schema(description = "회사 정보")
    private final CompanySimpleResponse company;
    
    @Schema(description = "포지션")
    private final String position;
    
    @Schema(description = "상태")
    private final ApplicationStatus status;
    
    @Schema(description = "지원일시")
    private final LocalDateTime appliedAt;
    
    public static JobApplicationResponse from(JobApplication entity) {
        return JobApplicationResponse.builder()
                .id(entity.getId())
                .company(CompanySimpleResponse.from(entity.getCompany()))
                .position(entity.getPosition())
                .status(entity.getStatus())
                .appliedAt(entity.getAppliedAt())
                .build();
    }
}
```

### Repository 규칙
```java
/**
 * 지원서 Repository (JPA)
 */
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    
    /**
     * 사용자별 지원서 존재 여부 확인
     */
    boolean existsByUserIdAndCompanyId(Long userId, Long companyId);
    
    /**
     * 사용자별 지원서 목록 (페이징)
     */
    Page<JobApplication> findByUserIdOrderByAppliedAtDesc(Long userId, Pageable pageable);
    
    /**
     * 특정 상태의 지원서 수
     */
    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.userId = :userId AND a.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") ApplicationStatus status);
}

/**
 * 지원서 QueryDSL Repository (복잡한 동적 쿼리용)
 */
@Repository
@RequiredArgsConstructor
public class JobApplicationQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    /**
     * 다중 조건 검색
     */
    public Page<JobApplication> search(Long userId, ApplicationSearchCondition condition, Pageable pageable) {
        QJobApplication application = QJobApplication.jobApplication;
        QCompany company = QCompany.company;
        
        List<JobApplication> content = queryFactory
                .selectFrom(application)
                .leftJoin(application.company, company).fetchJoin()
                .where(
                    application.userId.eq(userId),
                    statusEq(condition.getStatus()),
                    companyNameContains(condition.getCompanyName()),
                    appliedAtBetween(condition.getStartDate(), condition.getEndDate())
                )
                .orderBy(application.appliedAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
        
        long total = queryFactory
                .selectFrom(application)
                .where(
                    application.userId.eq(userId),
                    statusEq(condition.getStatus()),
                    companyNameContains(condition.getCompanyName()),
                    appliedAtBetween(condition.getStartDate(), condition.getEndDate())
                )
                .fetchCount();
        
        return new PageImpl<>(content, pageable, total);
    }
    
    private BooleanExpression statusEq(ApplicationStatus status) {
        return status != null ? QJobApplication.jobApplication.status.eq(status) : null;
    }
    
    private BooleanExpression companyNameContains(String companyName) {
        return StringUtils.hasText(companyName) 
                ? QJobApplication.jobApplication.company.name.containsIgnoreCase(companyName) 
                : null;
    }
    
    private BooleanExpression appliedAtBetween(LocalDate start, LocalDate end) {
        if (start == null && end == null) return null;
        if (start == null) return QJobApplication.jobApplication.appliedAt.before(end.plusDays(1).atStartOfDay());
        if (end == null) return QJobApplication.jobApplication.appliedAt.goe(start.atStartOfDay());
        return QJobApplication.jobApplication.appliedAt.between(
                start.atStartOfDay(), 
                end.plusDays(1).atStartOfDay()
        );
    }
}
```

### 예외 처리 규칙
```java
/**
 * 에러 코드 정의
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    
    // Common
    INVALID_INPUT_VALUE(400, "C001", "잘못된 입력값입니다"),
    INTERNAL_SERVER_ERROR(500, "C002", "서버 내부 오류가 발생했습니다"),
    
    // Auth
    UNAUTHORIZED(401, "A001", "인증이 필요합니다"),
    ACCESS_DENIED(403, "A002", "접근 권한이 없습니다"),
    TOKEN_EXPIRED(401, "A003", "토큰이 만료되었습니다"),
    
    // Application
    APPLICATION_NOT_FOUND(404, "AP001", "지원서를 찾을 수 없습니다"),
    DUPLICATE_APPLICATION(409, "AP002", "이미 해당 회사에 지원하셨습니다"),
    INVALID_STATUS_TRANSITION(400, "AP003", "유효하지 않은 상태 변경입니다"),
    
    // Company
    COMPANY_NOT_FOUND(404, "CO001", "회사를 찾을 수 없습니다");
    
    private final int status;
    private final String code;
    private final String message;
}

/**
 * 비즈니스 예외 기본 클래스
 */
@Getter
public class BusinessException extends RuntimeException {
    
    private final ErrorCode errorCode;
    private final Map<String, Object> details;
    
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }
    
    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }
    
    public BusinessException addDetail(String key, Object value) {
        this.details.put(key, value);
        return this;
    }
}

/**
 * 전역 예외 핸들러
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResult<Void>> handleBusinessException(BusinessException e) {
        log.warn("Business exception: {}", e.getMessage());
        
        ErrorCode errorCode = e.getErrorCode();
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResult.error(errorCode.getCode(), e.getMessage(), e.getDetails()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResult<Void>> handleValidationException(MethodArgumentNotValidException e) {
        Map<String, String> errors = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value",
                        (a, b) -> a
                ));
        
        log.warn("Validation failed: {}", errors);
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResult.error("VALIDATION_ERROR", "입력값 검증 실패", errors));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResult<Void>> handleException(Exception e) {
        log.error("Unexpected error", e);
        
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResult.error("INTERNAL_ERROR", "서버 오류가 발생했습니다"));
    }
}
```

---

## ⚛️ Frontend (React 18 / TypeScript 5)

### 폴더 구조
```
frontend/src/
├── api/                    # API 호출 함수
│   ├── axios.ts           # Axios 인스턴스
│   └── [feature].api.ts
│
├── components/
│   ├── common/            # 공통 컴포넌트
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── index.ts
│   │
│   └── [feature]/         # 기능별 컴포넌트
│       ├── JobCard/
│       ├── JobList/
│       └── index.ts
│
├── hooks/                  # 커스텀 훅
│   ├── useAuth.ts
│   ├── useJobApplications.ts
│   └── index.ts
│
├── pages/                  # 페이지 컴포넌트
│   ├── Dashboard/
│   ├── Applications/
│   └── Settings/
│
├── stores/                 # Zustand 스토어
│   ├── authStore.ts
│   └── uiStore.ts
│
├── types/                  # TypeScript 타입
│   ├── api.types.ts
│   ├── auth.types.ts
│   └── application.types.ts
│
├── utils/                  # 유틸리티 함수
│   ├── format.ts
│   ├── validation.ts
│   └── storage.ts
│
└── constants/              # 상수
    ├── routes.ts
    └── messages.ts
```

### 컴포넌트 작성 규칙
```typescript
// ============ 타입 정의 ============

/**
 * 지원서 카드 Props
 */
interface JobCardProps {
  /** 지원서 데이터 */
  application: IJobApplication;
  /** 수정 버튼 클릭 핸들러 */
  onEdit: (id: number) => void;
  /** 삭제 버튼 클릭 핸들러 */
  onDelete: (id: number) => void;
  /** 카드 클릭 핸들러 */
  onClick?: (id: number) => void;
  /** 선택 상태 */
  isSelected?: boolean;
  /** 로딩 상태 */
  isLoading?: boolean;
}

// ============ 컴포넌트 ============

/**
 * 지원서 카드 컴포넌트
 * 
 * @example
 * ```tsx
 * <JobCard
 *   application={application}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export const JobCard: React.FC<JobCardProps> = ({
  application,
  onEdit,
  onDelete,
  onClick,
  isSelected = false,
  isLoading = false,
}) => {
  // 1. Hooks
  const navigate = useNavigate();
  const { formatDate } = useFormatter();
  
  // 2. State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // 3. Derived State / Memo
  const statusColor = useMemo(() => {
    return getStatusColor(application.status);
  }, [application.status]);
  
  // 4. Callbacks
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(application.id);
  }, [application.id, onEdit]);
  
  const handleDeleteConfirm = useCallback(() => {
    onDelete(application.id);
    setIsDeleteModalOpen(false);
  }, [application.id, onDelete]);
  
  // 5. Effects
  useEffect(() => {
    // 필요한 경우만 사용
  }, []);
  
  // 6. Early Returns
  if (isLoading) {
    return <JobCardSkeleton />;
  }
  
  // 7. Render
  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all cursor-pointer',
        'hover:shadow-md hover:border-primary-300',
        isSelected && 'border-primary-500 bg-primary-50'
      )}
      onClick={() => onClick?.(application.id)}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">
            {application.company.name}
          </h3>
          <p className="text-sm text-gray-600">
            {application.position}
          </p>
        </div>
        <StatusBadge status={application.status} color={statusColor} />
      </div>
      
      {/* Content */}
      <div className="mt-4 text-sm text-gray-500">
        <p>지원일: {formatDate(application.appliedAt)}</p>
      </div>
      
      {/* Actions */}
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          aria-label="수정"
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDeleteModalOpen(true)}
          aria-label="삭제"
        >
          <TrashIcon className="h-4 w-4 text-red-500" />
        </Button>
      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="지원서 삭제"
        message="정말 이 지원서를 삭제하시겠습니까?"
        confirmText="삭제"
        variant="danger"
      />
    </div>
  );
};

// Default Export 금지 - Named Export 사용
export { JobCard };
```

### API 호출 규칙
```typescript
// api/axios.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // 토큰 갱신 로직
      const refreshed = await refreshToken();
      if (refreshed && error.config) {
        return api.request(error.config);
      }
      // 갱신 실패 시 로그아웃
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };

// api/application.api.ts
import { api } from './axios';
import type { 
  IJobApplication, 
  IJobApplicationCreateRequest,
  IJobApplicationUpdateRequest,
  IPageResponse 
} from '@/types/application.types';

export const applicationApi = {
  /**
   * 지원서 목록 조회
   */
  getList: async (params?: { page?: number; size?: number; status?: string }) => {
    const response = await api.get<ApiResult<IPageResponse<IJobApplication>>>('/api/v1/applications', { params });
    return response.data.data;
  },
  
  /**
   * 지원서 상세 조회
   */
  getById: async (id: number) => {
    const response = await api.get<ApiResult<IJobApplication>>(`/api/v1/applications/${id}`);
    return response.data.data;
  },
  
  /**
   * 지원서 생성
   */
  create: async (data: IJobApplicationCreateRequest) => {
    const response = await api.post<ApiResult<IJobApplication>>('/api/v1/applications', data);
    return response.data.data;
  },
  
  /**
   * 지원서 수정
   */
  update: async (id: number, data: IJobApplicationUpdateRequest) => {
    const response = await api.put<ApiResult<IJobApplication>>(`/api/v1/applications/${id}`, data);
    return response.data.data;
  },
  
  /**
   * 지원서 삭제
   */
  delete: async (id: number) => {
    await api.delete(`/api/v1/applications/${id}`);
  },
};
```

### React Query 훅 규칙
```typescript
// hooks/useJobApplications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationApi } from '@/api/application.api';
import { toast } from '@/components/common/Toast';

// Query Keys 중앙 관리
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters: object) => [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: number) => [...applicationKeys.details(), id] as const,
};

/**
 * 지원서 목록 조회 훅
 */
export const useJobApplications = (params?: { page?: number; status?: string }) => {
  return useQuery({
    queryKey: applicationKeys.list(params ?? {}),
    queryFn: () => applicationApi.getList(params),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30,   // 30분 (v5부터 cacheTime → gcTime)
  });
};

/**
 * 지원서 상세 조회 훅
 */
export const useJobApplication = (id: number) => {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationApi.getById(id),
    enabled: id > 0,
  });
};

/**
 * 지원서 생성 훅
 */
export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: applicationApi.create,
    onSuccess: (data) => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      toast.success('지원서가 등록되었습니다.');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || '지원서 등록에 실패했습니다.');
    },
  });
};

/**
 * 지원서 수정 훅
 */
export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IJobApplicationUpdateRequest }) => 
      applicationApi.update(id, data),
    onSuccess: (data, variables) => {
      // 상세 쿼리 업데이트
      queryClient.setQueryData(applicationKeys.detail(variables.id), data);
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      toast.success('지원서가 수정되었습니다.');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || '지원서 수정에 실패했습니다.');
    },
  });
};

/**
 * 지원서 삭제 훅
 */
export const useDeleteApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: applicationApi.delete,
    onSuccess: (_, id) => {
      // 상세 쿼리 제거
      queryClient.removeQueries({ queryKey: applicationKeys.detail(id) });
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      toast.success('지원서가 삭제되었습니다.');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || '지원서 삭제에 실패했습니다.');
    },
  });
};
```

### Zustand 스토어 규칙
```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface IUser {
  id: number;
  email: string;
  name: string;
  profileImage?: string;
}

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth: (user: IUser, token: string) => void;
  updateUser: (user: Partial<IUser>) => void;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set) => ({
      ...initialState,
      
      setAuth: (user, token) => set((state) => {
        state.user = user;
        state.accessToken = token;
        state.isAuthenticated = true;
      }),
      
      updateUser: (userData) => set((state) => {
        if (state.user) {
          Object.assign(state.user, userData);
        }
      }),
      
      logout: () => set(() => initialState),
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);

// 선택자 (Selector) - 불필요한 리렌더링 방지
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
```

---

## 📏 코드 품질 기준

### 파일 크기 제한
| 파일 유형 | 최대 줄 수 | 초과 시 조치 |
|----------|-----------|------------|
| Controller | 200줄 | 기능별 분리 |
| Service | 300줄 | UseCase 패턴 도입 |
| Component | 200줄 | 하위 컴포넌트 분리 |
| Hook | 100줄 | 기능별 분리 |
| 단일 메서드/함수 | 50줄 | 헬퍼 함수 추출 |

### 복잡도 제한
- **Cyclomatic Complexity**: 메서드당 10 이하
- **Cognitive Complexity**: 메서드당 15 이하
- **중첩 깊이**: 최대 3단계

### 네이밍 규칙
| 대상 | 규칙 | 예시 |
|-----|------|-----|
| 클래스/컴포넌트 | PascalCase | `JobApplicationService`, `JobCard` |
| 메서드/함수 | camelCase, 동사 시작 | `createApplication()`, `handleClick()` |
| 변수 | camelCase | `applicationList`, `isLoading` |
| 상수 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_BASE_URL` |
| 타입/인터페이스 | PascalCase, I/T 접두사 | `IJobApplication`, `TStatus` |
| Enum | PascalCase | `ApplicationStatus.APPLIED` |
| 파일명 (Java) | PascalCase | `JobApplicationController.java` |
| 파일명 (TS) | PascalCase (컴포넌트), camelCase (그 외) | `JobCard.tsx`, `useAuth.ts` |

---

## 🚫 금지 사항

### Backend
- ❌ `@Autowired` 필드 주입 → ✅ 생성자 주입 (`@RequiredArgsConstructor`)
- ❌ `Optional.get()` 직접 호출 → ✅ `orElseThrow()` 사용
- ❌ `catch (Exception e)` 광범위 캐치 → ✅ 구체적 예외 처리
- ❌ Entity에 Setter 노출 → ✅ 비즈니스 메서드 사용
- ❌ N+1 쿼리 → ✅ Fetch Join, Batch Size 설정
- ❌ 하드코딩된 문자열/숫자 → ✅ 상수 또는 설정값 사용

### Frontend
- ❌ `any` 타입 → ✅ 구체적 타입 또는 `unknown`
- ❌ `var` 키워드 → ✅ `const` (기본), `let` (재할당 필요 시)
- ❌ `default export` → ✅ `named export`
- ❌ 인라인 스타일 → ✅ Tailwind CSS 클래스
- ❌ `useEffect` 내 직접 API 호출 → ✅ React Query 사용
- ❌ Props Drilling (3단계 이상) → ✅ Context 또는 Zustand
- ❌ `index`를 key로 사용 → ✅ 고유 ID 사용
