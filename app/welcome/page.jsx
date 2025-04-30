export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-4xl font-bold mb-4 text-primary-600">반려 케어, 놓치지 마세요</h1>
      <p className="text-xl mb-8 max-w-2xl">
        매일 6시 알림으로 반려식물과 반려동물을 위한 케어 일정을 안심하고 관리하세요.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
          <h3 className="text-lg font-semibold mb-2">간편한 등록</h3>
          <p className="text-neutral-600">반려식물과 반려동물을 쉽게 등록하고 케어 주기를 설정하세요.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
          <h3 className="text-lg font-semibold mb-2">정확한 알림</h3>
          <p className="text-neutral-600">물주기, 산책, 건강검진 등 중요한 일정을 놓치지 않도록 알려드립니다.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
          <h3 className="text-lg font-semibold mb-2">한눈에 관리</h3>
          <p className="text-neutral-600">대시보드에서 모든 반려 생물의 케어 일정을 한 번에 확인하세요.</p>
        </div>
      </div>
      
      <Link href="/auth">
        <Button className="bg-primary hover:bg-primary-600">
          Google로 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
