import { NextResponse } from 'next/server';
import { stripe, getPriceId } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// API 라우트에서 headers에 접근하기 때문에 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { interval = 'monthly' } = await request.json();
    
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
      .select('email, stripe_customer_id')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: '사용자 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 고객 ID 가져오기 또는 생성
    let customerId = profile.stripe_customer_id;
    
    if (!customerId) {
      // Stripe 고객 생성
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: {
          userId: userId,
        },
      });
      
      customerId = customer.id;
      
      // Supabase에 고객 ID 저장
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }
    
    // 결제 성공 및 취소 URL 설정
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard?checkout=success`;
    const cancelUrl = `${baseUrl}/pricing?checkout=canceled`;
    
    // Checkout 세션 생성
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: getPriceId(interval),
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
      allow_promotion_codes: true,
    });
    
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout 세션 생성 오류:', error);
    return NextResponse.json(
      { error: '결제 세션을 생성할 수 없습니다.' },
      { status: 500 }
    );
  }
}
