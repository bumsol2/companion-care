# Companion Care UI/UX Design Guide  
*(스타일 : Minimal · Color Scheme : Analogous · Primary 500 : #A7D7A7)*

---

## 1. Design System Overview

| 항목 | 정의 |
|------|------|
| **디자인 목표** | “자연‧편안‧따뜻함”을 미니멀 UI로 전달, 사용자 집중도↑ + 정서적 안정감↑ |
| **핵심 키워드** | 자연스러운 · 편안한 · 따뜻한 · 심플한 · 가벼운 · 신뢰 · 부드러운 · 상쾌함 · 행복 · 정돈 · 친근함 · 긍정 |
| **타이포그래피** | `Pretendard` (KOR) / `Inter` (ENG)<br>• Display — 700/48 • Heading — 600/32∙24∙20 • Body — 400/16 • Caption — 400/14 |
| **아이콘** | `lucide-react` 24 px, 선 1.5 px, 라운드 코너 |
| **그리드** | **12-column** (desktop) / **4-column** (mobile) · 16 px gutter · 24 px margin |
| **모션** | 기본 150 ms ease-out · Toast 200 ms slide-up · Hover 80 ms scale 1.02 |
| **톤 & 매너** | 부드러운 곡선(8 px radius) + 여백 중심(Whitespace ≥ 컨텐츠의 40 %) |

---

## 2. TailwindCSS Color Palette

| 역할 | 50 | 100 | 200 | 300 | 400 | **500** | 600 | 700 | 800 |
|------|----|-----|-----|-----|-----|---------|-----|-----|-----|
| **primary** | #F1FAF1 | #E1F4E1 | #CFECCF | #BBE3BB | #A7DAA7 | **#A7D7A7** | #8EC08E | #75A975 | #5C935C |
| **secondary**<br>(yellow-green) | #FAFBEF | #F1F7D6 | #E4F0B3 | #D4E88E | #C4E06B | **#B2D84A** | #9AC137 | #819B2C | #697622 |
| **accent**<br>(blue-green) | #EFFBFB | #D8F4F4 | #B7ECEC | #92E2E2 | #6DD8D8 | **#4ACFCF** | #38B6B6 | #2D9393 | #246F6F |
| **neutral** | #FFFFFF | #F8F8F8 | #F2F2F2 | #E5E5E5 | #CCCCCC | #A6A6A6 | #808080 | #4D4D4D | #262626 |
| **positive** | – | – | – | – | – | **#5CB85C** |
| **warning** | – | – | – | – | – | **#F0AD4E** |
| **danger**  | – | – | – | – | – | **#D9534F** |

> **선정 근거**  
> - Analogous(유사색) : *primary* → *secondary*(yellow-green) → *accent*(blue-green)  
> - **500** 단계를 Tailwind `text-primary` / `bg-primary` 기본으로 지정하여 일관된 시각 흐름 유지.

---

## 3. Page Implementations

### 3.1 루트(/)

| 요소 | 내용 |
|------|------|
| **목적** | 첫 방문자 온보딩·가치 제안 전달 |
| **주요 컴포넌트** | Hero Section, Value Tiles(3 up), Call-to-Action(CTA) “Google로 시작”, Footer |
| **레이아웃** | 1단 Hero(100 vh) → 3단 Grid → CTA → Footer |
| **텍스트** | *“반려 케어, 놓치지 마세요*”<br>*“매일 6시 알림으로 안심하세요”* |
| **이미지** | `![Hero](https://picsum.photos/seed/greenplant/1600/900)` |

### 3.2 대시보드(/dashboard)

| 항목 | 설명 |
|------|------|
| **목적** | 반려 생물 상태·다가오는 케어 한눈에 |
| **키 컴포넌트** | 생물 카드(Grid 3·2·1), Upcoming List, Floating Add Button |
| **레이아웃** | 12col Grid → Card 4col(desktop)/6col(tablet)/full(mobile) |
| **카드 텍스트** | `{{petName}}`<br>`다음 물주기 D-{{n}}` |
| **이미지** | `https://picsum.photos/seed/{{petId}}/400/400` |

### 3.3 등록(/register)

| 요소 | 내용 |
|------|------|
| **목적** | 새 반려 생물·케어 주기 입력 |
| **단계** | (1) 기본정보 → (2) 사진 → (3) 케어주기 |
| **폼 필드** | 이름(필수) · 종류(식물/동물) · 품종(선택) · 사진 업로드 · 케어 종류 select · 주기 days input |
| **레이아웃** | Stepper 상단 고정 + 1col centered 600 px |

### 3.4 케어 일정(/care)

| 항목 | 내용 |
|------|------|
| **목적** | 모든 케어 일정 필터·관리 |
| **컴포넌트** | 필터 Bar(생물별, 기간별), Table, Pagination |
| **레이아웃** | Responsive Table(모바일 Card-list 변환) |

### 3.5 설정(/settings)

| 요소 | 설명 |
|------|------|
| **목적** | 프로필·알림 관리 |
| **세그먼트** | Profile Form / Notification Toggle |
| **레이아웃** | 좌측 탭(nav) + 우측 내용(>1024 px) / 상단 Tab(모바일) |

---

## 4. Layout Components

| 컴포넌트 | 라우트 | 설명 | 반응형 |
|----------|--------|------|--------|
| **Topbar** | 모든 페이지 | 로고, Nav, 알림, 아바타 | <768 px → Hamburger Drawer |
| **Hero** | `/` | 배경 이미지 + 메시지 | 배경 cover, 텍스트 중앙 |
| **PetCard** | `/dashboard` | 사진·이름·다음 일정 Badge | Grid Gap 24 px |
| **Add FAB** | `/dashboard` | `+` 버튼 → `/register` | 모바일 오른쪽 16 px |
| **Stepper** | `/register` | 진행률 3단계 | 모바일 sticky top |
| **Table** | `/care` | 인터랙티브 헤드·체크박스 | 모바일 accordion |

---

## 5. Interaction Patterns

| 패턴 | 적용 | 세부 |
|------|------|------|
| **Hover ↗ Lift** | 카드·버튼 | scale 1.02 / shadow-md |
| **Toast** | CRUD 성공·실패 | bottom-center, 4 s |
| **Modal** | 카드 편집 | Esc 닫기 · 배경 dim 40 % |
| **Pull-to-Refresh** | 모바일 대시보드 | 싱크 로딩 스피너 |

---

## 6. Breakpoints

```scss
$breakpoints: (
  'mobile': 320px,
  'tablet': 768px,
  'desktop': 1024px,
  'wide': 1440px
);
```

- **모바일 우선**: `min-width` 쿼리로 확장  
- Grid 변경 예시  
  ```css
  @screen tablet { .cards { grid-template-columns: repeat(2,1fr);} }
  @screen desktop{ .cards { grid-template-columns: repeat(3,1fr);} }
  ```

---

### ✔︎ 디자인 결정 근거

1. **미니멀 + 아날로그 컬러** → 시각적 소음 최소화, 정돈된 인상으로 신뢰감 형성  
2. **12col 그리드** → 컴포넌트 재사용성·스크린 적응성 향상  
3. **큰 여백·곡선 Radius 8 px** → ‘부드럽고 편안한’ 무드 강화  
4. **모션 150 ms** → 경쾌하지만 산만하지 않은 속도  
5. **Picsum Placeholder** → 개발 초기 이미지 자리 확보, 실제 출시 시 사용자 사진 대체

---

> 이 가이드를 기반으로 Figma 컴포넌트 라이브러리를 생성하고, Tailwind `tailwind.config.ts`에 색상·breakpoints를 정의하면 바로 프로덕션 코드에 반영할 수 있습니다.