'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

export default function OfflinePage() {
  // 페이지 새로고침 핸들러
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md mx-auto">
        <div className="bg-neutral-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-12 w-12 text-neutral-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">인터넷 연결이 끊겼습니다</h1>
        
        <p className="text-neutral-600 mb-8">
          현재 오프라인 상태입니다. 인터넷 연결을 확인하고 다시 시도해주세요.
          일부 캐시된 페이지는 오프라인에서도 접근 가능할 수 있습니다.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleRefresh} className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
          
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              대시보드로 이동
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-neutral-500">
          <p>Companion Care</p>
          <p>오프라인 모드에서는 일부 기능이 제한될 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
