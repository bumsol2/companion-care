import GoogleProvider from "next-auth/providers/google";

// 환경 변수 확인 로그
console.log('✅ lib/auth.js - 환경 변수 상태:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '설정됨' : '누락',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '설정됨' : '누락',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '설정됨' : '누락',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '설정됨' : '누락',
});

// 중복된 secret 속성 제거
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  callbacks: {
    async session({ session, token }) {
      // 세션에 사용자 ID 추가
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
