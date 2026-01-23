package com.pickmeup.repository;

import com.pickmeup.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * User Repository - 사용자 DB 접근
 * 
 * JpaRepository<User, Long>
 * - User: 대상 Entity
 * - Long: Primary Key 타입
 * 
 * 기본 제공 메서드 (상속):
 * - save(User): 저장 (INSERT/UPDATE)
 * - findById(Long): ID로 조회
 * - findAll(): 전체 조회
 * - delete(User): 삭제
 * - count(): 개수
 * - existsById(Long): 존재 여부
 * 
 * Query Method 규칙 (메서드명 → SQL 자동 생성):
 * - findBy + 필드명: WHERE 조건
 * - existsBy + 필드명: EXISTS 조건
 * - And, Or: 조건 조합
 * - OrderBy + 필드명 + Asc/Desc: 정렬
 */
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * 이메일로 사용자 조회
     * 
     * SELECT * FROM users WHERE email = ?
     * 
     * Optional<User>:
     * - 결과 없으면 Optional.empty()
     * - 결과 있으면 Optional.of(user)
     * 
     * 사용:
     * User user = userRepository.findByEmail(email)
     *     .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
     */
    Optional<User> findByEmail(String email);
    
    /**
     * 카카오 ID로 사용자 조회 (소셜 로그인)
     * 
     * SELECT * FROM users WHERE kakao_id = ?
     */
    Optional<User> findByKakaoId(String kakaoId);
    
    /**
     * 이메일 존재 여부 확인
     * 
     * SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)
     * 
     * 회원가입 시 이메일 중복 체크에 사용
     * findByEmail보다 효율적 (데이터 안 가져오고 존재만 확인)
     */
    boolean existsByEmail(String email);
}
