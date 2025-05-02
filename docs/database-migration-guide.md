# 데이터베이스 마이그레이션 가이드

## 개요

Companion Care 애플리케이션의 데이터베이스 마이그레이션 작업을 통해 외래 키 제약 조건을 올바르게 설정하고 데이터 일관성 문제를 해결했습니다. 이 문서는 수행된 마이그레이션 작업과 해결된 문제에 대한 상세 내용을 제공합니다.

## 문제 상황

기존 데이터베이스에서는 다음과 같은 문제가 있었습니다:

1. **외래 키 제약 조건 부재**: 테이블 간의 관계가 외래 키 제약 조건으로 강제되지 않아 데이터 일관성 문제가 발생했습니다.
2. **고아 레코드 발생**: 반려 생물이 삭제되어도 관련된 케어 일정과 로그가 삭제되지 않아 고아 레코드가 발생했습니다.
3. **데이터 무결성 위반**: 존재하지 않는 반려 생물을 참조하는 케어 일정이 있었습니다.

## 데이터베이스 테이블 구조

마이그레이션 작업을 위해 먼저 데이터베이스 테이블 구조를 정확히 파악했습니다:

1. **companions 테이블**: 
   - `id` (PK)
   - `owner_id` (사용자 ID)
   - 기타 필드...

2. **care_schedules 테이블**: 
   - `id` (PK)
   - `pet_plant_id` (companions 테이블의 id 참조)
   - `user_id` (users 테이블의 id 참조)
   - 기타 필드...

3. **care_logs 테이블**: 
   - `id` (PK)
   - `companion_id` (companions 테이블의 id 참조)
   - `schedule_id` (care_schedules 테이블의 id 참조)
   - 기타 필드...

## 마이그레이션 단계

### 1. 테이블 구조 확인

데이터베이스 테이블의 정확한 구조를 확인하기 위해 다음 스크립트를 사용했습니다:

```sql
-- 테이블 컬럼 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = '테이블명'
ORDER BY ordinal_position;
```

### 2. 고아 레코드 확인 및 처리

존재하지 않는 반려 생물을 참조하는 케어 일정을 확인하고 삭제했습니다:

```sql
-- 고아 레코드 확인
SELECT cs.id, cs.pet_plant_id, cs.title
FROM care_schedules cs
LEFT JOIN companions c ON cs.pet_plant_id = c.id
WHERE c.id IS NULL;

-- 고아 레코드 삭제
DELETE FROM care_schedules
WHERE pet_plant_id IN (
    SELECT cs.pet_plant_id
    FROM care_schedules cs
    LEFT JOIN companions c ON cs.pet_plant_id = c.id
    WHERE c.id IS NULL
);
```

### 3. 외래 키 제약 조건 추가

데이터 일관성을 유지하기 위해 다음과 같은 외래 키 제약 조건을 추가했습니다:

```sql
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
```

## 마이그레이션 결과

마이그레이션 작업 후 다음과 같은 외래 키 제약 조건이 설정되었습니다:

1. `care_schedules_pet_plant_id_fkey`: care_schedules 테이블의 pet_plant_id가 companions 테이블의 id를 참조
2. `care_logs_companion_id_fkey`: care_logs 테이블의 companion_id가 companions 테이블의 id를 참조
3. `care_logs_schedule_id_fkey`: care_logs 테이블의 schedule_id가 care_schedules 테이블의 id를 참조

이러한 제약 조건으로 인해 다음과 같은 효과가 있습니다:

- 반려 생물(companions)이 삭제되면 관련된 케어 일정(care_schedules)과 케어 로그(care_logs)도 자동으로 삭제됩니다.
- 케어 일정(care_schedules)이 삭제되면 관련된 케어 로그(care_logs)의 schedule_id는 NULL로 설정됩니다.

## 관련 파일

마이그레이션 작업과 관련된 파일은 다음과 같습니다:

1. `scripts/check-columns.sql`: 테이블 구조 확인 스크립트
2. `scripts/fix-orphaned-records.sql`: 고아 레코드 처리 및 외래 키 제약 조건 추가 스크립트
3. `scripts/migration-script.sql`: 외래 키 제약 조건 추가 스크립트

## 주의 사항

1. 이 마이그레이션은 데이터베이스 구조를 변경하므로, 실행 전에 데이터베이스 백업을 수행하는 것이 좋습니다.
2. 마이그레이션 후에는 애플리케이션이 올바르게 작동하는지 테스트해야 합니다.
3. 추가적인 테이블이나 관계가 생성될 경우, 적절한 외래 키 제약 조건을 설정해야 합니다.
