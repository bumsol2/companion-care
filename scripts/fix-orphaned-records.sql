-- 외래 키 제약 조건 수정 전 고아 레코드 처리

-- 1. 고아 레코드 확인 (companions 테이블에 존재하지 않는 pet_plant_id를 가진 care_schedules 레코드)
SELECT cs.id, cs.pet_plant_id, cs.title
FROM care_schedules cs
LEFT JOIN companions c ON cs.pet_plant_id = c.id
WHERE c.id IS NULL;

-- 2. 고아 레코드 처리 방법 선택
-- 방법 1: 고아 레코드 삭제 (데이터 손실 발생)
DELETE FROM care_schedules
WHERE pet_plant_id IN (
    SELECT cs.pet_plant_id
    FROM care_schedules cs
    LEFT JOIN companions c ON cs.pet_plant_id = c.id
    WHERE c.id IS NULL
);

-- 방법 2: 고아 레코드의 pet_plant_id를 NULL로 설정 (외래 키 제약 조건을 NULL 허용으로 변경해야 함)
-- 이 방법을 선택하려면 아래 주석을 해제하고, migration-script.sql을 수정해야 합니다.
/*
UPDATE care_schedules
SET pet_plant_id = NULL
WHERE pet_plant_id IN (
    SELECT cs.pet_plant_id
    FROM care_schedules cs
    LEFT JOIN companions c ON cs.pet_plant_id = c.id
    WHERE c.id IS NULL
);
*/

-- 3. 외래 키 제약 조건 추가 (고아 레코드 처리 후 실행)
-- 이 부분은 migration-script.sql에 있는 내용과 동일합니다.
ALTER TABLE care_schedules
DROP CONSTRAINT IF EXISTS care_schedules_pet_plant_id_fkey,
ADD CONSTRAINT care_schedules_pet_plant_id_fkey
FOREIGN KEY (pet_plant_id) REFERENCES companions(id)
ON DELETE CASCADE;

ALTER TABLE care_logs
DROP CONSTRAINT IF EXISTS care_logs_companion_id_fkey,
ADD CONSTRAINT care_logs_companion_id_fkey
FOREIGN KEY (companion_id) REFERENCES companions(id)
ON DELETE CASCADE;

ALTER TABLE care_logs
DROP CONSTRAINT IF EXISTS care_logs_schedule_id_fkey,
ADD CONSTRAINT care_logs_schedule_id_fkey
FOREIGN KEY (schedule_id) REFERENCES care_schedules(id)
ON DELETE SET NULL;
