-- ==================== 더미 데이터 생성 스크립트 ====================
-- 
-- 사용법:
-- 1. application.yml에 추가:
--    spring:
--      jpa:
--        defer-datasource-initialization: true
--      sql:
--        init:
--          mode: always
-- 
-- 2. 서버 실행하면 자동으로 데이터 생성
-- 
-- 주의: 프로덕션에서는 mode: never로 설정!

-- ==================== 사용자 ====================
-- 비밀번호: test1234 (BCrypt 해시)
-- $2a$10$N9qo8uLOickgx2ZMRZoMye.p.N.W2P2P2P2P2P2P2P2P2P2P2P2 (예시)

-- 헤드헌터 1: 카카오
INSERT INTO users (email, password, name, user_type, company_name, position, is_active, created_at, updated_at)
VALUES ('recruiter1@kakao.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '김채용', 'RECRUITER', '카카오', '인사팀장', true, NOW(), NOW());

-- 헤드헌터 2: 네이버
INSERT INTO users (email, password, name, user_type, company_name, position, is_active, created_at, updated_at)
VALUES ('recruiter2@naver.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '이채용', 'RECRUITER', '네이버', 'HR 매니저', true, NOW(), NOW());

-- 헤드헌터 3: 토스
INSERT INTO users (email, password, name, user_type, company_name, position, is_active, created_at, updated_at)
VALUES ('recruiter3@toss.im', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '박채용', 'RECRUITER', '토스', '채용 담당자', true, NOW(), NOW());

-- 구직자 1: 백엔드 3년차
INSERT INTO users (email, password, name, user_type, is_active, profile_image_url, created_at, updated_at)
VALUES ('backend1@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '홍길동', 'JOB_SEEKER', true, 'https://i.pravatar.cc/150?img=1', NOW(), NOW());

-- 구직자 2: 프론트엔드 2년차
INSERT INTO users (email, password, name, user_type, is_active, profile_image_url, created_at, updated_at)
VALUES ('frontend1@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '김영희', 'JOB_SEEKER', true, 'https://i.pravatar.cc/150?img=5', NOW(), NOW());

-- 구직자 3: 풀스택 4년차
INSERT INTO users (email, password, name, user_type, is_active, profile_image_url, created_at, updated_at)
VALUES ('fullstack1@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '박철수', 'JOB_SEEKER', true, 'https://i.pravatar.cc/150?img=8', NOW(), NOW());

-- 구직자 4: DevOps 5년차
INSERT INTO users (email, password, name, user_type, is_active, profile_image_url, created_at, updated_at)
VALUES ('devops1@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '최민수', 'JOB_SEEKER', true, 'https://i.pravatar.cc/150?img=12', NOW(), NOW());

-- 구직자 5: 신입 개발자
INSERT INTO users (email, password, name, user_type, is_active, profile_image_url, created_at, updated_at)
VALUES ('junior1@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '이수진', 'JOB_SEEKER', true, 'https://i.pravatar.cc/150?img=20', NOW(), NOW());

-- ==================== 이력서 ====================

-- 이력서 1: 홍길동 (백엔드 3년차)
INSERT INTO resumes (user_id, title, bio, is_public, slug, view_count, created_at, updated_at)
VALUES (4, '3년차 백엔드 개발자', 'Spring Boot와 MSA 구조에 능숙한 백엔드 개발자입니다', true, 'hong-backend', 127, NOW(), NOW());

-- 이력서 2: 김영희 (프론트엔드 2년차)
INSERT INTO resumes (user_id, title, bio, is_public, slug, view_count, created_at, updated_at)
VALUES (5, '2년차 프론트엔드 개발자', 'React와 TypeScript로 사용자 경험을 개선합니다', true, 'kim-frontend', 89, NOW(), NOW());

-- 이력서 3: 박철수 (풀스택 4년차)
INSERT INTO resumes (user_id, title, bio, is_public, slug, view_count, created_at, updated_at)
VALUES (6, '4년차 풀스택 개발자', 'Node.js와 React로 빠른 프로토타입 제작이 가능합니다', true, 'park-fullstack', 203, NOW(), NOW());

-- 이력서 4: 최민수 (DevOps 5년차)
INSERT INTO resumes (user_id, title, bio, is_public, slug, view_count, created_at, updated_at)
VALUES (7, '5년차 DevOps 엔지니어', 'AWS와 Kubernetes로 안정적인 인프라를 구축합니다', true, 'choi-devops', 156, NOW(), NOW());

-- 이력서 5: 이수진 (신입)
INSERT INTO resumes (user_id, title, bio, is_public, slug, view_count, created_at, updated_at)
VALUES (8, '열정 가득한 신입 개발자', '빠르게 배우고 성장하는 것을 즐깁니다', true, 'lee-junior', 45, NOW(), NOW());

-- ==================== 경력 ====================

-- 홍길동 경력
INSERT INTO experiences (resume_id, company, position, start_date, end_date, is_current, description, display_order, created_at, updated_at)
VALUES (1, '쿠팡', '백엔드 개발자', '2022-03', NULL, true, '대규모 트래픽 처리 경험', 0, NOW(), NOW());

INSERT INTO experiences (resume_id, company, position, start_date, end_date, is_current, description, display_order, created_at, updated_at)
VALUES (1, '스타트업A', '주니어 개발자', '2020-01', '2022-02', false, '백엔드 API 개발', 1, NOW(), NOW());

-- 김영희 경력
INSERT INTO experiences (resume_id, company, position, start_date, end_date, is_current, description, display_order, created_at, updated_at)
VALUES (2, '라인', '프론트엔드 개발자', '2023-01', NULL, true, 'React 기반 웹앱 개발', 0, NOW(), NOW());

-- 박철수 경력
INSERT INTO experiences (resume_id, company, position, start_date, end_date, is_current, description, display_order, created_at, updated_at)
VALUES (3, '배달의민족', '풀스택 개발자', '2021-03', NULL, true, '주문 시스템 개발 및 운영', 0, NOW(), NOW());

-- 최민수 경력
INSERT INTO experiences (resume_id, company, position, start_date, end_date, is_current, description, display_order, created_at, updated_at)
VALUES (4, '당근마켓', 'DevOps 엔지니어', '2020-01', NULL, true, 'AWS 인프라 구축 및 관리', 0, NOW(), NOW());

-- ==================== 스킬 ====================

-- 홍길동 스킬
INSERT INTO skills (resume_id, name, category, level, display_order, created_at, updated_at)
VALUES 
(1, 'Java', 'Language', 'ADVANCED', 0, NOW(), NOW()),
(1, 'Spring Boot', 'Framework', 'ADVANCED', 1, NOW(), NOW()),
(1, 'MySQL', 'Database', 'INTERMEDIATE', 2, NOW(), NOW()),
(1, 'Redis', 'Database', 'INTERMEDIATE', 3, NOW(), NOW()),
(1, 'AWS', 'Infra', 'INTERMEDIATE', 4, NOW(), NOW());

-- 김영희 스킬
INSERT INTO skills (resume_id, name, category, level, display_order, created_at, updated_at)
VALUES 
(2, 'React', 'Framework', 'ADVANCED', 0, NOW(), NOW()),
(2, 'TypeScript', 'Language', 'ADVANCED', 1, NOW(), NOW()),
(2, 'Tailwind CSS', 'Style', 'INTERMEDIATE', 2, NOW(), NOW()),
(2, 'Next.js', 'Framework', 'INTERMEDIATE', 3, NOW(), NOW());

-- 박철수 스킬
INSERT INTO skills (resume_id, name, category, level, display_order, created_at, updated_at)
VALUES 
(3, 'Node.js', 'Backend', 'ADVANCED', 0, NOW(), NOW()),
(3, 'React', 'Frontend', 'ADVANCED', 1, NOW(), NOW()),
(3, 'MongoDB', 'Database', 'INTERMEDIATE', 2, NOW(), NOW()),
(3, 'Docker', 'Infra', 'INTERMEDIATE', 3, NOW(), NOW());

-- 최민수 스킬
INSERT INTO skills (resume_id, name, category, level, display_order, created_at, updated_at)
VALUES 
(4, 'Kubernetes', 'Infra', 'ADVANCED', 0, NOW(), NOW()),
(4, 'AWS', 'Cloud', 'ADVANCED', 1, NOW(), NOW()),
(4, 'Terraform', 'IaC', 'ADVANCED', 2, NOW(), NOW()),
(4, 'Jenkins', 'CI/CD', 'INTERMEDIATE', 3, NOW(), NOW());

-- 이수진 스킬
INSERT INTO skills (resume_id, name, category, level, display_order, created_at, updated_at)
VALUES 
(5, 'Python', 'Language', 'BEGINNER', 0, NOW(), NOW()),
(5, 'JavaScript', 'Language', 'BEGINNER', 1, NOW(), NOW()),
(5, 'Git', 'Tool', 'BEGINNER', 2, NOW(), NOW());

-- ==================== 프로젝트 ====================

-- 홍길동 프로젝트
INSERT INTO projects (resume_id, title, description, role, start_date, end_date, github_url, display_order, created_at, updated_at)
VALUES (1, '대용량 트래픽 처리 시스템', 'Redis 캐싱과 DB 샤딩을 통한 성능 최적화', '백엔드 리드', '2023-01', '2023-12', 'https://github.com/hong/traffic-system', 0, NOW(), NOW());

-- 김영희 프로젝트
INSERT INTO projects (resume_id, title, description, role, start_date, end_date, github_url, display_order, created_at, updated_at)
VALUES (2, '사내 디자인 시스템 구축', 'React 컴포넌트 라이브러리 제작', '프론트엔드 개발', '2023-03', '2024-01', 'https://github.com/kim/design-system', 0, NOW(), NOW());

-- 박철수 프로젝트
INSERT INTO projects (resume_id, title, description, role, start_date, end_date, github_url, display_order, created_at, updated_at)
VALUES (3, '실시간 주문 관리 시스템', 'WebSocket 기반 실시간 주문 처리', '풀스택 개발', '2022-06', '2023-12', 'https://github.com/park/order-system', 0, NOW(), NOW());

-- ==================== 학력 ====================

INSERT INTO educations (resume_id, school_name, major, degree, start_date, end_date, is_current, display_order, created_at, updated_at)
VALUES 
(1, '서울대학교', '컴퓨터공학', 'BACHELOR', '2016-03', '2020-02', false, 0, NOW(), NOW()),
(2, '연세대학교', '소프트웨어학', 'BACHELOR', '2018-03', '2022-02', false, 0, NOW(), NOW()),
(3, 'KAIST', '전산학', 'BACHELOR', '2017-03', '2021-02', false, 0, NOW(), NOW()),
(4, '고려대학교', '컴퓨터학', 'BACHELOR', '2015-03', '2019-02', false, 0, NOW(), NOW()),
(5, '부산대학교', '컴퓨터공학', 'BACHELOR', '2020-03', '2024-02', false, 0, NOW(), NOW());

-- ==================== 완료 메시지 ====================
-- 더미 데이터 생성 완료!
-- 
-- 로그인 정보:
-- 헤드헌터1: recruiter1@kakao.com / test1234
-- 헤드헌터2: recruiter2@naver.com / test1234
-- 헤드헌터3: recruiter3@toss.im / test1234
-- 
-- 구직자1: backend1@gmail.com / test1234
-- 구직자2: frontend1@gmail.com / test1234
-- 구직자3: fullstack1@gmail.com / test1234
-- 구직자4: devops1@gmail.com / test1234
-- 구직자5: junior1@gmail.com / test1234
