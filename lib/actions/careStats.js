'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * 케어 항목 통계 정보를 가져오는 함수
 * @param {string} period - 통계 기간 ('all', 'week', 'month' 중 하나)
 * @returns {Promise<Object>} 통계 정보 객체
 */
export async function getCareStats(period = 'all') {
  const supabase = createServerComponentClient({ cookies });

  // 현재 날짜 가져오기
  const now = new Date();
  let query = supabase.from('cares').select('is_completed, completed_at, created_at');
  
  // 기간에 따른 쿼리 조건 추가
  if (period === 'week') {
    // 이번 주 시작일 (일요일) 계산
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    query = query.gte('created_at', startOfWeek.toISOString());
  } else if (period === 'month') {
    // 이번 달 시작일 (1일) 계산
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    query = query.gte('created_at', startOfMonth.toISOString());
  }

  // 쿼리 실행
  const { data, error } = await query;

  if (error || !data) {
    console.error('케어 통계 가져오기 오류:', error);
    return { 
      total: 0, 
      completed: 0, 
      completionRate: 0,
      weeklyCompleted: 0,
      monthlyCompleted: 0
    };
  }

  // 현재 날짜 기준 일주일 전, 한 달 전 날짜 계산 (완료 통계용)
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setDate(now.getDate() - 30);

  // 통계 계산
  const total = data.length;
  const completed = data.filter(care => care.is_completed).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // 최근 일주일, 한 달 완료 수 계산
  const weeklyCompleted = data.filter(care => {
    if (!care.completed_at) return false;
    const completedDate = new Date(care.completed_at);
    return care.is_completed && completedDate >= oneWeekAgo;
  }).length;
  
  const monthlyCompleted = data.filter(care => {
    if (!care.completed_at) return false;
    const completedDate = new Date(care.completed_at);
    return care.is_completed && completedDate >= oneMonthAgo;
  }).length;

  return { 
    total, 
    completed, 
    completionRate,
    weeklyCompleted,
    monthlyCompleted,
    period // 현재 선택된 기간도 함께 반환
  };
}
