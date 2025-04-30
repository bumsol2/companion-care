'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * 반려동물별 케어 완료 통계 데이터를 가져오는 함수
 * @returns {Promise<Object>} - 반려동물별 케어 완료 통계 데이터
 */
export async function getCareStatsByPet() {
  const supabase = createServerComponentClient({ cookies });

  // 케어 데이터 가져오기 (pets 테이블과 조인)
  const { data, error } = await supabase
    .from('cares')
    .select('pet_id, is_completed, pets(id, name, type)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('반려동물별 케어 통계 가져오기 오류:', error);
    return { labels: [], counts: [] };
  }

  // 반려동물별로 데이터 그룹화
  const petStats = {};
  const completedPetStats = {};

  // 전체 케어 항목 및 완료된 케어 항목 카운트
  data.forEach(care => {
    const petName = care.pets?.name || '미지정';
    
    // 전체 케어 항목 카운트
    if (!petStats[petName]) {
      petStats[petName] = 0;
    }
    petStats[petName]++;
    
    // 완료된 케어 항목 카운트
    if (care.is_completed) {
      if (!completedPetStats[petName]) {
        completedPetStats[petName] = 0;
      }
      completedPetStats[petName]++;
    }
  });

  // 데이터가 있는 반려동물만 필터링
  const petNames = Object.keys(petStats);
  
  // 완료율 계산
  const completionRates = petNames.map(name => {
    const total = petStats[name] || 0;
    const completed = completedPetStats[name] || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  });

  return {
    labels: petNames,
    counts: petNames.map(name => completedPetStats[name] || 0),
    totals: petNames.map(name => petStats[name] || 0),
    completionRates: completionRates
  };
}
