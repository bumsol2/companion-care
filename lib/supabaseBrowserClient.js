'use client';

/**
 * 브라우저(클라이언트) 전용 Supabase 클라이언트
 * SSG 중 오류를 방지하기 위해 클라이언트 컴포넌트에서만 import해야 합니다.
 */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient({
  options: {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      cookieOptions: {
        sameSite: 'None',
        secure: true,
        path: '/',
      },
    },
  }
});

// named export와 default export 모두 제공
export { supabase };
export default supabase;
