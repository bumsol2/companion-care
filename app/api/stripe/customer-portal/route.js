import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// API 라우트에서 headers에 접근하기 때문에 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // 인증된 사용자 확인
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Supabase에서 사용자 정보 가져오기
    const supabase = createClient();
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: '사용자 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const customerId = profile.stripe_customer_id;
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Stripe 고객 ID가 없습니다.' },
        { status: 400 }
      );
    }
    
    // 결제 성공 및 취소 URL 설정
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/dashboard`;
    
    // 고객 포털 세션 생성
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('고객 포털 세션 생성 오류:', error);
    return NextResponse.json(
      { error: '고객 포털 세션을 생성할 수 없습니다.' },
      { status: 500 }
    );
  }
}
