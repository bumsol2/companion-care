/**
 * Supabase 클라이언트 생성 파일
 * 이렇게 하면 'Multiple GoTrueClient instances detected' 경고를 피할 수 있습니다.
 */

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// 클라이언트용 Supabase 인스턴스 생성
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

/**
 * 사용 예시:
 * 
 * 1. 클라이언트 컴포넌트에서:
 * ```
 * 'use client';
 * import { supabase } from '../lib/supabaseClient';
 * ```
 * 
 * 2. 서버 컴포넌트에서:
 * ```
 * import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
 * import { cookies } from 'next/headers';
 * const supabase = createServerComponentClient({ cookies });
 * ```
 * 
 * 3. 서버 액션(route.js)에서:
 * ```
 * import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
 * import { cookies } from 'next/headers';
 * const supabase = createRouteHandlerClient({ cookies });
 * ```
 */
