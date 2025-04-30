import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PricingCards from './PricingCards';

export const metadata = {
  title: '요금제 | Companion Care',
  description: 'Companion Care 요금제 및 구독 정보',
};

// 서버 컴포넌트로 변경하고 오류 진단 코드 추가
export default async function PricingPage() {
  // 오류 진단 코드 추가
  let session = null;
  let isSubscribed = false;
  
  try {
    console.log('✅ getServerSession 호출 시도...');
    session = await getServerSession(authOptions);
    console.log('✅ session loaded', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      email: session?.user?.email 
    });
  } catch (error) {
    console.error('❌ getServerSession failed:', error);
    return (
      <div className="container max-w-6xl py-8 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-red-600">
            세션 로딩 오류
          </h1>
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded text-left">
            <p className="font-bold">오류 메시지:</p>
            <p className="font-mono text-sm overflow-auto">{error.message}</p>
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
