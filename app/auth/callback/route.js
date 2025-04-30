export const dynamic = 'force-dynamic';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');

  const cookieStore = cookies();
  const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  if (code) {
    await supabase.auth.exchangeCodeForSession(code, { response });
    return response;
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
