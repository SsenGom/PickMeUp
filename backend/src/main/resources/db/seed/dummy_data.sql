-- ==================== 더미 데이터 삽입 ====================
-- 
-- 사용법:
-- 1. MySQL 접속: mysql -u pickmeup -p pickmeup
-- 2. 실행: source backend/src/main/resources/db/seed/dummy_data.sql
-- 
-- 또는 Spring Boot 실행 시 자동 로드:
-- application.yml에 spring.sql.init.mode: always 설정

-- ==================== 1. 사용자 (Users) ====================

-- 헤드헌터 계정 (비밀번호: password123)
INSERT INTO users (email, password, name, user_type, company_name, position, is_active, created_at, updated_at) 
VALUES 
('recruiter@kakao.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '김채용', 'RECRUITER', '카카오', '인사팀장', true, NOW(), NOW()),
('hr@naver.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '박인사', 'RECRUITER', '네이버', '채용담당', true, NOW(), NOW()),
('talent@toss.im', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '이헤드', 'RECRUITER', '토스', 'HR Manager', true, NOW(), NOW());

-- 구직자 계정 (비밀번호: password123)
INSERT INTO users (email, password, name, phone, profile_image_url, user_type, is_active, created_at, updated_at)
VALUES
('hong@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '홍길동', '010-1234-5678', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hong', 'JOB_SEEKER', true, NOW(), NOW()),
('kim@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '김철수', '010-2345-6789', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kim', 'JOB_SEEKER', true, NOW(), NOW()),
('lee@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '이영희', '010-3456-7890', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lee', 'JOB_SEEKER', true, NOW(), NOW()),
('park@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '박민수', '010-4567-8901', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Park', 'JOB_SEEKER', true, NOW(), NOW()),
('choi@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '최지우', '010-5678-9012', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Choi', 'JOB_SEEKER', true, NOW(), NOW()),
('jung@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '정수아', '010-6789-0123', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jung', 'JOB_SEEKER', true, NOW(), NOW());

-- ==================== 2. 이력서 (Resumes) ====================

-- 홍길동 이력서 (Java 백엔드 3년차)
INSERT INTO resumes (user_id, title, bio, is_public, slug, github_url, blog_url, view_count, created_at, updated_at)
VALUES 
(4, '3년차 백엔드 개발자', '대규모 트래픽 처리 경험이 있는 백엔드 개발자입니다', true, 'hong-backend', 'https://github.com/hong', 'https://hong.blog', 42, NOW(), NOW());

-- 김철수 이력서 (React 프론트엔드 2년차)
INSERT INTO resumes (user_id, title, bio, is_public, slug, github_url, view_count, created_at, updated_at)
VALUES 
(5, '프론트엔드 개발자', 'React, TypeScript 전문 개발자', true, 'kim-frontend', 'https://github.com/kimcs', 35, NOW(), NOW());

-- 이영희 이력서 (풀스택 4년차)
INSERT INTO resumes (user_id, title, bio, is_public, slug, github_url, portfolio_url, view_count, created_at, updated_at)
VALUES 
(6, '풀스택 개발자', 'Spring Boot + React 풀스택 개발자', true, 'lee-fullstack', 'https://github.com/leeyh', 'https://leeyh.dev', 58, NOW(), NOW());

-- 박민수 이력서 (DevOps 5년차)
INSERT INTO resumes (user_id, title, bio, is_public, slug, github_url, view_count, created_at, updated_at)
VALUES 
(7, 'DevOps 엔지니어', 'AWS, Kubernetes 전문', true, 'park-devops', 'https://github.com/parkms', 67, NOW(), NOW());

-- 최지우 이력서 (데이터 엔지니어 3년차)
INSERT INTO resumes (user_id, title, bio, is_public, slug, github_url, view_count, created_at, updated_at)
VALUES 
(8, '데이터 엔지니어', 'Python, Spark 기반 데이터 파이프라인 구축', true, 'choi-data', 'https://github.com/choijw', 51, NOW(), NOW());

-- 정수아 이력서 (iOS 개발자 2년차)
INSERT INTO resumes (user_id, title, bio, is_public, slug, github_url, view_count, created_at, updated_at)
VALUES 
(9, 'iOS 개발자', 'Swift, SwiftUI 전문', true, 'jung-ios', 'https://github.com/jungsa', 29, NOW(), NOW());

-- ==================== 3. 경력 (Experiences) ====================

-- 홍길동 경력
INSERT INTO experiences (resume_id, company, position, start_date, end_date, is_current, description, display_order, created_at, updated_at)
VALUES 
(1, '우아한형제들', '백엔드 개발자', '2022-03', NULL, true, '배달의민족 주문 시스템 개발 및 운영', 1, NOW(), NOW()),
(1, '카카오페이', '주니어 개발자', '2021-01', '2022-02', false, '결제 시스템 개발', 2, NOW(), NOW());

-- 김철수 경력
INSERT INTO experiences (resume_id, company, position, start_date, end_date, is_current, description, display_order, created_at, updated_at)
VALUES 
(2, '토스', '프론트엔드 개발자', '2023-01', NULL, true, 'React 기반 웹 서비스 개발', 1, NOW(), NOW());

-- 이영희 경력
INSERT INTO experiences (resume_id, company, position, start_date, end_date, is_current, description, display_order, created_at, updated_at)
VALUES 
(3, '네이버', '풀스택 개발자', '2021-06', NULL, true, '네이버 쇼핑 플랫폼 개발', 1, NOW(), NOW()),
(3, '쿠팡', '백엔드 개발자', '2020-03', '2021-05', false, '물류 시스템 개발', 2, NOW(), NOW());

-- 박민수 경력
INSERT INTO experiences (resume_id, company, position, start_date, end_date, is_current, description, display_order, created_at, updated_at)
VALUES 
(4, '라인', 'DevOps 엔지니어', '2020-01', NULL, true, 'Kubernetes 클러스터 운영', 1, NOW(), NOW());

-- 최지우 경력
INSERT INTO experiences (resume_id, company, position, start_date, end_date, is_current, description, display_order, created_at, updated_at)
VALUES 
(5, '당근마켓', '데이터 엔지니어', '2022-07', NULL, true, '데이터 웨어하우스 구축', 1, NOW(), NOW());

-- 정수아 경력
INSERT INTO experiences (resume_id, company, position, start_date, end_date, is_current, description, display_order, created_at, updated_at)
VALUES 
(6, '배달의민족', 'iOS 개발자', '2023-06', NULL, true, '배민앱 iOS 개발', 1, NOW(), NOW());

-- ==================== 4. 스킬 (Skills) ====================

-- 홍길동 스킬
INSERT INTO skills (resume_id, name, category, level, display_order, created_at, updated_at)
VALUES 
(1, 'Java', 'Backend', 'ADVANCED', 1, NOW(), NOW()),
(1, 'Spring Boot', 'Backend', 'ADVANCED', 2, NOW(), NOW()),
(1, 'MySQL', 'Database', 'INTERMEDIATE', 3, NOW(), NOW()),
(1, 'Redis', 'Database', 'INTERMEDIATE', 4, NOW(), NOW()),
(1, 'AWS', 'DevOps', 'INTERMEDIATE', 5, NOW(), NOW()),
(1, 'Docker', 'DevOps', 'INTERMEDIATE', 6, NOW(), NOW());

-- 김철수 스킬
INSERT INTO skills (resume_id, name, category, level, display_order, created_at, updated_at)
VALUES 
(2, 'React', 'Frontend', 'ADVANCED', 1, NOW(), NOW()),
(2, 'TypeScript', 'Frontend', 'ADVANCED', 2, NOW(), NOW()),
(2, 'Next.js', 'Frontend', 'INTERMEDIATE', 3, NOW(), NOW()),
(2, 'Tailwind CSS', 'Frontend', 'ADVANCED', 4, NOW(), NOW());

-- 이영희 스킬
INSERT INTO skills (resume_id, name, category, level, display_order, created_at, updated_at)
VALUES 
(3, 'Java', 'Backend', 'ADVANCED', 1, NOW(), NOW()),
(3, 'Spring Boot', 'Backend', 'ADVANCED', 2, NOW(), NOW()),
(3, 'React', 'Frontend', 'ADVANCED', 3, NOW(), NOW()),
(3, 'PostgreSQL', 'Database', 'ADVANCED', 4, NOW(), NOW()),
(3, 'Kubernetes', 'DevOps', 'INTERMEDIATE', 5, NOW(), NOW());

-- 박민수 스킬
INSERT INTO skills (resume_id, name, category, level, display_order, created_at, updated_at)
VALUES 
(4, 'Kubernetes', 'DevOps', 'ADVANCED', 1, NOW(), NOW()),
(4, 'AWS', 'DevOps', 'ADVANCED', 2, NOW(), NOW()),
(4, 'Terraform', 'DevOps', 'ADVANCED', 3, NOW(), NOW()),
(4, 'Jenkins', 'DevOps', 'INTERMEDIATE', 4, NOW(), NOW()),
(4, 'Docker', 'DevOps', 'ADVANCED', 5, NOW(), NOW());

-- 최지우 스킬
INSERT INTO skills (resume_id, name, category, level, display_order, created_at, updated_at)
VALUES 
(5, 'Python', 'Backend', 'ADVANCED', 1, NOW(), NOW()),
(5, 'Spark', 'Data', 'ADVANCED', 2, NOW(), NOW()),
(5, 'Airflow', 'Data', 'INTERMEDIATE', 3, NOW(), NOW()),
(5, 'Kafka', 'Data', 'INTERMEDIATE', 4, NOW(), NOW());

-- 정수아 스킬
INSERT INTO skills (resume_id, name, category, level, display_order, created_at, updated_at)
VALUES 
(6, 'Swift', 'Mobile', 'ADVANCED', 1, NOW(), NOW()),
(6, 'SwiftUI', 'Mobile', 'ADVANCED', 2, NOW(), NOW()),
(6, 'Combine', 'Mobile', 'INTERMEDIATE', 3, NOW(), NOW());

-- ==================== 5. 프로젝트 (Projects) ====================

-- 홍길동 프로젝트
INSERT INTO projects (resume_id, title, description, role, start_date, end_date, github_url, is_featured, display_order, created_at, updated_at)
VALUES 
(1, '대규모 주문 처리 시스템', 'MSA 기반 주문 처리 시스템 구축 (초당 1만건 처리)', '백엔드 리드', '2023-01', '2024-12', 'https://github.com/hong/order-system', true, 1, NOW(), NOW());

-- 김철수 프로젝트
INSERT INTO projects (resume_id, title, description, role, start_date, end_date, github_url, is_featured, display_order, created_at, updated_at)
VALUES 
(2, '토스 디자인 시스템', 'React 기반 공통 컴포넌트 라이브러리 구축', '프론트엔드 개발', '2023-06', NULL, 'https://github.com/kimcs/design-system', true, 1, NOW(), NOW());

-- 이영희 프로젝트
INSERT INTO projects (resume_id, title, description, role, start_date, end_date, github_url, is_featured, display_order, created_at, updated_at)
VALUES 
(3, '네이버 쇼핑 라이브', '실시간 라이브 커머스 플랫폼 개발', '풀스택 개발자', '2022-03', '2024-06', 'https://github.com/leeyh/live-commerce', true, 1, NOW(), NOW());

-- ==================== 6. 학력 (Educations) ====================

INSERT INTO educations (resume_id, school_name, major, degree, start_date, end_date, display_order, created_at, updated_at)
VALUES 
(1, '서울대학교', '컴퓨터공학과', 'BACHELOR', '2017-03', '2021-02', 1, NOW(), NOW()),
(2, '연세대학교', '소프트웨어학과', 'BACHELOR', '2018-03', '2022-02', 1, NOW(), NOW()),
(3, 'KAIST', '전산학부', 'BACHELOR', '2016-03', '2020-02', 1, NOW(), NOW()),
(4, '고려대학교', '컴퓨터학과', 'BACHELOR', '2015-03', '2019-02', 1, NOW(), NOW()),
(5, '성균관대학교', '데이터사이언스학과', 'BACHELOR', '2019-03', '2023-02', 1, NOW(), NOW()),
(6, '이화여대', '컴퓨터공학과', 'BACHELOR', '2020-03', '2024-02', 1, NOW(), NOW());

-- ==================== 완료 ====================
-- 
-- 생성된 계정:
-- 
-- 헤드헌터:
-- - recruiter@kakao.com / password123 (카카오 김채용)
-- - hr@naver.com / password123 (네이버 박인사)
-- - talent@toss.im / password123 (토스 이헤드)
-- 
-- 구직자:
-- - hong@gmail.com / password123 (홍길동 - Java 백엔드 3년차)
-- - kim@gmail.com / password123 (김철수 - React 프론트 2년차)
-- - lee@gmail.com / password123 (이영희 - 풀스택 4년차)
-- - park@gmail.com / password123 (박민수 - DevOps 5년차)
-- - choi@gmail.com / password123 (최지우 - 데이터 3년차)
-- - jung@gmail.com / password123 (정수아 - iOS 2년차)
