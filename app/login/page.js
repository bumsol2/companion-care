'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { UnauthGuard } from '@/lib/authGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('로그인 오류:', error);
      setIsLoading(false);
    }
  };

  return (
    <UnauthGuard>
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Companion Care</CardTitle>
            <CardDescription>
              반려식물과 반려동물을 위한 케어 알림 서비스
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">
                Google 계정으로 로그인하여 서비스를 이용하세요
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent" />
              ) : (
                <FcGoogle className="h-5 w-5" />
              )}
              Google로 로그인
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-xs text-muted-foreground">
            로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다
          </CardFooter>
        </Card>
      </div>
    </UnauthGuard>
  );
}
