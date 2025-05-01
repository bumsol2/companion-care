// NextAuth 로그 API 엔드포인트
import { NextResponse } from 'next/server';

// 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

// POST 요청 처리
export async function POST(req) {
  try {
    // 요청 본문 파싱 시도
    const body = await req.json().catch(() => ({}));
    
    // 로그 출력 (실제 서버 로그에 기록됨)
    console.log('[AUTH_LOG]', body);
    
    // 성공 응답
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    // 오류가 발생해도 200 OK 반환 (클라이언트 측 오류 방지)
    return NextResponse.json({ status: 'ok' });
  }
}
