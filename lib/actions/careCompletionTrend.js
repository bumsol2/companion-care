'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * 최근 7일간의 케어 완료율 변화 추이를 가져오는 함수
 * @returns {Promise<Object>} 날짜별 완료율 데이터
 */
export async function getCareCompletionTrend() {
  const supabase = createServerComponentClient({ cookies });
  
  // 현재 날짜 기준 최근 7일 범위 계산
  const today = new Date();
  const dates = [];
  const labels = [];
  
  // 최근 7일간의 날짜 배열 생성 (오늘 포함)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // ISO 형식의 날짜 문자열 (YYYY-MM-DD)
    const isoDate = date.toISOString().split('T')[0];
    dates.push(isoDate);
    
    // 표시용 날짜 형식 (M/D)
    const displayDate = `${date.getMonth() + 1}/${date.getDate()}`;
    labels.push(displayDate);
  }
  
  // 각 날짜별 케어 항목 및 완료 항목 조회
  const dailyStats = await Promise.all(
    dates.map(async (date) => {
      // 해당 날짜에 생성된 모든 케어 항목
      const { data: totalItems } = await supabase
        .from('cares')
        .select('id')
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);
      
      // 해당 날짜에 완료된 케어 항목
      const { data: completedItems } = await supabase
        .from('cares')
        .select('id')
        .eq('is_completed', true)
        .gte('completed_at', `${date}T00:00:00`)
        .lt('completed_at', `${date}T23:59:59`);
      
      const totalCount = totalItems?.length || 0;
      const completedCount = completedItems?.length || 0;
      
      // 완료율 계산 (항목이 없는 경우 0%)
      const completionRate = totalCount > 0 
        ? Math.round((completedCount / totalCount) * 100) 
        : 0;
      
      return {
        date,
        totalCount,
        completedCount,
        completionRate
      };
    })
  );
  
  return {
    labels,
    dates,
    totalCounts: dailyStats.map(stat => stat.totalCount),
    completedCounts: dailyStats.map(stat => stat.completedCount),
    completionRates: dailyStats.map(stat => stat.completionRate)
  };
}
