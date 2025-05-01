'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AuthGuard from '@/lib/authGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [companions, setCompanions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 실제 구현 시 Supabase에서 데이터를 가져오는 로직 추가
    // 현재는 빈 배열로 초기화
    setCompanions([]);
    setIsLoading(false);
  }, []);

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
          <Button asChild>
            <Link href="/register">
              <PlusCircle className="mr-2 h-4 w-4" />
              반려 생물 등록
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>환영합니다!</CardTitle>
              <CardDescription>
                {session?.user?.name || '사용자'}님, Companion Care에 오신 것을 환영합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                반려 생물을 등록하고 케어 일정을 관리해보세요
              </p>
            </CardContent>
          </Card>

          {isLoading ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="h-5 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ) : companions.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-6 border-dashed">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">아직 등록된 반려 생물이 없습니다</h3>
                <p className="text-sm text-muted-foreground">
                  첫 번째 반려 생물을 등록하고 케어 일정을 관리해보세요
                </p>
                <Button asChild className="mt-4">
                  <Link href="/register">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    등록하기
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            // 반려 생물 목록 표시 (추후 구현)
            <div>반려 생물 목록이 표시됩니다</div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
