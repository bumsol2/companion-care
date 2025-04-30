'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">설정</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* 탭 네비게이션 - 모바일에서는 상단에, 데스크탑에서는 좌측에 표시 */}
        <div className="md:w-64 flex md:flex-col overflow-x-auto md:overflow-visible">
          <Card className="p-0 flex md:flex-col w-full">
            <Link 
              href="/settings/profile"
              className={`flex items-center gap-2 p-4 ${activeTab === 'profile' ? 'bg-primary-50 text-primary-600 border-b-2 md:border-b-0 md:border-l-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
              onClick={() => setActiveTab('profile')}
            >
              <User className="h-5 w-5" />
              <span>프로필</span>
            </Link>
            <Link 
              href="/settings/notifications"
              className={`flex items-center gap-2 p-4 ${activeTab === 'notifications' ? 'bg-primary-50 text-primary-600 border-b-2 md:border-b-0 md:border-l-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="h-5 w-5" />
              <span>알림 설정</span>
            </Link>
          </Card>
        </div>
        
        {/* 메인 컨텐츠 영역 */}
        <div className="flex-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">설정 페이지입니다</h2>
            <p className="text-neutral-600 mb-4">
              왼쪽 탭에서 원하는 설정 항목을 선택하세요.
            </p>
            <div className="flex gap-4">
              <Link href="/settings/profile">
                <Button variant="outline">프로필 설정</Button>
              </Link>
              <Link href="/settings/notifications">
                <Button variant="outline">알림 설정</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
