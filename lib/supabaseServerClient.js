/**
 * 서버 컴포넌트 전용 Supabase 클라이언트
 * 서버 컴포넌트, Server Actions, API 라우트에서 사용합니다.
 */
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const supabaseServerClient = () => createServerComponentClient({ cookies });
