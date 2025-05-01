import dynamic from 'next/dynamic';

// 동적 렌더링 강제 설정 - 세션 접근을 위해 필요
export const dynamic = "force-dynamic";

export const metadata = {
  title: '요금제 | Companion Care',
  description: 'Companion Care 요금제 및 구독 정보',
};

// 클라이언트 컴포넌트를 dynamic import로 렌더링
// ssr: false로 설정하여 서버에서 useSession 훅을 실행하지 않도록 방지
const PricingCards = dynamic(() => import('./PricingCards'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center py-16">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-xl">요금제 정보를 불러오는 중...</p>
      </div>
    </div>
  )
});

// 서버 컴포넌트 유지
export default function PricingPage() {

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
      
      <PricingCards />
    </div>
  );
}
