import PricingCards from './PricingCards';

export const metadata = {
  title: '요금제 | Companion Care',
  description: 'Companion Care 요금제 및 구독 정보',
};

// 서버 컴포넌트로 변경 - 단순히 PricingCards 컴포넌트만 렌더링
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
