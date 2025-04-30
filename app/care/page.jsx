export const dynamic = 'force-dynamic';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import CarePageContent from '@/components/CarePageContent';
import CareStats from '@/components/CareStats';
import CareCompletionChart from '@/components/CareCompletionChart';
import PetCareChart from '@/components/PetCareChart';
import CareCompletionTrendChart from '@/components/CareCompletionTrendChart';
import MonthlyCompletionChart from '@/components/MonthlyCompletionChart';
import CareStatsChart from '@/components/CareStatsChart';
import ChartSkeleton from '@/components/ChartSkeleton';
import { getCareStats } from '@/lib/actions/careStats';
import { getWeeklyCareCompletion, getMonthlyCareCompletion } from '@/lib/actions/careChartData';
import { getCareStatsByPet } from '@/lib/actions/careStatsByPet';
import { getCareCompletionTrend } from '@/lib/actions/careCompletionTrend';
import { getMonthlyCompletionStats } from '@/lib/actions/careMonthlyStats';
import { getCareCompletionByDate } from '@/lib/actions/careStatsActions';
import AuthGuard from '@/lib/authGuard';

/**
 * 케어 목록 페이지
 * @returns {React.ReactNode} - 케어 목록 페이지 컴포넌트
 */
export default async function CarePage() {
  // 케어 통계 데이터 가져오기
  const stats = await getCareStats();
  
  // 케어 완료 통계 그래프 데이터 가져오기
  const weeklyChartData = await getWeeklyCareCompletion();
  const monthlyChartData = await getMonthlyCareCompletion();
  
  // 반려동물별 케어 통계 데이터 가져오기
  const petCareStats = await getCareStatsByPet();
  
  // 케어 완료율 변화 추이 데이터 가져오기
  const completionTrendData = await getCareCompletionTrend();
  
  // 월별 케어 통계 데이터 가져오기
  const monthlyStats = await getMonthlyCompletionStats();
  
  // 실제 데이터 가져오기
  const careCompletionData = await getCareCompletionByDate();

  return (
    <AuthGuard>
      <div className="space-y-8 py-6">
        <h1 className="text-3xl font-bold">Care</h1>
        
        {/* 케어 통계 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">케어 통계</h2>
          <Suspense fallback={<div className="h-20 animate-pulse bg-neutral-100 rounded-md"></div>}>
            <CareStats stats={stats} />
          </Suspense>
        </div>
        
        {/* 최근 7일간 케어 완료 추이 */}
        <Suspense fallback={<ChartSkeleton title="최근 7일간 케어 완료 추이" />}>
          <CareStatsChart data={careCompletionData} />
        </Suspense>
        
        {/* 케어 완료율 변화 추이 */}
        <Suspense fallback={<ChartSkeleton title="케어 완료율 변화 추이" />}>
          <CareCompletionTrendChart data={completionTrendData} />
        </Suspense>
        
        {/* 월별 케어 통계 */}
        <Suspense fallback={<ChartSkeleton title="월별 케어 통계" />}>
          <MonthlyCompletionChart data={monthlyStats} />
        </Suspense>
        
        {/* 케어 통계 그래프 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<ChartSkeleton title="주간 케어 완료 통계" />}>
            <CareCompletionChart 
              data={weeklyChartData} 
              title="주간 케어 완료 통계" 
            />
          </Suspense>
          <Suspense fallback={<ChartSkeleton title="월간 케어 완료 통계" />}>
            <CareCompletionChart 
              data={monthlyChartData} 
              title="월간 케어 완료 통계" 
            />
          </Suspense>
        </div>
        
        {/* 반려동물별 케어 통계 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">반려동물별 케어 통계</h2>
          <Suspense fallback={<ChartSkeleton title="반려동물별 케어 통계" />}>
            <PetCareChart data={petCareStats} />
          </Suspense>
        </div>
        
        {/* 케어 목록 */}
        <CarePageContent />
      </div>
    </AuthGuard>
  );
}
