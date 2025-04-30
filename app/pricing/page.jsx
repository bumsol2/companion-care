import { getServerSession } from 'next-auth';
// 다시 @/ 경로 사용 - 빌드 시스템에서 이 경로를 인식함
import { authOptions } from '@/lib/auth';
import PricingCards from './PricingCards';

export const metadata = {
  title: '요금제 | Companion Care',
  description: 'Companion Care 요금제 및 구독 정보',
};

export default async function PricingPage() {
  // 오류 처리를 추가하여 500 에러 방지
  let session = null;
  let isSubscribed = false;
  
  try {
    session = await getServerSession(authOptions);
    
    // 임시로 정적 데이터 사용
    // 로그인한 사용자의 구독 상태 확인
    // if (session?.user?.id) {
    //   const supabase = createClient();
    //   const { data } = await supabase
    //     .from('profiles')
    //     .select('is_subscribed')
    //     .eq('id', session.user.id)
    //     .single();
    //   
    //   isSubscribed = data?.is_subscribed || false;
    // }
  } catch (error) {
    console.error('Session error:', error);
    // 오류가 발생해도 페이지는 렌더링
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
