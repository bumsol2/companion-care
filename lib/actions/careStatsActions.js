'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { eachDayOfInterval, format, subDays, parseISO } from 'date-fns';

/**
 * 최근 7일간 날짜별 케어 완료 항목 수를 가져오는 함수
 * @returns {Promise<Array<Object>>} 날짜별 완료된 케어 항목 수 배열
 */
export async function getCareCompletionByDate() {
  const supabase = createServerComponentClient({ cookies });

  // 현재 날짜와 7일 전 날짜 계산
  const today = new Date();
  const sevenDaysAgo = subDays(today, 6); // 총 7일간

  // 1. 7일간의 날짜 목록 생성
  const dates = eachDayOfInterval({
    start: sevenDaysAgo,
    end: today,
  }).map((d) => format(d, 'yyyy-MM-dd'));

  // 2. 7일간 완료된 케어 항목 조회
  const { data, error } = await supabase
    .from('cares')
    .select('completed_at')
    .gte('completed_at', format(sevenDaysAgo, 'yyyy-MM-dd'))
    .lte('completed_at', format(today, 'yyyy-MM-dd'))
    .eq('is_completed', true);

  if (error) {
    console.error('Supabase error:', error);
    return dates.map(date => ({
      date: format(parseISO(date), 'M/d'),
      completed: 0
    }));
  }

  // 3. 날짜별 완료된 항목 수 집계
  const counts = dates.map((date) => {
    // 해당 날짜에 완료된 케어 항목 수 계산
    const completedCount = data?.filter((item) => {
      // completed_at이 null이 아닌 경우에만 처리
      if (!item.completed_at) return false;
      
      // 날짜 형식 변환 (yyyy-MM-dd)
      const itemDate = format(new Date(item.completed_at), 'yyyy-MM-dd');
      return itemDate === date;
    }).length || 0;

    // 표시용 날짜 형식 변환 (M/d)
    const displayDate = format(parseISO(date), 'M/d');

    return {
      date: displayDate,
      completed: completedCount
    };
  });

  return counts;
}
