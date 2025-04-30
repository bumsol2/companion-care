import NextAuth from 'next-auth';
// 다시 @/ 경로 사용 - 빌드 시스템에서 이 경로를 인식함
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
