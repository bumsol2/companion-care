# 데이터베이스 마이그레이션 요약

## 마이그레이션 목적

Companion Care 애플리케이션의 데이터베이스에서 외래 키 제약 조건을 올바르게 설정하여 데이터 일관성을 유지하고 고아 레코드 문제를 해결하기 위한 마이그레이션을 수행했습니다.

## 수행된 작업 요약

1. **데이터베이스 구조 분석**
   - 실제 테이블 구조 확인 (`scripts/check-columns.sql`)
   - 스키마 파일과 실제 데이터베이스 간 불일치 파악

2. **고아 레코드 처리**
   - 존재하지 않는 반려 생물을 참조하는 케어 일정 레코드 식별
   - 고아 레코드 삭제 (`scripts/fix-orphaned-records.sql`)

3. **외래 키 제약 조건 설정**
   - 테이블 간 관계에 맞는 외래 키 제약 조건 추가
   - 적절한 삭제 규칙 설정 (CASCADE, SET NULL)
   - 마이그레이션 스크립트 실행 (`scripts/migration-script.sql`)

## 주요 변경 사항

### 외래 키 제약 조건 추가

```sql
-- care_schedules 테이블
ALTER TABLE care_schedules
ADD CONSTRAINT care_schedules_pet_plant_id_fkey
FOREIGN KEY (pet_plant_id) REFERENCES companions(id)
ON DELETE CASCADE;

-- care_logs 테이블
ALTER TABLE care_logs
ADD CONSTRAINT care_logs_companion_id_fkey
FOREIGN KEY (companion_id) REFERENCES companions(id)
ON DELETE CASCADE;

ALTER TABLE care_logs
ADD CONSTRAINT care_logs_schedule_id_fkey
FOREIGN KEY (schedule_id) REFERENCES care_schedules(id)
ON DELETE SET NULL;
```

### 적용된 삭제 규칙

- **ON DELETE CASCADE**: 반려 생물(companions)이 삭제되면 관련된 케어 일정(care_schedules)과 케어 로그(care_logs)도 자동으로 삭제됩니다.
- **ON DELETE SET NULL**: 케어 일정(care_schedules)이 삭제되면 관련된 케어 로그(care_logs)의 schedule_id는 NULL로 설정됩니다.

## 마이그레이션 결과

마이그레이션 후 다음과 같은 외래 키 제약 조건이 설정되었습니다:

```
care_schedules_pet_plant_id_fkey: pet_plant_id → companions(id)
care_logs_companion_id_fkey: companion_id → companions(id)
care_logs_schedule_id_fkey: schedule_id → care_schedules(id)
```

## 해결된 문제

- 반려 생물 삭제 시 연결된 케어 일정 및 로그가 고아 레코드로 남는 문제 해결
- 데이터 일관성 유지를 위한 외래 키 제약 조건 설정
- 존재하지 않는 반려 생물을 참조하는 고아 레코드 정리

## 관련 문서

- [데이터베이스 마이그레이션 가이드](./database-migration-guide.md)
- [데이터베이스 스키마 분석](./database-schema-analysis.md)
- [버그 수정 구현 내역](./bug-fixes-implemented.md)
