'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * 월별 케어 완료 통계를 가져오는 함수
 * @param {number} monthCount - 가져올 월 수 (기본값: 6)
 * @returns {Promise<Object>} - 월별 케어 완료 통계 데이터
 */
export async function getMonthlyCompletionStats(monthCount = 6) {
  const supabase = createServerComponentClient({ cookies });
  
  // 현재 날짜 기준 최근 N개월 범위 계산
  const today = new Date();
  const months = [];
  const labels = [];
  
  // 최근 N개월 배열 생성 (현재 월 포함)
  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    
    // 월 시작일과 종료일 계산
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = endOfMonth.toISOString().split('T')[0];
    
    months.push({
      startDate: `${startDate}T00:00:00`,
      endDate: `${endDate}T23:59:59`,
      year: date.getFullYear(),
      month: date.getMonth() + 1
    });
    
    // 표시용 날짜 형식 (YYYY-MM)
    const monthName = date.toLocaleString('default', { month: 'short' });
    labels.push(`${monthName} ${date.getFullYear()}`);
  }
  
  // 각 월별 케어 항목 및 완료 항목 조회
  const monthlyStats = await Promise.all(
    months.map(async ({ startDate, endDate }) => {
      // 해당 월에 생성된 모든 케어 항목
      const { data: totalItems } = await supabase
        .from('cares')
        .select('id')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      // 해당 월에 완료된 케어 항목
      const { data: completedItems } = await supabase
        .from('cares')
        .select('id')
        .eq('is_completed', true)
        .gte('completed_at', startDate)
        .lte('completed_at', endDate);
      
      const totalCount = totalItems?.length || 0;
      const completedCount = completedItems?.length || 0;
      
      return {
        totalCount,
        completedCount
      };
    })
  );
  
  return {
    labels,
    totalCounts: monthlyStats.map(stat => stat.totalCount),
    completedCounts: monthlyStats.map(stat => stat.completedCount)
  };
}
