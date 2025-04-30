'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * 케어 항목 업데이트 서버 액션
 * @param {Object} formData - 업데이트할 케어 항목 데이터
 * @param {string} formData.id - 케어 항목 ID
 * @param {string} formData.title - 케어 항목 제목
 * @param {string} formData.description - 케어 항목 설명 (선택 사항)
 * @param {string} formData.time - 케어 항목 시간
 * @param {string} formData.repeat - 케어 항목 반복 주기
 * @param {boolean} formData.notify - 케어 항목 알림 여부
 * @returns {Promise<boolean>} 업데이트 성공 여부
 */
export async function updateCare(formData) {
  const supabase = createServerActionClient({ cookies });

  const { error } = await supabase
    .from('cares')
    .update({
      title: formData.title,
      description: formData.description,
      time: formData.time,
      repeat: formData.repeat,
      notify: formData.notify,
      updated_at: new Date().toISOString()
    })
    .eq('id', formData.id);

  if (!error) {
    revalidatePath('/care');
    revalidatePath(`/care/${formData.id}`);
  }

  return !error;
}

/**
 * 케어 항목 완료 상태 토글 서버 액션
 * @param {Object} params - 파라미터
 * @param {string} params.id - 케어 항목 ID
 * @param {boolean} params.isCompleted - 완료 상태
 * @returns {Promise<{success: boolean, error: any}>} 성공 여부와 오류 정보
 */
export async function toggleCareCompletion({ id, isCompleted }) {
  const supabase = createServerActionClient({ cookies });

  try {
    const { error } = await supabase
      .from('cares')
      .update({
        is_completed: isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    // 케어 목록 페이지 리발리데이트
    revalidatePath('/care');
    revalidatePath(`/care/${id}`);

    return { success: true, error: null };
  } catch (error) {
    console.error('케어 완료 상태 변경 오류:', error);
    return { success: false, error };
  }
}
