# Companion Care – 상세 Use Case 문서

> 본 문서는 PRD와 IA를 기반으로 **Companion Care** MVP 범위에서 요구되는 사용 시나리오를 상세화한 것입니다.  
> 모든 UI 텍스트·알림·오류 메시지는 한국어를 기본으로 합니다.

---

## 1. 행위자 정의 (Actor Definitions & Comprehensive Actor Definitions)

| 행위자 | 유형 | 책임 |
|--------|------|------|
| **일반 사용자** | Primary | 구글 로그인, 반려 생물·케어 일정 등록·수정·삭제, 알림 확인, 완료 처리 |
| **시스템(백엔드)** | Supporting | 인증 토큰 검증, 데이터 저장·조회, 주기 계산, 이메일 발송 트리거 |
| **이메일 서비스(Nodemailer + SMTP)** | External | 시스템으로부터 발송 요청 → 이메일 전달 |
| **Authentication Provider(Google OAuth)** | External | 사용자 신원 확인 및 토큰 발급 |
| **일정 크론 스케줄러(Vercel Cron)** | Supporting | 매일 06:00 KST 케어 예정 조회 → 발송 큐 생성 |
| **Supabase DB & Storage** | Supporting | 사용자·반려 생물·케어 일정·알림 로그 영속화, 사진 저장 |
| **접근성 보조 도구(Screen Reader)** | Secondary | 시각 장애 사용자의 UI 내비게이션 지원 |

---

## 2. 핵심 Use Case 시나리오 (Use Case Scenarios & Detailed Use Case Scenarios)

| UC ID | 제목 | 주요 행위자 | 목표 |
|-------|------|------------|------|
| **UC-01** | 구글 소셜 로그인 | 일반 사용자 | 계정을 생성·인증하고 서비스에 진입 |
| **UC-02** | 반려 생물 등록 | 일반 사용자 | 생물 정보·사진·대표 케어 주기를 입력 |
| **UC-03** | 케어 일정 등록 | 일반 사용자 | 반복 주기·다음 예정일 지정 |
| **UC-04** | 대시보드 조회 | 일반 사용자 | 등록 생물 카드·다가오는 일정 확인 |
| **UC-05** | 알림 이메일 수신 및 완료 처리 | 일반 사용자 | 예정일 도착 시 알림 확인 → ‘완료’ 버튼으로 주기 갱신 |
| **UC-06** | 케어 일정 편집/삭제 | 일반 사용자 | 기존 일정 수정 또는 제거 |
| **UC-07** | 알림 설정 ON/OFF | 일반 사용자 | 이메일 알림 수신 여부 토글(1.1 버전) |

---

## 3. 메인 단계 및 이벤트 흐름  
(Main Steps / Main Steps and Flow of Events)

### UC-01 구글 소셜 로그인

1. 사용자가 **‘Google로 계속’** 버튼 클릭  
2. NextAuth가 Google OAuth 엔드포인트 호출  
3. 사용자가 구글 계정 선택·동의 → Google 토큰 반환  
4. NextAuth가 토큰 검증, 세션 JWT 발급  
5. 시스템이 신규 사용자인지 확인 → 최초 로그인 시 `/welcome` 리다이렉트  
6. 성공 토스트 “로그인 되었습니다”

### UC-05 알림 이메일 수신 및 완료 처리

1. **06:00 KST**, Vercel Cron → 오늘 예정 케어 쿼리  
2. 시스템이 Nodemailer에 발송 요청  
3. 이메일에 **‘완료하기’** 딥링크(`/care/:id?complete=true`) 포함  
4. 사용자가 링크 클릭 → 토큰·세션 확인  
5. Care ID를 기반으로 일정 상태 `complete` 업데이트, 다음 주기 계산(RRULE)  
6. 대시보드로 리다이렉트 + 토스트 “케어 완료!”  

---

## 4. 대안 흐름 및 엣지 케이스  
(Alternative Flows and Edge Cases)

| UC | 상황 | 대안 흐름 |
|----|------|-----------|
| UC-01 | OAuth 동의 거부 | “서비스 이용을 위해 구글 인증이 필요합니다” 안내 후 재시도 유도 |
| UC-02 | 사진 업로드 실패 | ① 네트워크 retry 5 초 * 3 → ② 로컬 IndexedDB 임시 저장 후 백오프 업로드 |
| UC-05 | 이메일 클릭 시 세션 만료 | 로그인 페이지로 리디렉트 → 완료 api 콜 다시 시도 |
| UC-05 | SMTP 서버 오류 | 발송 실패 로그 기록, 15 분 후 재시도, 3 회 실패 시 관리 메일 전송 |
| UC-06 | 주기 변경으로 과거 날짜 입력 | UI 경고 “다음 예정일은 오늘 이후여야 합니다” |

---

## 5. 전제조건·사후조건  
(Preconditions / Postconditions)

| UC | 전제조건 | 사후조건 |
|----|----------|----------|
| UC-02 | UC-01 성공, 네트워크 연결 | 생물 row 생성, 기본 케어 주기(물주기 7 일) 저장 |
| UC-03 | 최소 1 생물 존재 | Care row 생성, 다음 예정일 ≥ 오늘 |
| UC-05 | 케어 row `next_date = 오늘` | `last_completed` 업데이트, `next_date` + 주기 계산 |

---

## 6. 비즈니스 규칙·제약  
(Business Rules and Constraints)

1. **주기 최소값** = 1 일, 최대값 = 365 일  
2. 사용자당 반려 생물 최대 30 개(무료 플랜)  
3. 이메일 발송 시간대는 **사용자 로컬(KST) 06:00 ±10 분**  
4. 알림 미완료 N 회(기본 3) 초과 시 ‘주의’ 배지 표시  
5. 데이터 보존: 사용자가 계정 삭제 시 30 일 내 완전 파기(GDPR Right to Erase 유사)

---

## 7. 예외 처리 절차  
(Exception Handling & Exception Handling Procedures)

| 오류 코드 | 설명 | 사용자 메시지 | 로깅·복구 |
|-----------|------|---------------|-----------|
| **E-AUTH-401** | 토큰 만료 | “세션이 만료되었습니다. 다시 로그인해 주세요.” | 서버 warn → `/auth` 리다이렉트 |
| **E-IMG-413** | 이미지 용량 초과(>5 MB) | “5 MB 이하 이미지만 업로드 가능합니다” | 업로드 취소 |
| **E-SMTP-504** | 메일 서버 타임아웃 | 사용자 표시 없음(백엔드 재시도) | 실패 카운트 +1, 15 분 후 재전송 |

---

## 8. UI 고려사항  
(User Interface Considerations)

- **ARIA Role** `role="menubar"`, `aria-label`로 내비게이션 식별  
- Stepper 폼: 현재 단계 텍스트 대체 → 스크린리더 공지  
- 컬러 대비 WCAG AA(4.5:1) 이상  
- 모바일 < 768 px: 햄버거 메뉴, 탭 포커스가 숨겨진 사이드바로 이동하지 않도록 `inert` 처리  
- Toast 알림은 `aria-live="polite"` 영역에 삽입

---

## 9. 데이터 요건·데이터 흐름  
(Data Requirements and Data Flow)

```plaintext
[Browser] ──REST/GraphQL──> [API Route (Next.js)]
     │                            │
     │                    RLS 인증(JWT)
     ▼                            ▼
IndexedDB(오프라인 캐시)  <──Sync──> Supabase PostgreSQL
                                   │
                           [Cron]  │ 06:00
                                   ▼
                            Nodemailer → SMTP 서버 → 수신자
```

### 핵심 테이블 요약

| 테이블 | 필드(주요) | 설명 |
|--------|-----------|------|
| users | id, email, locale | NextAuth ID 매핑 |
| pets | id, user_id, name, type, breed, photo_url | 반려 생물 |
| cares | id, pet_id, care_type, cycle_days, next_date, last_completed | 케어 일정 |
| notif_log | id, care_id, sent_at, status | 이메일 발송 이력 |

---

## 10. 보안·프라이버시 고려  
(Security and Privacy Considerations)

1. **OAuth 2.0** PKCE Flow + HTTPS 전송  
2. Supabase Row-Level Security: `user_id = auth.uid()`  
3. JWT `httponly` 쿠키, SameSite=Lax  
4. 사진 Storage: 서명 URL 60 분 만료  
5. 개인정보(이메일, 프로필) AES-256 at rest  
6. **GDPR/한국 개인정보보호법** 준수: 이용약관·삭제 요청 UI 제공  
7. SMTP 자격 증명 환경변수 암호화(Vercel Encrypted Secrets)

---

> 이 문서를 통해 개발·디자인 팀은 명확한 이벤트 흐름과 예외 조건을 공유하고, QA 시나리오 작성 및 접근성 리뷰의 기준으로 활용할 수 있습니다.