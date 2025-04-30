# fix-next14-metadata

Next.js 14 메타데이터 자동 수정 도구입니다. 이 도구는 Next.js 14에서 변경된 메타데이터 형식에 맞게 코드를 자동으로 수정합니다.

## 기능

- `metadata` 객체 내의 `themeColor`와 `viewport` 속성을 별도의 export로 분리
- 원본 파일 백업 (.bak 확장자)
- 다양한 파일 형식 지원 (.js, .jsx, .ts, .tsx)
- 테스트 모드 (--dry-run)
- CI/CD 통합 (--ci)

## 설치

```bash
# 로컬 설치
npm install -g fix-next14-metadata

# 또는 npx로 바로 실행
npx fix-next14-metadata
```

## 사용법

```bash
# 기본 실행 (app/ 디렉토리 내 모든 JS/TS 파일 처리)
fix-next14-metadata

# 테스트 모드 (실제 변경 없이 변경 예정 파일 확인)
fix-next14-metadata --dry-run

# 특정 확장자만 처리
fix-next14-metadata --ext .js,.jsx

# CI 모드 (백업 생성 안 함, 종료 코드로 성공 여부 표시)
fix-next14-metadata --ci
```

## 예시

### 변환 전:

```javascript
export const metadata = {
  title: 'My App',
  description: '...',
  themeColor: '#fff',
  viewport: 'width=device-width, initial-scale=1',
};
```

### 변환 후:

```javascript
export const themeColor = '#fff';
export const viewport = 'width=device-width, initial-scale=1';
export const metadata = {
  title: 'My App',
  description: '...',
};
```

## 라이센스

MIT
