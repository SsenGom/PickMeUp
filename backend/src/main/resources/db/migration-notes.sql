-- ============================================================
-- PickMeUp DB 수동 마이그레이션 노트
-- ddl-auto: update 는 ENUM 값 추가를 자동으로 처리 못함
-- AIUsageType enum에 값 추가할 때마다 아래 ALTER 직접 실행
-- ============================================================

-- 실행 방법:
-- docker exec -i pickmeup-mysql mysql -upickmeup -ppickmeup123 pickmeup < migration-notes.sql

-- [2026-02-24] DIAGRAM_GENERATION 추가
ALTER TABLE ai_usage_logs
    MODIFY COLUMN usage_type ENUM(
        'GENERATE_QUESTIONS',
        'GENERATE_FEEDBACK',
        'DIAGRAM_GENERATION'
    ) NOT NULL;

-- [thumbnail_url] TEXT로 변경 (base64 대비)
-- ddl-auto: update 가 자동 처리하므로 재시작 시 적용됨
-- ALTER TABLE projects MODIFY COLUMN thumbnail_url TEXT;
