# 🔧 Companion Care – Setup Guide

이 가이드는 개발 환경을 빠르게 구성하고 실행하는 데 필요한 정보를 제공합니다.

---

## 1️⃣ 설치

```bash
git clone https://github.com/yourname/companion-care.git
cd companion-care
npm install
```

---

## 2️⃣ 환경 변수 설정

루트 디렉토리에 `.env.local` 파일을 생성하고 다음 항목을 채워주세요:

```env
# === Supabase 설정 ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# === NextAuth 설정 ===
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# === Stripe (선택, 추후 결제 기능에 필요) ===
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

📌 참고:
- `.env.local` 파일은 `.gitignore`에 포함되어 있어야 하며 **절대 공유하지 마세요**.
- 변경 후 서버 재시작 필요.

---

## 3️⃣ 개발 서버 실행

```bash
npm run dev
```

→ 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 4️⃣ 테스트 빌드 (로컬 프로덕션 환경)

```bash
npm run build && npm start
```

---

## 5️⃣ 린트 및 코드 포맷

```bash
npm run lint
npm run format
```

- ESLint 및 Prettier 설정이 적용되어 있습니다.

---

## 6️⃣ 필수 요구사항

| 항목 | 버전 |
|------|------|
| Node.js | 18.x 이상 |
| npm     | 9.x 이상 |

---

## 7️⃣ 주요 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 생성 |
| `npm start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 포맷 적용 |

---

## 8️⃣ 배포 가이드 (Vercel 기준)

### 일반 배포
```bash
vercel --prod
```

### 강제 배포 (빌드 캐시 무시)
```bash
vercel --prod --force
```

---

## 9️⃣ 추가 참고 사항

- **PWA** 기능은 현재 비활성화되어 있으며, 관련 파일은 `public/backup-pwa/`에 백업됨
- 빌드 트레이스 오류가 발생할 경우 `next.config.js` 내 `experimental.outputFileTracingRoot` 설정 확인
- `.vercelignore` 파일에 빌드 제외 항목 (`sw.js`, `custom-sw.js` 등)이 명시되어 있어야 합니다

---