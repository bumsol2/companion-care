import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// API 라우트에서 headers에 접근하기 때문에 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

export async function GET() {
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
      .select('stripe_customer_id, is_subscribed, subscription_id, subscription_status, subscription_period_end')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: '사용자 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 구독 정보가 없는 경우
    if (!profile.subscription_id || !profile.is_subscribed) {
      return NextResponse.json({ subscription: null });
    }

    // Stripe에서 최신 구독 정보 가져오기
    let subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(profile.subscription_id);
    } catch (error) {
      console.error('Stripe 구독 정보 조회 오류:', error);
      
      // Stripe에서 구독 정보를 찾을 수 없는 경우, Supabase의 정보 반환
      return NextResponse.json({
        subscription: {
          id: profile.subscription_id,
          status: profile.subscription_status,
          current_period_end: profile.subscription_period_end,
        }
      });
    }
    
    // 구독 정보 반환
    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        price_id: subscription.items.data[0].price.id,
      }
    });
  } catch (error) {
    console.error('구독 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '구독 정보를 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}
