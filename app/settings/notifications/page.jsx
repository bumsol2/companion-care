'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import NotificationToggle from '../../../components/NotificationToggle';
import AuthGuard from '../../../lib/authGuard';

/**
 * 알림 설정 페이지 컴포넌트
 */
function NotificationSettingsContent() {
  const router = useRouter();
  
  return (
    <div className="max-w-2xl mx-auto pb-10">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
        <h1 className="text-2xl font-bold">설정</h1>
      </div>
      
      {/* 탭 네비게이션 */}
      <Tabs defaultValue="notifications" className="mb-8">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="profile" className="text-center" asChild>
            <Link href="/settings/profile">프로필</Link>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-center">알림</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">알림 설정</h2>
            <p className="text-neutral-600">
              케어 일정 알림 수신 여부를 설정할 수 있습니다.
            </p>
            
            <NotificationToggle />
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-700 text-sm">
              <p>
                <strong>알림 정보:</strong> 알림을 활성화하면 다음과 같은 경우에 이메일 알림을 받게 됩니다:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>케어 일정 하루 전</li>
                <li>케어 일정 당일</li>
                <li>지난 케어 일정 알림</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * 알림 설정 페이지 (인증 보호 적용)
 */
export default function NotificationSettingsPage() {
  return (
    <AuthGuard>
      <NotificationSettingsContent />
    </AuthGuard>
  );
}
