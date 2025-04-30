import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';

// API 라우트에서 headers에 접근하기 때문에 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

// Webhook 시크릿 키 (Stripe 대시보드에서 설정 필요)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;
    
    // Webhook 서명 검증
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`⚠️ Webhook 서명 검증 실패:`, err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // 이벤트 유형에 따른 처리
    switch (event.type) {
      // 구독 생성 이벤트
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, supabase);
        break;
        
      // 구독 업데이트 이벤트 (갱신, 플랜 변경 등)
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabase);
        break;
        
      // 구독 취소 이벤트
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase);
        break;
        
      // 결제 실패 이벤트
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object, supabase);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook 처리 오류:', error);
    return NextResponse.json(
      { error: 'Webhook 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 구독 생성 처리
async function handleSubscriptionCreated(subscription, supabase) {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const priceId = subscription.items.data[0].price.id;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  
  // Stripe 고객 정보 조회
  const customer = await stripe.customers.retrieve(customerId);
  const userId = customer.metadata.userId;
  
  if (!userId) {
    console.error('사용자 ID를 찾을 수 없습니다:', customerId);
    return;
  }
  
  // 사용자의 구독 정보 업데이트
  const { error } = await supabase
    .from('profiles')
    .update({
      is_subscribed: status === 'active' || status === 'trialing',
      subscription_id: subscriptionId,
      subscription_status: status,
      price_id: priceId,
      subscription_period_end: currentPeriodEnd.toISOString(),
    })
    .eq('id', userId);
    
  if (error) {
    console.error('구독 정보 업데이트 실패:', error);
  }
}

// 구독 업데이트 처리
async function handleSubscriptionUpdated(subscription, supabase) {
  // 생성과 동일한 로직 사용
  await handleSubscriptionCreated(subscription, supabase);
}

// 구독 취소 처리
async function handleSubscriptionDeleted(subscription, supabase) {
  const customerId = subscription.customer;
  
  // Stripe 고객 정보 조회
  const customer = await stripe.customers.retrieve(customerId);
  const userId = customer.metadata.userId;
  
  if (!userId) {
    console.error('사용자 ID를 찾을 수 없습니다:', customerId);
    return;
  }
  
  // 사용자의 구독 정보 업데이트
  const { error } = await supabase
    .from('profiles')
    .update({
      is_subscribed: false,
      subscription_status: 'canceled',
    })
    .eq('id', userId);
    
  if (error) {
    console.error('구독 취소 정보 업데이트 실패:', error);
  }
}

// 결제 실패 처리
async function handlePaymentFailed(invoice, supabase) {
  const customerId = invoice.customer;
  
  // Stripe 고객 정보 조회
  const customer = await stripe.customers.retrieve(customerId);
  const userId = customer.metadata.userId;
  
  if (!userId) {
    console.error('사용자 ID를 찾을 수 없습니다:', customerId);
    return;
  }
  
  // 사용자에게 결제 실패 알림을 보내는 로직 추가 가능
  console.log(`결제 실패 알림: 사용자 ID ${userId}`);
}
