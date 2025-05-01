import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// API 라우트에서 headers에 접근하기 때문에 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

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
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST };
