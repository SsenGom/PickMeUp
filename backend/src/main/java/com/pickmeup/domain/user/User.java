package com.pickmeup.domain.user;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * 사용자 Entity
 * 
 * Entity란?
 * - JPA에서 DB 테이블과 매핑되는 Java 클래스
 * - 이 클래스의 인스턴스 = DB의 한 행(Row)
 * - 필드 = DB 컬럼
 * 
 * 이 Entity는 'users' 테이블과 매핑:
 * +----+------------------+----------+------+-------+------+---------+
 * | id | email            | password | name | phone | role | is_active|
 * +----+------------------+----------+------+-------+------+---------+
 * | 1  | test@test.com    | $2a$... | 홍길동| 010... | USER | true    |
 * +----+------------------+----------+------+-------+------+---------+
 */
@Entity                 // JPA Entity임을 표시. 이 클래스는 DB 테이블과 매핑됨
@Table(name = "users")  // 매핑할 테이블 이름 (생략하면 클래스명 사용)
@Getter                 // Lombok: 모든 필드의 getter 메서드 자동 생성
@NoArgsConstructor(access = AccessLevel.PROTECTED)  
                        // Lombok: 기본 생성자 생성 (JPA 스펙상 필요)
                        // PROTECTED: 외부에서 new User() 방지 → Builder 사용 유도
@AllArgsConstructor     // Lombok: 모든 필드를 파라미터로 받는 생성자
@Builder                // Lombok: Builder 패턴 적용
                        // 사용법: User.builder().email("a@a.com").name("홍길동").build()
public class User extends BaseEntity {  // BaseEntity: createdAt, updatedAt 상속
    
    /**
     * Primary Key
     * 
     * @Id: 이 필드가 PK임을 표시
     * @GeneratedValue: 값 자동 생성
     *   - IDENTITY: MySQL의 AUTO_INCREMENT 사용
     *   - SEQUENCE: DB 시퀀스 사용 (Oracle, PostgreSQL)
     *   - TABLE: 별도 테이블로 시퀀스 관리
     *   - AUTO: DB에 맞게 자동 선택
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 이메일 (로그인 ID로 사용)
     * 
     * @Column 속성:
     * - nullable = false: NOT NULL 제약조건
     * - unique = true: UNIQUE 제약조건 (중복 불가)
     * - length = 100: VARCHAR(100)
     */
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    /**
     * 비밀번호 (BCrypt로 암호화된 값 저장)
     * 
     * 원본 비밀번호가 아닌 해시값 저장
     * 예: "1234" → "$2a$10$N9qo8uLOickgx2ZMRZoMy..."
     */
    @Column(nullable = false)
    private String password;
    
    /**
     * 사용자 이름
     */
    @Column(nullable = false, length = 50)
    private String name;
    
    /**
     * 전화번호 (선택)
     */
    @Column(length = 20)
    private String phone;
    
    /**
     * 프로필 이미지 URL (선택)
     */
    @Column(name = "profile_image_url", length = 500)  // name: 실제 컬럼명 지정
    private String profileImageUrl;
    
    /**
     * 사용자 역할 (권한)
     * 
     * @Enumerated: Enum 타입 저장 방식
     *   - EnumType.STRING: 문자열로 저장 ("USER", "ADMIN") - 권장
     *   - EnumType.ORDINAL: 숫자로 저장 (0, 1) - 비권장 (Enum 순서 바뀌면 꼬임)
     * 
     * @Builder.Default: Builder 사용 시 기본값 지정
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserRole role = UserRole.USER;
    
    /**
     * 카카오 연동 ID (소셜 로그인용)
     */
    @Column(name = "kakao_id")
    private String kakaoId;
    
    /**
     * 카카오 Access Token (카카오 API 호출용)
     */
    @Column(name = "kakao_access_token", length = 500)
    private String kakaoAccessToken;
    
    /**
     * 계정 활성화 여부
     * 
     * 탈퇴 시 false로 변경 (실제 삭제하지 않음 = Soft Delete)
     * Soft Delete 장점:
     * - 데이터 복구 가능
     * - 외래키 참조 문제 없음
     */
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    /**
     * 사용자 타입 (구직자 or 헤드헌터)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false)
    @Builder.Default
    private UserType userType = UserType.JOB_SEEKER;
    
    // ========== 헤드헌터 전용 필드 ==========
    
    /**
     * 회사명 (헤드헌터일 때만 사용)
     */
    @Column(name = "company_name", length = 100)
    private String companyName;
    
    /**
     * 직급/포지션 (헤드헌터일 때만 사용)
     */
    @Column(length = 100)
    private String position;
    
    /**
     * 부서 (헤드헌터일 때만 사용)
     */
    @Column(length = 100)
    private String department;
    
    /**
     * 회사 이메일 (헤드헌터일 때만 사용)
     */
    @Column(name = "business_email", length = 100)
    private String businessEmail;
    
    // ========== 비즈니스 메서드 ==========
    // Entity에 비즈니스 로직을 넣으면 객체지향적
    // Service에서 직접 setter 호출하는 것보다 의도가 명확함
    
    /**
     * 프로필 정보 수정
     * 
     * Setter를 열어두면 아무 데서나 수정 가능 → 위험
     * 이렇게 메서드로 만들면 의도가 명확하고 추적 쉬움
     */
    public void updateProfile(String name, String phone, String profileImageUrl) {
        this.name = name;
        this.phone = phone;
        this.profileImageUrl = profileImageUrl;
    }
    
    /**
     * 카카오 계정 연동
     */
    public void linkKakao(String kakaoId, String kakaoAccessToken) {
        this.kakaoId = kakaoId;
        this.kakaoAccessToken = kakaoAccessToken;
    }
    
    /**
     * 비밀번호 변경
     * 
     * @param encodedPassword BCrypt로 암호화된 비밀번호
     */
    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
    
    /**
     * 헤드헌터 정보 수정
     */
    public void updateRecruiterInfo(String companyName, String position, 
                                     String department, String businessEmail) {
        this.companyName = companyName;
        this.position = position;
        this.department = department;
        this.businessEmail = businessEmail;
    }
    
    /**
     * 헤드헌터 여부 확인
     */
    public boolean isRecruiter() {
        return UserType.RECRUITER.equals(this.userType);
    }
    
    /**
     * 구직자 여부 확인
     */
    public boolean isJobSeeker() {
        return UserType.JOB_SEEKER.equals(this.userType);
    }
}
