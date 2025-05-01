import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// API 라우트에서 headers에 접근하기 때문에 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

// 환경 변수 디버깅 로그
console.log('NextAuth 환경 변수 상태:', {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '설정됨' : '누락',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '설정됨' : '누락',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '설정됨' : '누락',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '설정됨' : '누락',
});

// NextAuth 기본 설정 - 직접 인라인으로 정의
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: true, // 디버그 모드 활성화
  callbacks: {
    async session({ session, token }) {
      console.log('✅ session callback 호출됨');
      return session;
    },
    async jwt({ token, account }) {
      console.log('✅ jwt callback 호출됨');
      return token;
    }
  },
});

console.log('✅ [...nextauth]/route.js 파일 로드됨');

export { handler as GET, handler as POST };
