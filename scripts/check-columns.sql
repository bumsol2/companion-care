-- companions 테이블의 컬럼 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'companions'
ORDER BY ordinal_position;

-- care_schedules 테이블의 컬럼 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'care_schedules'
ORDER BY ordinal_position;

-- care_logs 테이블의 컬럼 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'care_logs'
ORDER BY ordinal_position;
