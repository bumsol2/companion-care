'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import SubscribeButton from '@/components/subscription/SubscribeButton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

// 컴포넌트 내부에서 세션과 구독 상태를 관리하도록 리팩토링
export default function PricingCards() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 세션 상태에 따라 구독 정보 가져오기
  useEffect(() => {
    console.log('PricingCards - 세션 상태:', status);
    
    if (status === 'authenticated' && session?.user?.id) {
      console.log('PricingCards - 인증됨, 구독 정보 가져오기 시도');
      
      // 구독 정보 API 호출
      fetch('/api/user/subscription')
        .then(res => {
          if (!res.ok) {
            throw new Error('API 응답 오류: ' + res.status);
          }
          return res.json();
        })
        .then(data => {
          console.log('PricingCards - 구독 정보 응답:', data);
          setIsSubscribed(!!data?.is_subscribed);
        })
        .catch(error => {
          console.error('PricingCards - 구독 정보 오류:', error);
          setIsSubscribed(false);
        })
        .finally(() => {
          setLoading(false);
          console.log('PricingCards - 로딩 완료');
        });
    } else if (status === 'unauthenticated') {
      console.log('PricingCards - 비로그인 상태');
      setLoading(false);
    }
    
    // 3초 후 타임아웃으로 로딩 상태 해제 (안전장치)
    const timer = setTimeout(() => {
      if (loading) {
        console.log('PricingCards - 타임아웃으로 로딩 상태 해제');
        setLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [status, session, loading]);
  
  const handleLogin = () => {
    router.push('/login');
  };
  
  // 로딩 상태일 때 로딩 UI 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">요금제 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  // 세션에서 사용자 ID 가져오기
  const userId = session?.user?.id;
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:gap-10 py-8">
      {/* 무료 요금제 */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">무료</CardTitle>
          <CardDescription>
            기본적인 반려동물 관리 기능
          </CardDescription>
          <div className="mt-4 text-3xl font-bold">₩0</div>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2">
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>최대 2마리 반려동물 프로필</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>기본 건강 기록</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>간단한 일정 관리</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>커뮤니티 접근</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => router.push('/dashboard')}
          >
            시작하기
          </Button>
        </CardFooter>
      </Card>
      
      {/* 프리미엄 요금제 */}
      <Card className="flex flex-col border-primary">
        <CardHeader>
          <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-fit px-3 py-1 mb-2">
            추천
          </div>
          <CardTitle className="text-xl">프리미엄</CardTitle>
          <CardDescription>
            고급 반려동물 케어 및 관리 기능
          </CardDescription>
          <div className="mt-4 flex items-baseline">
            <span className="text-3xl font-bold">₩9,900</span>
            <span className="ml-1 text-muted-foreground">/월</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2">
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>무제한 반려동물 프로필</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>상세 건강 분석 및 리포트</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>고급 케어 일정 및 알림</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>건강 데이터 백업 및 내보내기</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>우선 고객 지원</span>
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>전문가 상담 할인</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          {!userId ? (
            <Button 
              className="w-full" 
              onClick={handleLogin}
            >
              로그인하여 구독하기
            </Button>
          ) : isSubscribed ? (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push('/dashboard')}
            >
              이미 구독 중
            </Button>
          ) : (
            <SubscribeButton 
              interval="monthly" 
              className="w-full"
            >
              구독하기
            </SubscribeButton>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
