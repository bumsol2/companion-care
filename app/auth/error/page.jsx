'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">인증 오류</h1>
          <p className="text-gray-600 mb-6">
            로그인 중 문제가 발생했습니다. 다시 시도해 주세요.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/login">
              로그인 페이지로 돌아가기
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/">
              홈으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
