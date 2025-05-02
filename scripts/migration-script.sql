
-- 외래 키 제약 조건 수정 마이그레이션

-- 실제 데이터베이스 테이블 구조 (check-columns.sql 결과 기준)
-- companions 테이블: id (PK), owner_id (사용자 ID), 기타 필드...
-- care_schedules 테이블: id (PK), pet_plant_id (companions 테이블의 id 참조), 기타 필드...
-- care_logs 테이블: id (PK), companion_id (companions 테이블의 id 참조), schedule_id (care_schedules 테이블의 id 참조), 기타 필드...

-- care_schedules 테이블의 외래 키 제약 조건 업데이트
ALTER TABLE care_schedules
DROP CONSTRAINT IF EXISTS care_schedules_pet_plant_id_fkey,
ADD CONSTRAINT care_schedules_pet_plant_id_fkey
FOREIGN KEY (pet_plant_id) REFERENCES companions(id)
ON DELETE CASCADE;

-- care_logs 테이블의 외래 키 제약 조건 업데이트
ALTER TABLE care_logs
DROP CONSTRAINT IF EXISTS care_logs_companion_id_fkey,
ADD CONSTRAINT care_logs_companion_id_fkey
FOREIGN KEY (companion_id) REFERENCES companions(id)
ON DELETE CASCADE;

-- care_logs 테이블의 schedule_id 외래 키 제약 조건 업데이트
ALTER TABLE care_logs
DROP CONSTRAINT IF EXISTS care_logs_schedule_id_fkey,
ADD CONSTRAINT care_logs_schedule_id_fkey
FOREIGN KEY (schedule_id) REFERENCES care_schedules(id)
ON DELETE SET NULL;
