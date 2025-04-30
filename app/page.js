'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { signInWithGoogle } from '@/lib/supabaseAuth';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-primary-600">Hello Companion Care</h1>
        <p className="mt-4 text-xl text-neutral-700">
          반려식물과 반려동물을 위한 케어 알림 서비스
        </p>
        <div className="mt-8">
          <Button 
            className="bg-primary hover:bg-primary-600"
            onClick={() => {
              try {
                signInWithGoogle();
              } catch (error) {
                console.error('로그인 오류:', error);
              }
            }}
          >
            Google로 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}
