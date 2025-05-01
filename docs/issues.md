# 🛠️ Companion Care – 문제점 및 해결 방법

이 문서는 프로젝트 개발 중 발생한 주요 문제점과 해결 방법을 기록합니다.

## 🔍 주요 문제점 및 해결 방법

### 1. ❌ NextAuth 세션 API 500 오류
**원인**: `/api/auth/session` 엔드포인트에서 500 Internal Server Error 발생

**해결 방법**:
- NextAuth 설정에 명시적인 세션 전략 추가: `session: { strategy: 'jwt' }`
- 미들웨어에서 NextAuth API 경로 처리 확인
- 환경 변수 설정 확인 (NEXTAUTH_URL, NEXTAUTH_SECRET)

### 2. ❌ manifest.json 404 오류
**원인**: App Router(`app/manifest.js`)와 정적 파일(`public/manifest.json`) 방식이 동시에 사용되어 충돌 발생

**해결 방법**:
- `app/layout.js`에서 `<link rel="manifest" href="/manifest.json" />` 태그 제거
- App Router 방식으로 통일

### 3. ❌ sw.js 404 오류
**원인**: 서비스 워커 등록 시 `sw.js` 파일을 찾을 수 없음

**해결 방법**:
- 서비스 워커 등록 코드 임시 비활성화 (`registerServiceWorker = false`)
- 파일 존재 여부를 확인하는 로직 추가
- 나중에 Workbox를 사용하여 PWA 기능 활성화 예정

### 4. ❌ CLIENT_FETCH_ERROR
**원인**: 세션 API 문제로 인해 JSON 파싱 실패

**해결 방법**:
- NextAuth API 경로 설정 수정
- `Accept: 'application/json'` 헤더 추가

### 5. ❌ _log 405 에러
**원인**: next-auth의 client 로그를 `/api/auth/_log`로 전송하려고 하나 해당 API가 없음

**해결 방법**:
- 무시 가능 (로그 API 없으면 발생)
- 필요 시 logger 커스터마이징으로 차단 가능

## 🧩 즉시 수정이 필요한 항목

| 항목 | 상태 |
|------|------|
| 서비스 워커 등록 코드 제거 | ✅ 완료 |
| PWA 관련 파일 제거 (manifest.json, sw.js) | ✅ 완료 |
| NextAuth 세션 API 구성 | ✅ 완료 |
| 로그 전송 오류 | 🚫 무시 가능 |

## ✨ 마무리 체크리스트

- [x] navigator.serviceWorker.register 제거 또는 조건부 처리
- [x] manifest.json 충돌 해결 (App Router 방식으로 통일)
- [x] next-auth API 라우트 구현 및 설정

## 📝 기타 참고사항

- Vercel 배포 시 "Maximum call stack size exceeded" 오류는 next.config.js의 파일 트레이싱 설정으로 해결
- PWA 기능은 나중에 Workbox를 사용하여 다시 활성화할 예정
- NextAuth와 Supabase 인증 시스템 충돌에 주의
