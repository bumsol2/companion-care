'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ProfileForm from '../../../components/ProfileForm';
import AuthGuard from '../../../lib/authGuard';

/**
 * 프로필 설정 페이지 컴포넌트
 */
function ProfileSettingsContent() {
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
      <Tabs defaultValue="profile" className="mb-8">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="profile" className="text-center">프로필</TabsTrigger>
          <TabsTrigger value="notifications" className="text-center" asChild>
            <Link href="/settings/notifications">알림</Link>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">프로필 관리</h2>
            <p className="text-neutral-600">
              프로필 정보를 관리하고 업데이트할 수 있습니다.
            </p>
            
            <ProfileForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * 프로필 설정 페이지 (인증 보호 적용)
 */
export default function ProfileSettingsPage() {
  return (
    <AuthGuard>
      <ProfileSettingsContent />
    </AuthGuard>
  );
}
