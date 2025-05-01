import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// API 라우트에서 headers에 접근하기 때문에 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
