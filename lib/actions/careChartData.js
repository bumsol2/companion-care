'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * 주간 케어 완료 통계 데이터를 가져오는 함수
 * @param {number} weeks - 가져올 주 수 (기본값: 6)
 * @returns {Promise<Object>} - 주간 케어 완료 통계 데이터
 */
export async function getWeeklyCareCompletion(weeks = 6) {
  const supabase = createServerComponentClient({ cookies });

  // 현재 날짜 기준으로 n주 전 날짜 계산
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - (weeks * 7));
  
  // 케어 데이터 가져오기
  const { data, error } = await supabase
    .from('cares')
    .select('id, created_at, completed_at, is_completed')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('주간 케어 완료 통계 가져오기 오류:', error);
    return { labels: [], counts: [] };
  }

  // 주별로 데이터 그룹화
  const weeklyCounts = {};
  const weekLabels = [];
  
  // 최근 n주 날짜 라벨 생성
  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((weeks - 1 - i) * 7));
    
    // 주 시작일 (일요일)로 조정
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    
    const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    weekLabels.push(weekLabel);
    weeklyCounts[weekLabel] = 0;
  }
  
  // 완료된 케어 항목 카운트
  data?.forEach(care => {
    if (care.is_completed) {
      const completedDate = care.completed_at ? new Date(care.completed_at) : new Date(care.created_at);
      
      // 해당 날짜가 속한 주의 시작일 계산
      const weekStart = new Date(completedDate);
      const dayOfWeek = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - dayOfWeek);
      
      const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      
      // 해당 주에 완료된 항목 카운트 증가
      if (weeklyCounts[weekLabel] !== undefined) {
        weeklyCounts[weekLabel]++;
      }
    }
  });

  return { 
    labels: weekLabels, 
    counts: weekLabels.map(label => weeklyCounts[label]) 
  };
}

/**
 * 월간 케어 완료 통계 데이터를 가져오는 함수
 * @param {number} months - 가져올 월 수 (기본값: 6)
 * @returns {Promise<Object>} - 월간 케어 완료 통계 데이터
 */
export async function getMonthlyCareCompletion(months = 6) {
  const supabase = createServerComponentClient({ cookies });

  // 현재 날짜 기준으로 n개월 전 날짜 계산
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(now.getMonth() - months);
  
  // 케어 데이터 가져오기
  const { data, error } = await supabase
    .from('cares')
    .select('id, created_at, completed_at, is_completed')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('월간 케어 완료 통계 가져오기 오류:', error);
    return { labels: [], counts: [] };
  }

  // 월별로 데이터 그룹화
  const monthlyCounts = {};
  const monthLabels = [];
  
  // 최근 n개월 날짜 라벨 생성
  for (let i = 0; i < months; i++) {
    const monthDate = new Date(now);
    monthDate.setMonth(now.getMonth() - (months - 1 - i));
    
    const monthLabel = `${monthDate.getFullYear()}년 ${monthDate.getMonth() + 1}월`;
    monthLabels.push(monthLabel);
    monthlyCounts[monthLabel] = 0;
  }
  
  // 완료된 케어 항목 카운트
  data?.forEach(care => {
    if (care.is_completed) {
      const completedDate = care.completed_at ? new Date(care.completed_at) : new Date(care.created_at);
      const monthLabel = `${completedDate.getFullYear()}년 ${completedDate.getMonth() + 1}월`;
      
      // 해당 월에 완료된 항목 카운트 증가
      if (monthlyCounts[monthLabel] !== undefined) {
        monthlyCounts[monthLabel]++;
      }
    }
  });

  return { 
    labels: monthLabels, 
    counts: monthLabels.map(label => monthlyCounts[label]) 
  };
}
