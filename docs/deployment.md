# 🚀 배포 가이드

## 1. Vercel 배포

### 배포 준비
1. [Vercel](https://vercel.com) 계정 생성 및 로그인
2. GitHub 저장소와 연결 또는 로컬 프로젝트 배포
3. 환경 변수 설정 (Vercel 대시보드)

### 환경 변수 설정
Vercel 프로젝트 대시보드 > Settings > Environment Variables에 다음 항목 추가:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=
```

### 배포 명령어
```bash
# CLI로 배포 (로컬에서)
vercel --prod

# 강제 배포 (캐시 무시)
vercel --prod --force

# 특정 디렉토리 배포
vercel --prod ./path/to/project
```

### 배포 설정 (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## 2. 환경별 설정

### 개발 환경 (.env.development)
```
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 프로덕션 환경 (.env.production)
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
```

## 3. CI/CD 설정

### GitHub Actions 워크플로우 (.github/workflows/deploy.yml)
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 필요한 GitHub Secrets
- `VERCEL_TOKEN`: Vercel API 토큰
- `VERCEL_ORG_ID`: Vercel 조직 ID
- `VERCEL_PROJECT_ID`: Vercel 프로젝트 ID

## 4. 배포 관련 주의사항

### PWA 설정
현재 PWA 관련 설정은 빌드 오류로 인해 비활성화되어 있습니다:
- `next-pwa` 패키지 제거됨
- `next.config.js`에서 PWA 관련 코드 제거됨
- 서비스 워커 파일들은 `public/backup-pwa/`로 백업됨

### 빌드 트레이스 설정
빌드 트레이스 수집 과정에서 발생하는 `Maximum call stack size exceeded` 오류를 방지하기 위해 다음 설정 적용:

```javascript
// next.config.js
experimental: {
  outputFileTracingRoot: null,
  outputFileTracingExcludes: {
    '*': ['**/*'],
  },
}
```

### .vercelignore 파일
다음 파일들은 배포 시 제외됩니다:
```
public/sw.js
public/sw.js.map
public/workbox-*
public/manifest.json
public/backup-pwa/
.next/
node_modules/
```

## 5. 배포 후 확인사항

### 필수 체크리스트
- [ ] 환경 변수가 올바르게 설정되었는지 확인
- [ ] API 엔드포인트가 정상 작동하는지 확인
- [ ] 인증 기능이 정상 작동하는지 확인
- [ ] 정적 자산(이미지, 폰트 등)이 올바르게 로드되는지 확인
- [ ] 반응형 디자인이 모든 디바이스에서 정상 작동하는지 확인

### 모니터링 도구
- Vercel Analytics: 사용자 경험 및 성능 모니터링
- Sentry: 오류 추적 및 모니터링
- Google Analytics: 사용자 행동 분석
