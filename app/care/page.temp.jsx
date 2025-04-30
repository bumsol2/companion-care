export const dynamic = 'force-dynamic';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import CarePageContent from '@/components/CarePageContent';
import CareStats from '@/components/CareStats';
import { getCareStats } from '@/lib/actions/careStats';
import AuthGuard from '@/lib/authGuard';

/**
 * 케어 목록 페이지
 * @returns {React.ReactNode} - 케어 목록 페이지 컴포넌트
 */
export default async function CarePage() {
  // 케어 통계 데이터 가져오기
  const stats = await getCareStats();
  
  return (
    <AuthGuard>
      <div className="space-y-8 py-6">
        {/* 케어 통계 */}
        <CareStats 
          total={stats.total} 
          completed={stats.completed} 
          completionRate={stats.completionRate}
          weeklyCompleted={stats.weeklyCompleted}
          monthlyCompleted={stats.monthlyCompleted}
        />
        
        {/* 케어 목록 */}
        <CarePageContent />
      </div>
    </AuthGuard>
  );
}
