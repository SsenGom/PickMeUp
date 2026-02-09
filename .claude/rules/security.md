# 🔒 PickMeUp 보안 가이드

> **원칙**: 보안은 사후 조치가 아닌 설계 단계부터 고려해야 한다 (Security by Design)

---

## 🚨 CRITICAL: 절대 금지 사항

### 하드코딩 금지 목록
```java
// ❌ 절대 금지 - 즉시 Reject
private static final String JWT_SECRET = "my-secret-key-12345";
private static final String DB_PASSWORD = "password123";
private String apiKey = "sk-xxx...";
private String oauthClientSecret = "GOCSPX-xxx...";

// ✅ 올바른 방법
@Value("${jwt.secret}")
private String jwtSecret;

@Value("${spring.datasource.password}")
private String dbPassword;
```

### .gitignore 필수 포함
```gitignore
# 환경 설정
application-local.yml
application-prod.yml
.env
.env.*

# IDE 설정
.idea/
*.iml

# 키/인증서
*.pem
*.key
*.p12
```

---

## 🔐 인증/인가 (Authentication & Authorization)

### JWT 토큰 설계
```java
/**
 * JWT 토큰 제공자
 * 
 * 보안 요구사항:
 * - Access Token: 30분 만료
 * - Refresh Token: 7일 만료, HttpOnly Cookie
 * - 알고리즘: HS512 (최소 256비트 키)
 */
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    @Value("${jwt.access-token-validity}")
    private long accessTokenValidity; // 30 * 60 * 1000 (30분)
    
    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenValidity; // 7 * 24 * 60 * 60 * 1000 (7일)
    
    private Key key;
    
    @PostConstruct
    protected void init() {
        // Base64 디코딩 후 키 생성
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }
    
    /**
     * Access Token 생성
     */
    public String createAccessToken(Long userId, String email, Set<String> roles) {
        Claims claims = Jwts.claims().setSubject(String.valueOf(userId));
        claims.put("email", email);
        claims.put("roles", roles);
        claims.put("type", "ACCESS");
        
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidity);
        
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }
    
    /**
     * Refresh Token 생성 (Payload 최소화)
     */
    public String createRefreshToken(Long userId) {
        Claims claims = Jwts.claims().setSubject(String.valueOf(userId));
        claims.put("type", "REFRESH");
        
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidity);
        
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }
    
    /**
     * 토큰 검증
     * 
     * @throws ExpiredJwtException 토큰 만료
     * @throws JwtException 유효하지 않은 토큰
     */
    public Claims validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
```

### 권한 체크 패턴
```java
/**
 * Security Config
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint jwtAuthEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                // CSRF: REST API이므로 비활성화 (토큰 기반 인증 사용)
                .csrf(csrf -> csrf.disable())
                
                // Session: Stateless
                .sessionManagement(session -> 
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // CORS 설정
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // 예외 처리
                .exceptionHandling(exception -> exception
                    .authenticationEntryPoint(jwtAuthEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler))
                
                // 엔드포인트 권한 설정
                .authorizeHttpRequests(auth -> auth
                    // Public 엔드포인트
                    .requestMatchers("/api/v1/auth/**").permitAll()
                    .requestMatchers("/api/v1/public/**").permitAll()
                    .requestMatchers("/actuator/health").permitAll()
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                    
                    // Admin 전용
                    .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                    
                    // 인증 필요
                    .anyRequest().authenticated()
                )
                
                // JWT 필터 추가
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                
                .build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // ❌ 절대 금지: configuration.addAllowedOrigin("*");
        // ✅ 명시적 Origin 지정
        configuration.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "https://pickmeup.com"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}

/**
 * 리소스 소유권 검증 (Method Security)
 */
@Service
@RequiredArgsConstructor
public class JobApplicationService {
    
    private final JobApplicationRepository repository;
    
    /**
     * 본인 지원서만 조회 가능
     */
    @PreAuthorize("@securityService.isOwner(#id, authentication.principal.id)")
    public JobApplicationResponse findById(Long id) {
        return repository.findById(id)
                .map(JobApplicationResponse::from)
                .orElseThrow(() -> new ApplicationNotFoundException(id));
    }
    
    /**
     * 본인 지원서만 삭제 가능
     */
    @PreAuthorize("@securityService.isOwner(#id, authentication.principal.id)")
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ApplicationNotFoundException(id);
        }
        repository.deleteById(id);
    }
}

/**
 * 보안 서비스 (SpEL에서 사용)
 */
@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {
    
    private final JobApplicationRepository applicationRepository;
    
    public boolean isOwner(Long resourceId, Long userId) {
        return applicationRepository.findById(resourceId)
                .map(app -> app.getUserId().equals(userId))
                .orElse(false);
    }
}
```

---

## 🛡️ 입력 검증 (Input Validation)

### Bean Validation 규칙
```java
/**
 * 요청 DTO 검증
 * 
 * 검증 순서:
 * 1. @NotNull, @NotBlank - 필수값
 * 2. @Size, @Min, @Max - 길이/범위
 * 3. @Pattern - 형식
 * 4. @Valid - 중첩 객체
 * 5. 커스텀 검증 - 비즈니스 규칙
 */
@Getter
public class UserRegistrationRequest {
    
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다")
    private String email;
    
    @NotBlank(message = "비밀번호는 필수입니다")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,20}$",
        message = "비밀번호는 8-20자, 대소문자/숫자/특수문자를 포함해야 합니다"
    )
    private String password;
    
    @NotBlank(message = "이름은 필수입니다")
    @Size(min = 2, max = 50, message = "이름은 2-50자 사이여야 합니다")
    @Pattern(regexp = "^[가-힣a-zA-Z\\s]+$", message = "이름에 특수문자를 사용할 수 없습니다")
    private String name;
    
    @Pattern(regexp = "^01[016789]-?\\d{3,4}-?\\d{4}$", message = "올바른 휴대폰 번호 형식이 아닙니다")
    private String phone;
}
```

### SQL Injection 방지
```java
/**
 * ❌ 취약한 코드 - SQL Injection 가능
 */
public List<User> findByNameUnsafe(String name) {
    String sql = "SELECT * FROM users WHERE name = '" + name + "'";
    return jdbcTemplate.query(sql, userRowMapper);
}

/**
 * ✅ 안전한 코드 - PreparedStatement
 */
public List<User> findByNameSafe(String name) {
    String sql = "SELECT * FROM users WHERE name = ?";
    return jdbcTemplate.query(sql, userRowMapper, name);
}

/**
 * ✅ 안전한 코드 - JPA Named Parameter
 */
@Query("SELECT u FROM User u WHERE u.name = :name")
List<User> findByName(@Param("name") String name);

/**
 * ✅ 안전한 코드 - QueryDSL
 */
public List<User> findByName(String name) {
    return queryFactory
            .selectFrom(user)
            .where(user.name.eq(name))  // 파라미터 바인딩 자동 처리
            .fetch();
}
```

### XSS 방지
```java
/**
 * HTML Sanitizer 설정
 */
@Configuration
public class SanitizerConfig {
    
    @Bean
    public PolicyFactory htmlSanitizer() {
        return Sanitizers.FORMATTING
                .and(Sanitizers.LINKS)
                .and(Sanitizers.BLOCKS);
    }
}

/**
 * 사용자 입력 정제
 */
@Service
@RequiredArgsConstructor
public class ContentService {
    
    private final PolicyFactory htmlSanitizer;
    
    public String sanitize(String input) {
        if (input == null) return null;
        return htmlSanitizer.sanitize(input);
    }
}

/**
 * 프론트엔드 (React)
 */
// ❌ 취약 - XSS 가능
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ 안전 - DOMPurify 사용
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// ✅ 가장 안전 - 텍스트로만 렌더링
<div>{userContent}</div>
```

---

## 📁 파일 업로드 보안

### 업로드 제한 규칙
```java
/**
 * 파일 업로드 설정
 */
@Configuration
public class FileUploadConfig {
    
    // 허용 확장자 (Whitelist 방식)
    public static final Set<String> ALLOWED_EXTENSIONS = Set.of(
        "pdf", "doc", "docx", "jpg", "jpeg", "png"
    );
    
    // 허용 MIME 타입
    public static final Set<String> ALLOWED_MIME_TYPES = Set.of(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png"
    );
    
    // 최대 파일 크기
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    // 최대 요청 크기
    public static final long MAX_REQUEST_SIZE = 50 * 1024 * 1024; // 50MB
}

/**
 * 파일 검증 서비스
 */
@Service
@Slf4j
public class FileValidationService {
    
    /**
     * 파일 검증
     * 
     * @throws InvalidFileException 유효하지 않은 파일
     */
    public void validate(MultipartFile file) {
        // 1. 빈 파일 체크
        if (file.isEmpty()) {
            throw new InvalidFileException("파일이 비어있습니다");
        }
        
        // 2. 파일 크기 체크
        if (file.getSize() > FileUploadConfig.MAX_FILE_SIZE) {
            throw new InvalidFileException("파일 크기가 10MB를 초과합니다");
        }
        
        // 3. 확장자 체크 (Whitelist)
        String extension = getExtension(file.getOriginalFilename());
        if (!FileUploadConfig.ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new InvalidFileException("허용되지 않는 파일 형식입니다: " + extension);
        }
        
        // 4. MIME 타입 체크 (Content-Type 변조 방지)
        String mimeType = file.getContentType();
        if (!FileUploadConfig.ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new InvalidFileException("허용되지 않는 MIME 타입입니다: " + mimeType);
        }
        
        // 5. 실제 파일 시그니처 검증 (Magic Number)
        if (!isValidFileSignature(file)) {
            throw new InvalidFileException("파일 내용이 확장자와 일치하지 않습니다");
        }
        
        // 6. 파일명 검증 (Path Traversal 방지)
        String filename = file.getOriginalFilename();
        if (filename != null && (filename.contains("..") || filename.contains("/"))) {
            throw new InvalidFileException("유효하지 않은 파일명입니다");
        }
    }
    
    private boolean isValidFileSignature(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            String extension = getExtension(file.getOriginalFilename()).toLowerCase();
            
            return switch (extension) {
                case "pdf" -> bytes.length > 4 && 
                              bytes[0] == 0x25 && bytes[1] == 0x50 && 
                              bytes[2] == 0x44 && bytes[3] == 0x46; // %PDF
                case "jpg", "jpeg" -> bytes.length > 2 && 
                                     (bytes[0] & 0xFF) == 0xFF && 
                                     (bytes[1] & 0xFF) == 0xD8;
                case "png" -> bytes.length > 4 && 
                             (bytes[0] & 0xFF) == 0x89 && bytes[1] == 0x50 && 
                             bytes[2] == 0x4E && bytes[3] == 0x47;
                default -> true;
            };
        } catch (IOException e) {
            log.error("파일 시그니처 검증 실패", e);
            return false;
        }
    }
    
    private String getExtension(String filename) {
        if (filename == null) return "";
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }
}

/**
 * 안전한 파일 저장
 */
@Service
@RequiredArgsConstructor
public class FileStorageService {
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    /**
     * 파일 저장
     * 
     * @return 저장된 파일 경로 (상대 경로)
     */
    public String store(MultipartFile file, Long userId) {
        // 1. UUID로 파일명 변경 (원본 파일명 노출 방지)
        String extension = getExtension(file.getOriginalFilename());
        String newFilename = UUID.randomUUID() + "." + extension;
        
        // 2. 사용자별 디렉토리 생성
        Path userDir = Paths.get(uploadDir, String.valueOf(userId));
        try {
            Files.createDirectories(userDir);
        } catch (IOException e) {
            throw new FileStorageException("디렉토리 생성 실패", e);
        }
        
        // 3. 파일 저장
        Path targetPath = userDir.resolve(newFilename);
        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new FileStorageException("파일 저장 실패", e);
        }
        
        // 4. 상대 경로 반환
        return userId + "/" + newFilename;
    }
}
```

---

## 🔑 민감 데이터 보호

### 환경변수 관리
```yaml
# application.yml (공통 설정만)
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

jwt:
  secret: ${JWT_SECRET}
  access-token-validity: ${JWT_ACCESS_VALIDITY:1800000}
  refresh-token-validity: ${JWT_REFRESH_VALIDITY:604800000}

openai:
  api-key: ${OPENAI_API_KEY}
```

```bash
# .env.example (Git에 포함)
DB_URL=jdbc:mysql://localhost:3306/pickmeup
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=
JWT_ACCESS_VALIDITY=1800000
JWT_REFRESH_VALIDITY=604800000

OPENAI_API_KEY=
```

### 로깅 보안
```java
/**
 * 민감정보 마스킹 로깅
 */
@Slf4j
public class SecureLogger {
    
    private static final Set<String> SENSITIVE_FIELDS = Set.of(
        "password", "token", "secret", "apiKey", "cardNumber", "ssn"
    );
    
    /**
     * 민감정보 마스킹
     */
    public static String mask(String fieldName, String value) {
        if (value == null) return null;
        if (SENSITIVE_FIELDS.contains(fieldName.toLowerCase())) {
            return "****" + value.substring(Math.max(0, value.length() - 4));
        }
        return value;
    }
    
    /**
     * 이메일 마스킹
     */
    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String local = parts[0];
        String masked = local.length() > 3 
            ? local.substring(0, 3) + "***" 
            : "***";
        return masked + "@" + parts[1];
    }
}

// 사용 예시
log.info("사용자 로그인: email={}", SecureLogger.maskEmail(email));
// 출력: 사용자 로그인: email=use***@gmail.com

// ❌ 금지
log.info("토큰 생성: token={}", token);
log.info("DB 연결: password={}", password);
```

### 비밀번호 보안
```java
/**
 * 비밀번호 인코더 설정
 */
@Configuration
public class PasswordConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt (기본 강도 10)
        // - 강도 10: ~100ms
        // - 강도 12: ~400ms (권장)
        return new BCryptPasswordEncoder(12);
    }
}

/**
 * 비밀번호 정책 검증
 */
@Component
public class PasswordPolicy {
    
    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 20;
    private static final Pattern PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$"
    );
    
    public void validate(String password) {
        List<String> errors = new ArrayList<>();
        
        if (password.length() < MIN_LENGTH) {
            errors.add("비밀번호는 최소 " + MIN_LENGTH + "자 이상이어야 합니다");
        }
        if (password.length() > MAX_LENGTH) {
            errors.add("비밀번호는 최대 " + MAX_LENGTH + "자까지 가능합니다");
        }
        if (!PATTERN.matcher(password).matches()) {
            errors.add("비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다");
        }
        
        if (!errors.isEmpty()) {
            throw new InvalidPasswordException(errors);
        }
    }
}
```

---

## 🌐 API 보안

### Rate Limiting
```java
/**
 * Redis 기반 Rate Limiter
 */
@Component
@RequiredArgsConstructor
public class RateLimiter {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    /**
     * API 호출 제한 검사
     * 
     * @param key 식별 키 (IP 또는 사용자 ID)
     * @param limit 제한 횟수
     * @param windowSeconds 시간 윈도우 (초)
     * @return 허용 여부
     */
    public boolean isAllowed(String key, int limit, int windowSeconds) {
        String redisKey = "rate_limit:" + key;
        
        Long count = redisTemplate.opsForValue().increment(redisKey);
        
        if (count != null && count == 1) {
            redisTemplate.expire(redisKey, windowSeconds, TimeUnit.SECONDS);
        }
        
        return count != null && count <= limit;
    }
}

/**
 * Rate Limit 인터셉터
 */
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {
    
    private final RateLimiter rateLimiter;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String clientIp = getClientIp(request);
        
        // IP 기반: 분당 100회 제한
        if (!rateLimiter.isAllowed("ip:" + clientIp, 100, 60)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            return false;
        }
        
        // 인증된 사용자: 분당 300회 제한
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String userId = auth.getName();
            if (!rateLimiter.isAllowed("user:" + userId, 300, 60)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                return false;
            }
        }
        
        return true;
    }
    
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
```

### WebSocket 보안
```java
/**
 * WebSocket 보안 설정
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
                
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    
                    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                        throw new AuthenticationException("인증 토큰이 필요합니다");
                    }
                    
                    String token = authHeader.substring(7);
                    Claims claims = jwtTokenProvider.validateToken(token);
                    
                    // Principal 설정
                    accessor.setUser(new StompPrincipal(claims.getSubject()));
                }
                
                return message;
            }
        });
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        
        // 사용자별 큐 (다른 사용자 메시지 접근 불가)
        registry.setUserDestinationPrefix("/user");
    }
}
```

---

## 📋 보안 체크리스트

### 코드 리뷰 시 필수 확인
- [ ] 하드코딩된 시크릿 없음
- [ ] SQL 쿼리 파라미터 바인딩 사용
- [ ] 사용자 입력 검증 (@Valid)
- [ ] 파일 업로드 검증 (확장자, MIME, 크기)
- [ ] 권한 체크 존재 (@PreAuthorize)
- [ ] 민감정보 로깅 안 함
- [ ] HTTPS 강제 (프로덕션)
- [ ] CORS 설정 명시적 Origin

### 배포 전 보안 점검
- [ ] 환경변수 설정 완료
- [ ] 디버그 모드 비활성화
- [ ] 에러 메시지 상세 정보 숨김
- [ ] 보안 헤더 설정 (X-Frame-Options, CSP 등)
- [ ] 의존성 취약점 스캔 (Snyk, OWASP Dependency-Check)
