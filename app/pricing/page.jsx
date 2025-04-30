"use client";

import { useSession } from 'next-auth/react';
import PricingCards from './PricingCards';

// 클라이언트 컴포넌트로 변경하여 useSession 훅 사용
export default function PricingPage() {
  // useSession 사용 방식 개선 - 기본값 설정
  const { data: session, status } = useSession() || { data: null, status: 'loading' };
  const userId = session?.user?.id;
  const isLoading = status === 'loading';
  
  // 로딩 상태일 때 표시
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
      
      <PricingCards isSubscribed={false} userId={userId} />
    </div>
  );
}
