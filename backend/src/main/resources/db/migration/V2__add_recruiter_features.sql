-- ==================== User 테이블 확장 ====================

-- 사용자 타입 추가 (기본값: JOB_SEEKER)
ALTER TABLE users 
ADD COLUMN user_type VARCHAR(20) NOT NULL DEFAULT 'JOB_SEEKER' AFTER is_active;

-- 헤드헌터 전용 필드 추가
ALTER TABLE users 
ADD COLUMN company_name VARCHAR(100) AFTER user_type,
ADD COLUMN position VARCHAR(100) AFTER company_name,
ADD COLUMN department VARCHAR(100) AFTER position,
ADD COLUMN business_email VARCHAR(100) AFTER department;

-- 인덱스 추가
CREATE INDEX idx_user_type ON users(user_type);

-- ==================== Resume Picks 테이블 ====================

CREATE TABLE resume_picks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT NOT NULL,
    resume_id BIGINT NOT NULL,
    memo VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PICKED',
    picked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contacted_at DATETIME,
    contact_method VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    
    -- 중복 픽 방지
    UNIQUE KEY uk_recruiter_resume (recruiter_id, resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 인덱스
CREATE INDEX idx_recruiter_id ON resume_picks(recruiter_id);
CREATE INDEX idx_resume_id ON resume_picks(resume_id);
CREATE INDEX idx_picked_at ON resume_picks(picked_at);
CREATE INDEX idx_status ON resume_picks(status);

-- ==================== Contact Proposals 테이블 ====================

CREATE TABLE contact_proposals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT NOT NULL,
    job_seeker_id BIGINT NOT NULL,
    pick_id BIGINT,
    
    -- 제안 내용
    company_name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    salary_range VARCHAR(100),
    location VARCHAR(100),
    work_type VARCHAR(50),
    message TEXT NOT NULL,
    
    -- 상태
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    proposed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME,
    response_message VARCHAR(1000),
    expires_at DATETIME,
    
    -- 채팅방 연결
    thread_id BIGINT,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_seeker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pick_id) REFERENCES resume_picks(id) ON DELETE SET NULL,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 인덱스
CREATE INDEX idx_recruiter_id ON contact_proposals(recruiter_id);
CREATE INDEX idx_job_seeker_id ON contact_proposals(job_seeker_id);
CREATE INDEX idx_status ON contact_proposals(status);
CREATE INDEX idx_proposed_at ON contact_proposals(proposed_at);
CREATE INDEX idx_expires_at ON contact_proposals(expires_at);

-- ==================== 기존 Resume 테이블 확장 ====================

-- 조회수 컬럼이 없으면 추가
ALTER TABLE resumes 
ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0 AFTER is_public;

-- ==================== 완료 ====================
-- 이제 애플리케이션 재시작하면 JPA가 자동으로 매핑합니다.
