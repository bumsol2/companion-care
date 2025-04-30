// 이 파일은 비활성화되었습니다.
// Supabase를 사용하도록 변경했으므로 next-auth API 경로가 필요하지 않습니다.

// 다음 함수들은 비활성화된 상태로 남겨둡니다.

// 비활성화된 NextAuth 설정
const authOptions = {
  providers: [],
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) return false;
      
      // Supabase에 사용자 정보 저장 (환경 변수가 설정된 경우에만)
      if (account?.provider === 'google' && isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id',
              returning: 'minimal',
            });
          
          if (error) {
            console.error('Supabase 사용자 저장 오류:', error);
            // 오류가 있어도 로그인은 허용
          }
        } catch (err) {
          console.error('Supabase 연결 오류:', err);
          // 오류가 있어도 로그인은 허용
        }
      }
      
      return true;
    },
    async jwt({ token, account, profile }) {
      // 초기 로그인 시 계정 정보 추가
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // 세션에 필요한 정보 추가
      session.user.id = token.sub;
      session.accessToken = token.accessToken;
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 로그인 후 리다이렉트 처리
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth',
    signOut: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
};

// API 경로 핸들러 비활성화
export function GET() {
  return new Response(JSON.stringify({ error: 'This API route is disabled' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function POST() {
  return new Response(JSON.stringify({ error: 'This API route is disabled' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
