import GoogleProvider from "next-auth/providers/google";

// 환경 변수 확인 로직 추가 - 더 자세한 로그 추가
try {
  console.log("NextAuth Environment Variables Check:", {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "설정됨" : "누락",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "설정됨" : "누락",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "설정됨" : "누락",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "설정됨" : "누락",
    NODE_ENV: process.env.NODE_ENV
  });
} catch (error) {
  console.error("Error logging environment variables:", error);
}

// 필수 환경 변수 확인
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is missing - required for getServerSession");
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Google OAuth credentials are missing - GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET not found");
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      try {
        if (token) {
          session.user.id = token.sub;
          session.accessToken = token.accessToken;
        }
        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session; // 오류가 발생해도 기본 세션 반환
      }
    },
    async jwt({ token, account }) {
      try {
        // 초기 로그인 시 계정 정보 추가
        if (account) {
          token.accessToken = account.access_token;
          token.provider = account.provider;
        }
        return token;
      } catch (error) {
        console.error("Error in jwt callback:", error);
        return token; // 오류가 발생해도 기본 토큰 반환
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // 로그인 후 리다이렉트 처리
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        } else if (new URL(url).origin === baseUrl) {
          return url;
        }
        return baseUrl + "/pricing"; // 로그인 후 기본 이동 경로
      } catch (error) {
        console.error("Error in redirect callback:", error);
        return baseUrl; // 오류가 발생해도 기본 URL로 리다이렉트
      }
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
};
