"use client";

import { useSession } from 'next-auth/react';
import PricingCards from './PricingCards';
import { useEffect, useState } from 'react';

// 클라이언트 컴포넌트로 변경하여 useSession 훅 사용
export default function PricingPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  useEffect(() => {
    // 세션이 로드되면 구독 상태 확인
    if (status === 'authenticated' && session?.user?.id) {
      console.log('✅ 세션 로드됨:', { 
        userId: session.user.id,
        email: session.user.email 
      });
      
      // 여기서 필요한 경우 구독 상태를 확인하는 API 호출 가능
      setIsLoading(false);
    } else if (status === 'unauthenticated') {
      console.log('✅ 비로그인 상태');
      setIsLoading(false);
    } else if (status === 'loading') {
      console.log('⏳ 세션 로딩 중...');
    }
  }, [session, status]);

  if (error) {
    return (
      <div className="container max-w-6xl py-8 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-red-600">
            오류가 발생했습니다
          </h1>
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded text-left">
            <p className="font-bold">오류 메시지:</p>
            <p className="font-mono text-sm overflow-auto">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }
  


  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            요금제 정보 불러오는 중...
          </h1>
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 md:py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          간단한 요금제, 다양한 기능
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          반려동물을 위한 최고의 케어 서비스를 제공합니다.
          필요에 맞는 요금제를 선택하세요.
        </p>
      </div>
      
      <PricingCards isSubscribed={isSubscribed} userId={session?.user?.id} />
    </div>
  );
}
