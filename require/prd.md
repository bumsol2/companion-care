# Companion Care – Product Requirements Document (PRD)

## 1. 상세 제품 설명 (Detailed Product Description)

### 1.1 비전  
“Companion Care는 바쁜 일상을 사는 1인 가구가 반려식물·반려동물을 책임감 있게 돌볼 수 있도록 ‘까먹을 틈 없는’ 케어 동반자가 된다.”

### 1.2 문제 정의  
- **케어 일정 누락** : 반려식물 물주기, 반려동물 산책·예방접종 등을 정기적으로 챙기지 못해 건강 리스크·스트레스 증가  
- **툴 과부하** : 캘린더·메모·알람 앱을 흩어 쓰다 보니 관리 효율 저하  
- **초보자 정보 부족** : ‘언제 물 줘야 할까?’ 같은 기초 정보를 매번 검색

### 1.3 해결 방안  
- **원스톱 대시보드**로 반려 생물과 케어 주기를 한 눈에 보기  
- **주기 기반 알림** + **이메일** 발송 = 놓치기 어려운 리마인더  
- **웹·PWA·Android 웹뷰**로 설치 부담 없는 크로스 플랫폼 경험

### 1.4 성공 지표 (예시)  
| 지표 | 목표값 (M+6) |
|------|--------------|
| 월간 활성 이용자(MAU) | 3만 명 |
| 알림 오픈율 | 70% 이상 |
| 케어 일정 완료율 | 80% 이상 |
| 사용자 NPS | 50 점 이상 |

---

## 2. 참고 서비스 및 근거 (Reference Services with Detailed Rationale)

| 서비스 | 핵심 기능 · 특징 | 우리에게 주는 시사점 |
|--------|-----------------|-----------------------|
| **Planta** | 개별 식물별 물주기·비료·분갈이 일정 자동 계산, **푸시·이메일 알림** 제공  ([Planta: Plant care app - Keep your plants alive](https://getplanta.com/?utm_source=chatgpt.com), [I'm not getting notifications / task reminders - Planta Help Center](https://support.getplanta.com/im-not-getting-notifications-task-reminders/?utm_source=chatgpt.com)) | 주기·알림 로직, Snooze 기능(알림 연기) UX 참고 |
| **Blossom** | AI 사진 인식으로 식물 종류·관리법 제시, 초보 친화 가이드  ([Plant Identification - Blossom](https://blossomplant.com/features/plant-identification?utm_source=chatgpt.com)) | 향후 “사진으로 식물 등록·자동 주기 계산” 확장 아이디어 |
| **11pets** | 예방접종·투약·미용 일정을 다채널(앱·이메일)로 리마인드, 건강 기록 관리  ([11pets](https://www.11pets.com/en/home?utm_source=chatgpt.com), [11pets: Pet care - Apps on Google Play](https://play.google.com/store/apps/details?hl=en_US&id=com.m11pets.elevenpets&utm_source=chatgpt.com)) | 반려동물 측 기능·UI 구조, 건강 이력 저장 모델 참고 |
| **PetDesk** | 수의사 예약 2일 전 **자동 이메일·푸시·SMS** 리마인더, 사용자가 채널 선택 가능  ([Everyone Wins With Veterinary Appointment Reminders - PetDesk](https://petdesk.com/veterinary-appointment-reminders/?utm_source=chatgpt.com), [Appointment Reminder Notifications - PetDesk Help Center](https://petdesk.zendesk.com/hc/en-us/articles/15346357005587-Appointment-Reminder-Notifications?utm_source=chatgpt.com)) | 채널별 옵트인/옵트아웃 UX, 일정 확인·취소 CTA 패턴 도입 |

---

## 3. 핵심 기능 및 명세 (Core Features and Specifications)

| 분류 | 기능 | 세부 명세 (요약) | 우선순위 |
|------|------|-----------------|-----------|
| **2.1 사용자 인증** | Google 소셜 로그인 | NextAuth v5 + Google OAuth, 이메일 검증 옵션 | ★★★ |
| **2.2 반려 생물 등록** | 이름·종류·품종·사진 업로드 | Supabase Storage 이미지 저장, 사용자별 row-level security | ★★★ |
| **2.3 케어 일정 등록** | 케어 종류·주기·다음 날짜 | 반복 RRULE 생성 → 로컬 IndexedDB + Supabase Sync | ★★★ |
| **2.4 대시보드** | 카드 리스트 + 다가오는 일정 하이라이트 | Tailwind Grid, Shadcn Card·Badge 컴포넌트 | ★★★ |
| **2.5 이메일 알림** | 일정 D-day 새벽 6 시 발송 | Nodemailer SMTP(Gmail), CRON-Vercel Scheduler | ★★★ |
| **2.6 사용자 설정** | 프로필, 알림 ON/OFF | MVP 이후(버전 1.1) | ★★ |

> **수락 기준(예)** : 케어 다음 날짜가 도달하면 ±10 분 이내 이메일이 도착하고, ‘완료’ 버튼을 클릭하면 자동으로 다음 주기가 갱신된다.

---

## 4. 추가 제안 기능 (Suggested Additional Features)

| 제안 기능 | 가치 | 난이도 | 릴리스 후보 |
|-----------|------|--------|--------------|
| 📸 **AI 식물 사진 등록** | 초보자 진입 장벽↓, 데이터 입력 속도↑ | 중 | 버전 1.2 |
| 🐾 **체중·건강 차트** | 반려동물 헬스케어 강화 | 중 | 1.3 |
| 🔔 **PWA 푸시 알림** | 앱 설치 없이 실시간 리마인더 | 중 | 1.0.1 |
| 🗂 **CSV 내보내기** | 백업·수의사 공유 | 낮음 | 1.1 |
| 👫 **가족·룸메이트 공유** | 여러 사용자 공동 관리 | 높음 | 1.4 |
| 🛍 **소모품 자동 재구매 링크** | 사료·분갈이 흙 리필 연계 수익화 | 중 | 1.3 |

---

## 5. 사용자 페르소나 및 시나리오 (User Persona and Scenarios)

### 5.1 페르소나 요약

| ID | 주요 특징 | 페인포인트 | 동기 |
|----|-----------|------------|------|
| **Solo-Plant** (1인 가구) | 28세 직장인, 몬스테라·선인장 보유 | 물주기 자주 잊음 | “출근 전에 핸드폰으로 물 줄 날 알려줘” |
| **Plant-Rookie** (초보) | 22세 대학생, 허브 키우기 입문 | 주기·햇빛 정보 부족 | “간단 가이드와 일정 한 번에 보고 싶다” |
| **Pet-Parent** (반려동물 오너) | 35세 직장인, 소형견 양육 | 예방접종, 미용 스케줄 놓침 | “접종 날짜를 이메일로 받아야 안 잊어” |
| **Light-User** | 설치 부담 큰 앱 기피 | 복잡한 회원가입 싫어 | “웹에서 구글 로그인 한 번이면 끝!” |

### 5.2 핵심 시나리오

1. **Solo-Plant**가 구글 로그인 → 화분 사진 업로드 → “물주기 7 일” 설정 → 다음 주기 D-1에 이메일 알림 수신 → 클릭 후 ‘완료’ 처리가 자동 반복.  
2. **Pet-Parent**가 강아지 예방접종(6 개월 주기) 등록 → 알림 ON → 2 일 전 이메일 도착 → 병원 예약 완료 후 Companion Care에 ‘완료’ → 다음 주기 생.  

---

## 6. 기술 스택 권장사항 (Technical Stack Recommendations)

| 레이어 | 선택 기술 | 이유 · 메모 |
|--------|-----------|-------------|
| **프런트엔드** | Next.js 15 (App Router) + TailwindCSS + Shadcn UI | CSR·SSR 혼합, 빠른 컴포넌트 개발 |
| **PWA** | next-pwa 플러그인 | 오프라인 캐싱, 푸시 알림 대응 |
| **모바일(Android)** | React Native Webview Wrapper | 스토어 배포 최소화, 코드베이스 단일화 |
| **인증** | NextAuth v5 + Google OAuth | 1-클릭 로그인, 이메일 검증 옵션 |
| **스토리지** | 1) **IndexedDB(LocalForage)** – 오프라인 우선<br>2) **Supabase PostgreSQL** – 온라인 동기화 | ‘local(no-database)’ 요구 대응 + 동시성·백업 확보 |
| **파일 저장** | Supabase Storage | 사진 업로드 |
| **알림** | Nodemailer (서버리스 Cron) → 이메일 | Gmail SMTP (free tier), 향후 Push 추가 |
| **호스팅/배포** | Vercel | Serverless Edge Functions, Cron Jobs 지원 |

> **트레이드오프** : 순수 로컬 스토리지만 사용 시 기기 교체·브라우저 초기화에 데이터가 손실될 수 있어, **오프라인-퍼스트 + 온라인 동기화** 모델을 권장.

---

### 부록: 릴리즈 로드맵(제안)

| 버전 | 기간 | 포함 기능 |
|------|------|-----------|
| **v1.0 (M+2)** | 핵심 6대 기능, PWA, 이메일 알림 |
| **v1.0.1** | M+3 | Web Push 알림 |
| **v1.1** | M+4 | 사용자 설정·CSV 내보내기 |
| **v1.2** | M+6 | AI 사진 식별, 건강 차트 |
| **v1.3** | M+8 | 소모품 자동 구매 연동, 가족 공유 (β) |

---

> **결론**  
> Companion Care는 검증된 레퍼런스 앱의 ‘주기·알림’ 모델을 웹·PWA·Android에 최적화해, **초보자부터 경험자까지 ‘놓칠 수 없는 케어 경험’을 제공**하는 것을 목표로 한다.