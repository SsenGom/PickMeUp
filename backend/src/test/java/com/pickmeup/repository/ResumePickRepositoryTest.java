package com.pickmeup.repository;

import com.pickmeup.domain.recruiter.PickStatus;
import com.pickmeup.domain.recruiter.ResumePick;
import com.pickmeup.domain.resume.Resume;
import com.pickmeup.domain.user.User;
import com.pickmeup.domain.user.UserType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * ResumePickRepository 테스트
 * 
 * @DataJpaTest: JPA 관련 컴포넌트만 로드 (경량 테스트)
 * TestEntityManager: 테스트용 EntityManager
 */
@DataJpaTest
@DisplayName("ResumePickRepository 테스트")
class ResumePickRepositoryTest {

    @Autowired
    private ResumePickRepository pickRepository;
    
    @Autowired
    private TestEntityManager em;
    
    private User recruiter;
    private User jobSeeker;
    private Resume resume;
    
    @BeforeEach
    void setUp() {
        // 헤드헌터
        recruiter = User.builder()
                .email("recruiter@kakao.com")
                .password("password")
                .name("김채용")
                .userType(UserType.RECRUITER)
                .companyName("카카오")
                .build();
        em.persist(recruiter);
        
        // 구직자
        jobSeeker = User.builder()
                .email("job@gmail.com")
                .password("password")
                .name("홍길동")
                .userType(UserType.JOB_SEEKER)
                .build();
        em.persist(jobSeeker);
        
        // 이력서
        resume = Resume.builder()
                .user(jobSeeker)
                .title("백엔드 개발자")
                .isPublic(true)
                .slug("hong-backend")
                .build();
        em.persist(resume);
        
        em.flush();
    }

    @Test
    @DisplayName("픽 저장 및 조회")
    void saveAndFind() {
        // given
        ResumePick pick = ResumePick.builder()
                .recruiter(recruiter)
                .resume(resume)
                .memo("좋은 경력")
                .build();
        
        // when
        ResumePick saved = pickRepository.save(pick);
        em.flush();
        em.clear();
        
        ResumePick found = pickRepository.findById(saved.getId()).orElse(null);
        
        // then
        assertThat(found).isNotNull();
        assertThat(found.getRecruiter().getId()).isEqualTo(recruiter.getId());
        assertThat(found.getResume().getId()).isEqualTo(resume.getId());
        assertThat(found.getMemo()).isEqualTo("좋은 경력");
        assertThat(found.getStatus()).isEqualTo(PickStatus.PICKED);
    }

    @Test
    @DisplayName("중복 픽 확인")
    void existsByRecruiterAndResume() {
        // given
        ResumePick pick = ResumePick.builder()
                .recruiter(recruiter)
                .resume(resume)
                .build();
        pickRepository.save(pick);
        em.flush();
        
        // when
        boolean exists = pickRepository.existsByRecruiterAndResume(recruiter, resume);
        
        // then
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("헤드헌터가 픽한 이력서 목록 조회")
    void findByRecruiterOrderByPickedAtDesc() {
        // given
        Resume resume2 = Resume.builder()
                .user(jobSeeker)
                .title("프론트엔드 개발자")
                .isPublic(true)
                .slug("hong-frontend")
                .build();
        em.persist(resume2);
        
        ResumePick pick1 = ResumePick.builder()
                .recruiter(recruiter)
                .resume(resume)
                .build();
        pickRepository.save(pick1);
        
        ResumePick pick2 = ResumePick.builder()
                .recruiter(recruiter)
                .resume(resume2)
                .build();
        pickRepository.save(pick2);
        
        em.flush();
        
        // when
        List<ResumePick> picks = pickRepository.findByRecruiterOrderByPickedAtDesc(recruiter);
        
        // then
        assertThat(picks).hasSize(2);
        assertThat(picks.get(0).getPickedAt())
                .isAfterOrEqualTo(picks.get(1).getPickedAt());
    }

    @Test
    @DisplayName("상태별 픽 목록 조회")
    void findByRecruiterAndStatusOrderByPickedAtDesc() {
        // given
        ResumePick pick1 = ResumePick.builder()
                .recruiter(recruiter)
                .resume(resume)
                .status(PickStatus.PICKED)
                .build();
        pickRepository.save(pick1);
        
        Resume resume2 = Resume.builder()
                .user(jobSeeker)
                .title("프론트엔드")
                .isPublic(true)
                .slug("hong-frontend")
                .build();
        em.persist(resume2);
        
        ResumePick pick2 = ResumePick.builder()
                .recruiter(recruiter)
                .resume(resume2)
                .status(PickStatus.CONTACTED)
                .build();
        pickRepository.save(pick2);
        
        em.flush();
        
        // when
        List<ResumePick> pickedOnly = pickRepository
                .findByRecruiterAndStatusOrderByPickedAtDesc(recruiter, PickStatus.PICKED);
        
        // then
        assertThat(pickedOnly).hasSize(1);
        assertThat(pickedOnly.get(0).getStatus()).isEqualTo(PickStatus.PICKED);
    }

    @Test
    @DisplayName("이력서가 받은 총 픽 수")
    void countByResume() {
        // given
        User recruiter2 = User.builder()
                .email("recruiter2@naver.com")
                .password("password")
                .name("이채용")
                .userType(UserType.RECRUITER)
                .build();
        em.persist(recruiter2);
        
        ResumePick pick1 = ResumePick.builder()
                .recruiter(recruiter)
                .resume(resume)
                .build();
        pickRepository.save(pick1);
        
        ResumePick pick2 = ResumePick.builder()
                .recruiter(recruiter2)
                .resume(resume)
                .build();
        pickRepository.save(pick2);
        
        em.flush();
        
        // when
        long count = pickRepository.countByResume(resume);
        
        // then
        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("기간별 픽 수 조회")
    void countByResumeAndPickedAtAfter() {
        // given
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        
        ResumePick oldPick = ResumePick.builder()
                .recruiter(recruiter)
                .resume(resume)
                .build();
        pickRepository.save(oldPick);
        
        em.flush();
        
        // when
        long recentCount = pickRepository.countByResumeAndPickedAtAfter(resume, oneWeekAgo);
        
        // then
        assertThat(recentCount).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("픽한 이력서 ID 목록 조회")
    void findPickedResumeIdsByRecruiter() {
        // given
        Resume resume2 = Resume.builder()
                .user(jobSeeker)
                .title("프론트엔드")
                .isPublic(true)
                .slug("hong-frontend")
                .build();
        em.persist(resume2);
        
        ResumePick pick1 = ResumePick.builder()
                .recruiter(recruiter)
                .resume(resume)
                .build();
        pickRepository.save(pick1);
        
        ResumePick pick2 = ResumePick.builder()
                .recruiter(recruiter)
                .resume(resume2)
                .build();
        pickRepository.save(pick2);
        
        em.flush();
        
        // when
        List<Long> resumeIds = pickRepository.findPickedResumeIdsByRecruiter(recruiter);
        
        // then
        assertThat(resumeIds).hasSize(2);
        assertThat(resumeIds).contains(resume.getId(), resume2.getId());
    }
}
