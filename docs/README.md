# Companion Care

반려동물 케어 관리를 위한 올인원 솔루션입니다.

## 문서 가이드

이 프로젝트의 문서는 다음과 같이 구성되어 있습니다:

- [Changelog](./changelog.md) - 주요 변경 사항 및 업데이트 내역
- [Setup Guide](./setup.md) - 개발 환경 설정 및 배포 가이드
- [Business Model](./business.md) - 비즈니스 모델 및 수익화 전략

## 프로젝트 구조

```
Companion/
├── app/               # Next.js 애플리케이션 코드
├── components/        # 재사용 가능한 UI 컴포넌트
├── lib/               # 유틸리티 및 헬퍼 함수
├── public/            # 정적 파일
├── scripts/           # 자동화 스크립트
├── eslint-rules/      # 커스텀 ESLint 규칙
├── fix-next14-metadata/ # 메타데이터 자동화 CLI 도구
├── docs/              # 프로젝트 문서
└── require/           # 요구사항 및 설계 문서
```

## 기술 스택

- **프론트엔드**: Next.js 14, React, TailwindCSS
- **백엔드**: Next.js API Routes, Supabase
- **인증**: NextAuth.js, Supabase Auth
- **데이터베이스**: PostgreSQL (Supabase)
- **배포**: Vercel
- **결제**: Stripe (구현 예정)

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 주요 기능

- 반려동물 프로필 관리
- 케어 일정 관리 및 알림
- 건강 기록 추적
- 맞춤형 케어 추천
- 프리미엄 구독 서비스 (구현 예정)

## 라이센스

개인 프로젝트로, 모든 권리 보유.
