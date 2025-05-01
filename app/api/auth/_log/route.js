// NextAuth 로그 수집을 위한 API 라우트
export async function POST(req) {
  try {
    const body = await req.json();
    console.log('[AUTH_LOG]', body);
    return new Response('ok');
  } catch (error) {
    console.error('[AUTH_LOG_ERROR]', error);
    return new Response('error', { status: 500 });
  }
}

// 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";
