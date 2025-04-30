# 🗓 Changelog

## 2025-04-30: Next.js 14 메타데이터 자동화 및 Vercel 배포 문제 해결

### 해결한 문제

#### 1. Vercel 배포 시 `Maximum call stack size exceeded` 오류
- **원인**: micromatch 라이브러리의 무한 재귀 호출 (next-pwa 관련)
- **해결책**: 
  - next-pwa 패키지 완전 제거 (`npm uninstall next-pwa`)
  - next.config.js에서 PWA 관련 코드 제거
  - 빌드 트레이스 수집 비활성화 설정 추가
  - PWA 관련 파일 백업 (`public/backup-pwa/`)
  - .vercelignore 파일 생성

#### 2. Next.js 14 메타데이터 호환성 문제
- **원인**: Next.js 14에서 `themeColor`와 `viewport`는 메타데이터와 별도로 export 해야 함
- **해결책**:
  - ESLint 커스텀 룰 개발
  - Codemod 스크립트 개발
  - CLI 도구 패키징

### 개발한 도구

#### ESLint 커스텀 룰
- `no-metadata-themeColor-viewport`: 메타데이터 객체에서 themeColor와 viewport 분리 여부 검사
- `no-inline-metadata-themeColor-viewport`: 인라인 메타데이터에서 themeColor와 viewport 포함 여부 검사

#### Codemod 스크립트
- `fix-metadata-themeColor-viewport.js`: 메타데이터 속성 분리
- `add-dynamic-force-for-server-components.js`: SSR 컴포넌트에 dynamic 속성 추가
- `fix-metadata-and-force-dynamic.js`: 위 두 기능 통합
- `fix-inline-metadata.js`: 인라인 메타데이터 수정

#### CLI 도구
- `fix-next14-metadata`: 메타데이터 자동 변환 CLI

### 테크니컬 노트

#### next.config.js 주요 변경사항
```javascript
// next-pwa 제거
// const withPWA = require('next-pwa')({ ... }); // 제거

const nextConfig = {
  // ...
  // 빌드 트레이스 수집 비활성화
  experimental: {
    outputFileTracingRoot: null,
    outputFileTracingExcludes: {
      '*': ['**/*'],
    },
  },
};

// module.exports = withPWA(nextConfig); // 제거
module.exports = nextConfig; // 변경
```

#### .vercelignore 주요 설정
```
# PWA 관련 파일 제외
public/sw.js
public/sw.js.map
public/workbox-*
public/manifest.json
public/backup-pwa/
```

### 향후 계획
- [ ] GitHub Actions CI 통합 (ESLint 규칙 검사)
- [ ] Stripe 결제 연동 구현
- [ ] UI 컴포넌트 개선
- [ ] 필요시 PWA 기능 대체 방안 검토
