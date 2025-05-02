# 데이터베이스 스키마 분석 및 불일치 해결

## 개요

Companion Care 애플리케이션의 데이터베이스 스키마와 실제 데이터베이스 구조 간의 불일치를 분석하고 해결한 과정을 정리한 문서입니다.

## 스키마 불일치 문제

애플리케이션 개발 과정에서 스키마 파일(`db/schema-final.sql`)과 실제 데이터베이스 구조 간에 불일치가 발생했습니다. 이로 인해 다음과 같은 문제가 발생했습니다:

1. 외래 키 제약 조건 적용 실패
2. 마이그레이션 스크립트 실행 시 오류 발생
3. 데이터 일관성 문제

## 실제 데이터베이스 구조 분석

### 분석 방법

실제 데이터베이스 구조를 분석하기 위해 다음 스크립트를 사용했습니다:

```sql
-- 테이블 컬럼 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = '테이블명'
ORDER BY ordinal_position;
```

### 분석 결과

#### companions 테이블
```json
[
  {
    "column_name": "id",
    "data_type": "uuid"
  },
  ...
]
```

#### care_schedules 테이블
```json
[
  {
    "column_name": "id",
    "data_type": "uuid"
  },
  {
    "column_name": "created_at",
    "data_type": "timestamp with time zone"
  },
  {
    "column_name": "updated_at",
    "data_type": "timestamp with time zone"
  },
  {
    "column_name": "title",
    "data_type": "text"
  },
  {
    "column_name": "description",
    "data_type": "text"
  },
  {
    "column_name": "frequency_days",
    "data_type": "integer"
  },
  {
    "column_name": "next_due_date",
    "data_type": "timestamp with time zone"
  },
  {
    "column_name": "pet_plant_id",
    "data_type": "uuid"
  },
  {
    "column_name": "user_id",
    "data_type": "uuid"
  },
  {
    "column_name": "last_completed_at",
    "data_type": "timestamp with time zone"
  }
]
```

#### care_logs 테이블
```json
[
  {
    "column_name": "id",
    "data_type": "uuid"
  },
  {
    "column_name": "schedule_id",
    "data_type": "uuid"
  },
  {
    "column_name": "companion_id",
    "data_type": "uuid"
  },
  {
    "column_name": "cared_at",
    "data_type": "timestamp with time zone"
  },
  {
    "column_name": "notes",
    "data_type": "text"
  },
  {
    "column_name": "care_type",
    "data_type": "text"
  },
  {
    "column_name": "user_id",
    "data_type": "uuid"
  }
]
```

## 스키마 파일과 실제 데이터베이스 구조 비교

### 스키마 파일 (`db/schema-final.sql`)

스키마 파일에서는 다음과 같이 정의되어 있습니다:

```sql
CREATE TABLE IF NOT EXISTS care_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  companion_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency_days INTEGER NOT NULL,
  last_cared_at TIMESTAMP WITH TIME ZONE,
  next_care_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT fk_care_schedules_companion_id FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS care_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL,
  companion_id UUID NOT NULL,
  cared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  
  CONSTRAINT fk_care_logs_schedule_id FOREIGN KEY (schedule_id) REFERENCES care_schedules(id) ON DELETE CASCADE,
  CONSTRAINT fk_care_logs_companion_id FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE
);
```

### 주요 불일치 사항

1. **care_schedules 테이블**:
   - 스키마 파일: `companion_id` 컬럼 사용
   - 실제 데이터베이스: `pet_plant_id` 컬럼 사용
   - 추가 컬럼: `user_id`, `last_completed_at`
   - 누락된 컬럼: `is_active`
   - 이름 변경: `next_care_at` → `next_due_date`, `last_cared_at` → `last_completed_at`

2. **care_logs 테이블**:
   - 추가 컬럼: `care_type`, `user_id`

## 불일치 해결 방법

### 1. 실제 데이터베이스 구조에 맞게 마이그레이션 스크립트 수정

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

### 2. 고아 레코드 처리

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

## 권장 사항

1. **스키마 문서 업데이트**: 실제 데이터베이스 구조를 반영하도록 스키마 파일을 업데이트하세요.
2. **마이그레이션 자동화**: 스키마 변경 시 자동으로 마이그레이션 스크립트를 생성하는 도구를 도입하세요.
3. **테스트 환경 구축**: 실제 환경에 적용하기 전에 테스트 환경에서 마이그레이션을 테스트하세요.
4. **백업 정책 수립**: 마이그레이션 전에 항상 데이터베이스를 백업하세요.
5. **변경 이력 관리**: 데이터베이스 스키마 변경 이력을 문서화하고 버전 관리하세요.
