import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// API 라우트에서 headers에 접근하기 때문에 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

// 환경 변수 확인 및 로그
try {
  // 필수 환경 변수 확인
  if (!process.env.NEXTAUTH_SECRET) {
    console.error('❌ NEXTAUTH_SECRET 누락 - 필수 환경 변수');
  }
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ Google OAuth 자격 증명 누락 - GOOGLE_CLIENT_ID/SECRET 확인 필요');
  }

  console.log('✅ NextAuth 환경 변수 상태:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '설정됨' : '누락',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '설정됨' : '누락',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '설정됨' : '누락',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '설정됨' : '누락',
  });
} catch (error) {
  console.error('❌ 환경 변수 확인 중 오류:', error);
}

// 가장 기본적인 NextAuth 설정
console.log('✅ NextAuth 핸들러 초기화 시작');

let handler;

try {
  handler = NextAuth({
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || 'missing-client-id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing-client-secret',
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
  });
  
  console.log('✅ NextAuth 핸들러 초기화 성공');
} catch (error) {
  console.error('❌ NextAuth 핸들러 초기화 오류:', error);
  
  // 오류 발생 시 기본 응답 함수 생성
  const errorHandler = () => {
    return new Response(JSON.stringify({ error: 'NextAuth initialization failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  
  handler = { GET: errorHandler, POST: errorHandler };
}

// NextAuth 핸들러 내보내기
export { handler as GET, handler as POST };
