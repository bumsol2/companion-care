import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // 인증 콜백 경로는 미들웨어 처리를 통과시켜야 함
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next(); // 통과시켜야 세션 저장 가능
  }
  
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 세션이 없고 대시보드 페이지로 이동하려는 경우 로그인 페이지로 리디렉션
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/callback'],
};
