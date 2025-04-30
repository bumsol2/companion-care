'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

/**
 * 반려동물 이미지를 업로드하고 리사이징하는 함수
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<string>} - 업로드된 이미지의 공개 URL
 */
export async function uploadPetImage(file) {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    // 파일을 ArrayBuffer로 변환
    const bytes = await file.arrayBuffer();
    
    // 이미지 리사이징 (300x300, JPEG 형식)
    const resizedBuffer = await sharp(Buffer.from(bytes))
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    // 고유한 파일명 생성
    const fileName = `${uuidv4()}.jpg`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('pets')
      .upload(fileName, resizedBuffer, { 
        contentType: 'image/jpeg',
        cacheControl: '3600', 
        upsert: false 
      });

    if (error) throw new Error('이미지 업로드 실패: ' + error.message);

    // 업로드된 이미지의 공개 URL 가져오기
    const { data: urlData } = supabase.storage.from('pets').getPublicUrl(fileName);
    return urlData.publicUrl;
  } catch (error) {
    console.error('이미지 처리 오류:', error);
    throw new Error('이미지 처리 중 오류가 발생했습니다: ' + error.message);
  }
}

/**
 * 반려동물 정보를 데이터베이스에 저장하는 함수
 * @param {Object} petData - 반려동물 정보
 * @param {string} petData.name - 이름
 * @param {string} petData.species - 종류
 * @param {string} petData.birthday - 생일
 * @param {string} petData.imageUrl - 이미지 URL
 * @returns {Promise<void>}
 */
export async function createPet({ name, species, birthday, imageUrl }) {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    // 현재 로그인한 사용자 세션 가져오기
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) throw new Error('로그인이 필요합니다');
    
    // 반려동물 정보 저장
    const { error } = await supabase.from('pets').insert([
      { 
        name, 
        species, 
        birthday, 
        image_url: imageUrl,
        user_id: session.user.id  // 사용자 ID 연결
      }
    ]);

    if (error) throw new Error('반려동물 등록 실패: ' + error.message);
  } catch (error) {
    console.error('반려동물 등록 오류:', error);
    throw error;
  }
}

/**
 * 사용자의 반려동물 목록을 가져오는 함수
 * @returns {Promise<Array>} - 반려동물 목록
 */
export async function getUserPets() {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    // 현재 로그인한 사용자의 반려동물 목록 가져오기
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error('반려동물 목록 조회 실패: ' + error.message);
    
    return data || [];
  } catch (error) {
    console.error('반려동물 목록 조회 오류:', error);
    return [];
  }
}
