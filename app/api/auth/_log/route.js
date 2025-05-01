// NextAuth 로그 API 엔드포인트
import { NextResponse } from 'next/server';

// 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({ status: 'ok' });
}
