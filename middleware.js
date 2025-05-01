import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // NextAuth API 경로는 미들웨어 처리를 통과시켜야 함
  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    console.log('✅ NextAuth API 경로 처리 통과:', req.nextUrl.pathname);
    return NextResponse.next();
  }
  
  // 인증 콜백 경로는 미들웨어 처리를 통과시켜야 함
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next(); // 통과시켜야 세션 저장 가능
  }
  
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 세션이 없고 대시보드 페이지로 이동하려는 경우 로그인 페이지로 리디렉션
    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  } catch (error) {
    console.error('❌ 미들웨어 세션 처리 오류:', error);
    // 오류 발생시에도 요청을 계속 처리
  }

  return res;
}

export const config = {
  // NextAuth API 경로를 명시적으로 제외하고 필요한 경로만 처리
  matcher: [
    '/dashboard/:path*', 
    '/auth/callback',
    // '/api/auth/:path*' 경로는 제외 - NextAuth가 처리하도록 함
  ],
};
