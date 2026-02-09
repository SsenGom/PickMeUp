-- ========================================
-- 헤드헌터 모드 추가
-- ========================================

-- 1. User 테이블에 헤드헌터 필드 추가
ALTER TABLE users 
ADD COLUMN user_type VARCHAR(20) NOT NULL DEFAULT 'JOB_SEEKER' COMMENT '사용자 타입',
ADD COLUMN company_name VARCHAR(100) COMMENT '회사명 (헤드헌터)',
ADD COLUMN position VARCHAR(100) COMMENT '직급 (헤드헌터)',
ADD COLUMN department VARCHAR(100) COMMENT '부서 (헤드헌터)',
ADD COLUMN business_email VARCHAR(100) COMMENT '회사 이메일 (헤드헌터)';

-- 인덱스 추가
CREATE INDEX idx_user_type ON users(user_type);

-- 2. ResumePick 테이블 생성
CREATE TABLE resume_picks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT NOT NULL COMMENT '픽한 헤드헌터',
    resume_id BIGINT NOT NULL COMMENT '픽된 이력서',
    memo VARCHAR(500) COMMENT '메모',
    status VARCHAR(20) NOT NULL DEFAULT 'PICKED' COMMENT 'Pick 상태',
    picked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '픽한 시간',
    contacted_at DATETIME COMMENT '컨택한 시간',
    contact_method VARCHAR(50) COMMENT '컨택 방법',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pick_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pick_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    CONSTRAINT uk_pick_unique UNIQUE (recruiter_id, resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='이력서 픽';

-- 인덱스
CREATE INDEX idx_pick_recruiter ON resume_picks(recruiter_id);
CREATE INDEX idx_pick_resume ON resume_picks(resume_id);
CREATE INDEX idx_pick_picked_at ON resume_picks(picked_at);
CREATE INDEX idx_pick_status ON resume_picks(status);

-- 3. ContactProposal 테이블 생성
CREATE TABLE contact_proposals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT NOT NULL COMMENT '헤드헌터',
    job_seeker_id BIGINT NOT NULL COMMENT '구직자',
    pick_id BIGINT COMMENT '연관 Pick',
    
    -- 제안 내용
    company_name VARCHAR(100) NOT NULL COMMENT '회사명',
    position VARCHAR(100) NOT NULL COMMENT '포지션',
    salary_range VARCHAR(100) COMMENT '급여 범위',
    location VARCHAR(100) COMMENT '근무지',
    work_type VARCHAR(50) COMMENT '고용 형태',
    message TEXT NOT NULL COMMENT '제안 메시지',
    
    -- 상태
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '제안 상태',
    proposed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '제안 시간',
    responded_at DATETIME COMMENT '응답 시간',
    response_message VARCHAR(1000) COMMENT '응답 메시지',
    expires_at DATETIME COMMENT '만료 시간',
    thread_id BIGINT COMMENT '채팅방 ID',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_proposal_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_proposal_jobseeker FOREIGN KEY (job_seeker_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_proposal_pick FOREIGN KEY (pick_id) REFERENCES resume_picks(id) ON DELETE SET NULL,
    CONSTRAINT fk_proposal_thread FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='컨택 제안';

-- 인덱스
CREATE INDEX idx_proposal_recruiter ON contact_proposals(recruiter_id);
CREATE INDEX idx_proposal_jobseeker ON contact_proposals(job_seeker_id);
CREATE INDEX idx_proposal_status ON contact_proposals(status);
CREATE INDEX idx_proposal_proposed_at ON contact_proposals(proposed_at);
CREATE INDEX idx_proposal_expires_at ON contact_proposals(expires_at);

-- 4. 기존 사용자 모두 JOB_SEEKER로 설정 (이미 DEFAULT 값이 있지만 명시적으로)
UPDATE users SET user_type = 'JOB_SEEKER' WHERE user_type IS NULL;
