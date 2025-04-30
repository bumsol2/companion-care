# 💳 Stripe 결제 연동 가이드

## 1. Stripe 연동 개요

### 구현 목표
- Freemium 모델 기반 구독 결제 시스템
- 월간/연간 요금제 지원
- 안전한 결제 처리 및 구독 관리
- Webhook을 통한 이벤트 처리

### 필요한 Stripe 제품
- [Stripe Checkout](https://stripe.com/docs/payments/checkout): 결제 페이지
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal): 구독 관리
- [Stripe Webhooks](https://stripe.com/docs/webhooks): 이벤트 처리

## 2. 환경 설정

### 필요한 패키지
```bash
npm install stripe @stripe/stripe-js
```

### 환경 변수 설정
```
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 3. 결제 페이지 구현

### 체크아웃 세션 생성 (서버 측)
```typescript
// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });
  
  const { priceId, customerId } = await request.json();
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer: customerId || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment/canceled`,
    });
    
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### 체크아웃 버튼 구현 (클라이언트 측)
```tsx
// components/CheckoutButton.tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutButtonProps {
  priceId: string;
  customerId?: string;
}

export default function CheckoutButton({ priceId, customerId }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerId,
        }),
      });
      
      const { sessionId } = await response.json();
      
      // Redirect to Checkout
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded transition-colors"
    >
      {loading ? '처리 중...' : '구독하기'}
    </button>
  );
}
```

## 4. Webhook 처리

### Webhook 엔드포인트 구현
```typescript
// app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });
  
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  
  // 이벤트 처리
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(deletedSubscription);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // 사용자 계정 업그레이드
  // 데이터베이스에 구독 정보 저장
  // 환영 이메일 발송
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // 구독 상태 업데이트
  // 사용자에게 알림
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // 사용자 계정 다운그레이드
  // 피드백 요청 이메일 발송
}
```

## 5. 구독 관리 포털

### 고객 포털 세션 생성
```typescript
// app/api/create-portal-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'You must be logged in.' },
      { status: 401 }
    );
  }
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });
  
  // 사용자의 Stripe 고객 ID 조회
  const customerId = '...'; // 데이터베이스에서 조회
  
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/settings`,
  });
  
  return NextResponse.json({ url: portalSession.url });
}
```

### 관리 포털 버튼
```tsx
// components/ManageSubscriptionButton.tsx
'use client';

import { useState } from 'react';

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleManageSubscription}
      disabled={loading}
      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition-colors"
    >
      {loading ? '처리 중...' : '구독 관리'}
    </button>
  );
}
```

## 6. 보안 고려사항

### 결제 보안
- Stripe.js와 Checkout을 사용하여 카드 정보를 직접 처리하지 않음
- HTTPS 필수 적용
- 결제 금액 및 상품 정보는 항상 서버 측에서 확인

### Webhook 보안
- Stripe 서명 검증 필수
- Webhook 비밀키 안전하게 관리
- 중복 이벤트 처리 방지 (멱등성 유지)

### 사용자 데이터 보안
- 결제 정보는 Stripe에만 저장
- 구독 상태만 데이터베이스에 저장
- PCI DSS 규정 준수

## 7. 테스트 방법

### 테스트 카드 정보
- 성공 카드: 4242 4242 4242 4242
- 실패 카드: 4000 0000 0000 0002
- 3D Secure 필요: 4000 0027 6000 3184

### 테스트 Webhook
```bash
# Stripe CLI 설치 후
stripe listen --forward-to localhost:3000/api/webhook
```

### 구독 테스트 시나리오
1. 무료 계정 생성
2. 프리미엄 구독 결제
3. 구독 업그레이드/다운그레이드
4. 구독 취소
5. 결제 실패 처리

## 8. 배포 시 고려사항

### 프로덕션 환경 설정
- 테스트 키에서 프로덕션 키로 전환
- Webhook 엔드포인트 업데이트
- 오류 모니터링 설정

### 결제 실패 대응
- 자동 재시도 설정
- 사용자 알림 시스템 구축
- 결제 실패 분석 및 개선

### 법적 요구사항
- 이용약관 및 개인정보처리방침 업데이트
- 결제 관련 법적 고지 제공
- 세금 처리 고려
