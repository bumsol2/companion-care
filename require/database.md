# Companion Care 데이터베이스 설계 및 사용 가이드

## 1. 데이터베이스 개요

### 1.1 데이터베이스 선택 이유
Companion Care는 Supabase를 데이터베이스로 사용합니다. Supabase는 다음과 같은 이점을 제공합니다:

- **PostgreSQL 기반**: 강력한 관계형 데이터베이스 기능 제공
- **인증 시스템 내장**: Google OAuth 등 소셜 로그인 쉽게 구현 가능
- **실시간 기능**: 실시간 알림 및 데이터 동기화 지원
- **Storage 기능**: 반려 생물 사진 저장에 최적화
- **Row Level Security (RLS)**: 사용자별 데이터 접근 제어 용이
- **서버리스 아키텍처**: Vercel과 함께 사용하기 적합

### 1.2 데이터 흐름 구조

```
[클라이언트] <--> [Next.js API Routes] <--> [Supabase]
                     |
                     v
                [Vercel Cron]
                     |
                     v
                [이메일 알림]
```

## 2. 데이터베이스 스키마

### 2.1 테이블 구조

#### users 테이블
사용자 정보를 저장합니다. Supabase Auth와 연동됩니다.

| 필드명 | 타입 | 설명 | 제약조건 |
|-------|------|------|----------|
| id | UUID | 사용자 고유 ID | PRIMARY KEY, REFERENCES auth.users(id) |
| email | TEXT | 사용자 이메일 | NOT NULL |
| locale | TEXT | 사용자 언어 설정 | DEFAULT 'ko-KR' |
| created_at | TIMESTAMP | 생성 시간 | DEFAULT now() |
| updated_at | TIMESTAMP | 수정 시간 | DEFAULT now() |

#### pets 테이블
반려 식물 및 동물 정보를 저장합니다.

| 필드명 | 타입 | 설명 | 제약조건 |
|-------|------|------|----------|
| id | UUID | 반려 생물 고유 ID | PRIMARY KEY |
| user_id | UUID | 소유자 ID | REFERENCES users(id), NOT NULL |
| name | TEXT | 반려 생물 이름 | NOT NULL |
| type | TEXT | 종류 (plant/pet) | NOT NULL, CHECK (type IN ('plant', 'pet')) |
| breed | TEXT | 품종 | NULL 허용 |
| photo_url | TEXT | 사진 URL | NULL 허용 |
| created_at | TIMESTAMP | 생성 시간 | DEFAULT now() |
| updated_at | TIMESTAMP | 수정 시간 | DEFAULT now() |

#### cares 테이블
케어 일정 정보를 저장합니다.

| 필드명 | 타입 | 설명 | 제약조건 |
|-------|------|------|----------|
| id | UUID | 케어 일정 고유 ID | PRIMARY KEY |
| pet_id | UUID | 반려 생물 ID | REFERENCES pets(id), NOT NULL |
| care_type | TEXT | 케어 종류 | NOT NULL |
| cycle_days | INTEGER | 반복 주기(일) | NOT NULL |
| next_date | DATE | 다음 케어 예정일 | NOT NULL |
| last_completed | DATE | 마지막 완료일 | NULL 허용 |
| created_at | TIMESTAMP | 생성 시간 | DEFAULT now() |
| updated_at | TIMESTAMP | 수정 시간 | DEFAULT now() |

### 2.2 인덱스

성능 최적화를 위한 인덱스 구성:

```sql
CREATE INDEX idx_pets_user_id ON public.pets(user_id);
CREATE INDEX idx_cares_pet_id ON public.cares(pet_id);
CREATE INDEX idx_cares_next_date ON public.cares(next_date);
```

### 2.3 관계 다이어그램

```
users (1) --- (*) pets (1) --- (*) cares
```

## 3. 보안 정책 (RLS)

### 3.1 Row Level Security 설정

모든 테이블에 RLS를 활성화하여 사용자가 자신의 데이터만 접근할 수 있도록 합니다.

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cares ENABLE ROW LEVEL SECURITY;
```

### 3.2 접근 정책

#### users 테이블 정책
```sql
CREATE POLICY users_policy ON public.users
  FOR ALL USING (auth.uid() = id);
```

#### pets 테이블 정책
```sql
CREATE POLICY pets_policy ON public.pets
  FOR ALL USING (auth.uid() = user_id);
```

#### cares 테이블 정책
```sql
CREATE POLICY cares_policy ON public.cares
  FOR ALL USING (
    pet_id IN (
      SELECT id FROM public.pets WHERE user_id = auth.uid()
    )
  );
```

## 4. 스토리지 구성

### 4.1 버킷 구조

```
pets-photos/
  ├─ [pet_id]/
  │   ├─ [pet_id]-[timestamp].jpg
  │   └─ ...
  └─ ...
```

### 4.2 스토리지 보안 정책

```sql
-- 인증된 사용자만 업로드 가능
CREATE POLICY "인증된 사용자 업로드 허용" ON storage.objects
  FOR INSERT TO authenticated USING (bucket_id = 'pets-photos');

-- 자신의 반려 생물 사진만 관리 가능
CREATE POLICY "소유자만 관리 가능" ON storage.objects
  FOR ALL USING (
    bucket_id = 'pets-photos' AND 
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM pets WHERE user_id = auth.uid()
    )
  );

-- 모든 사용자가 사진 조회 가능 (공개 URL)
CREATE POLICY "사진 공개 조회" ON storage.objects
  FOR SELECT USING (bucket_id = 'pets-photos');
```

## 5. 트리거 및 자동화

### 5.1 사용자 생성 트리거

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5.2 케어 완료 트리거

```sql
CREATE OR REPLACE FUNCTION public.update_next_care_date()
RETURNS TRIGGER AS $$
BEGIN
  -- 완료일 업데이트
  NEW.last_completed = CURRENT_DATE;
  -- 다음 일정 계산
  NEW.next_date = CURRENT_DATE + (NEW.cycle_days * INTERVAL '1 day');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_care_completed
  BEFORE UPDATE ON public.cares
  FOR EACH ROW
  WHEN (OLD.last_completed IS DISTINCT FROM NEW.last_completed)
  EXECUTE FUNCTION public.update_next_care_date();
```

## 6. 데이터베이스 사용 규칙

### 6.1 데이터 접근 규칙

1. **직접 SQL 쿼리 지양**: 항상 제공된 API 함수를 통해 데이터에 접근합니다.
   ```javascript
   // 잘못된 예:
   const { data } = await supabase.from('pets').select('*');
   
   // 올바른 예:
   const { pets } = await getUserPets();
   ```

2. **사용자 인증 확인**: 데이터 접근 전 항상 사용자 인증 상태를 확인합니다.
   ```javascript
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return { error: '인증 필요' };
   ```

3. **트랜잭션 사용**: 여러 테이블에 걸친 작업은 트랜잭션으로 처리합니다.

### 6.2 데이터 검증 규칙

1. **클라이언트 측 검증**: 모든 입력은 클라이언트에서 1차 검증합니다.
   ```javascript
   if (!petData.name) return { error: '이름은 필수입니다' };
   if (!['plant', 'pet'].includes(petData.type)) return { error: '유효하지 않은 타입' };
   ```

2. **서버 측 검증**: 데이터베이스 제약 조건으로 2차 검증합니다.

3. **날짜 형식 통일**: 모든 날짜는 ISO 형식(YYYY-MM-DD)으로 저장합니다.

### 6.3 성능 최적화 규칙

1. **필요한 필드만 조회**: 항상 필요한 필드만 명시적으로 선택합니다.
   ```javascript
   // 잘못된 예:
   const { data } = await supabase.from('pets').select('*');
   
   // 올바른 예:
   const { data } = await supabase.from('pets').select('id, name, type');
   ```

2. **페이지네이션 사용**: 대량의 데이터는 항상 페이지네이션을 적용합니다.
   ```javascript
   const { data } = await supabase
     .from('cares')
     .select('*')
     .range(0, 9); // 첫 10개 항목만 조회
   ```

3. **캐싱 활용**: 자주 사용되는 데이터는 클라이언트에 캐싱합니다.

### 6.4 오류 처리 규칙

1. **명시적 오류 처리**: 모든 데이터베이스 작업은 try-catch로 감싸고 오류를 명시적으로 처리합니다.
   ```javascript
   try {
     const { data, error } = await supabase.from('pets').select('*');
     if (error) throw error;
     return { pets: data };
   } catch (error) {
     console.error('데이터 조회 오류:', error);
     return { error: '데이터를 불러오는 중 문제가 발생했습니다' };
   }
   ```

2. **사용자 친화적 오류 메시지**: 기술적 오류 메시지를 사용자 친화적으로 변환합니다.

## 7. 데이터 마이그레이션 및 백업

### 7.1 마이그레이션 방법

1. SQL 파일을 사용한 스키마 관리
   ```bash
   # 마이그레이션 실행
   cat supabase/migrations.sql | psql $DATABASE_URL
   ```

2. 프로덕션 환경 전 테스트 환경에서 검증

### 7.2 백업 전략

1. 주기적 자동 백업 (Supabase Pro 기능 활용)
2. 중요 데이터 변경 전 수동 백업
3. 백업 복원 절차 문서화 및 테스트

## 8. 환경별 설정

### 8.1 개발 환경

```
# .env.development.local
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
```

### 8.2 프로덕션 환경

```
# Vercel 환경 변수
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
```

## 9. 모니터링 및 유지보수

1. **성능 모니터링**: Supabase 대시보드에서 쿼리 성능 모니터링
2. **오류 로깅**: 클라이언트 및 서버 오류 로깅 및 알림 설정
3. **정기 점검**: 인덱스 효율성, 데이터 일관성 정기 점검

---

이 문서는 Companion Care 프로젝트의 데이터베이스 설계와 사용 방법에 대한 가이드입니다. 프로젝트 진행 중 데이터베이스 관련 의사결정이나 변경사항이 있을 경우 이 문서를 업데이트하세요.