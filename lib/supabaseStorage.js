import supabase from './supabaseBrowserClient';

/**
 * 반려 생물 사진을 업로드하는 함수
 * @param {File} file - 업로드할 파일 객체
 * @param {string} petId - 반려 생물 ID
 * @returns {Promise<{path: string, error: Error}>} 업로드된 파일 경로 또는 에러
 */
export async function uploadPetPhoto(file, petId) {
  try {
    // 파일 이름 생성 (petId + 타임스탬프 + 확장자)
    const fileExt = file.name.split('.').pop();
    const fileName = `${petId}-${Date.now()}.${fileExt}`;
    const filePath = `${petId}/${fileName}`;

    // Supabase Storage에 파일 업로드
    const { data, error } = await supabase.storage
      .from('pets-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // 업로드된 파일의 공개 URL 생성
    const { data: publicUrlData } = supabase.storage
      .from('pets-photos')
      .getPublicUrl(filePath);

    return { path: publicUrlData.publicUrl, error: null };
  } catch (error) {
    console.error('파일 업로드 에러:', error);
    return { path: null, error };
  }
}

/**
 * 반려 생물 사진을 삭제하는 함수
 * @param {string} filePath - 삭제할 파일 경로
 * @returns {Promise<{success: boolean, error: Error}>} 성공 여부 또는 에러
 */
export async function deletePetPhoto(filePath) {
  try {
    // 전체 URL에서 경로 부분만 추출
    const path = filePath.split('pets-photos/')[1];
    
    // Supabase Storage에서 파일 삭제
    const { error } = await supabase.storage
      .from('pets-photos')
      .remove([path]);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('파일 삭제 에러:', error);
    return { success: false, error };
  }
}

/**
 * 특정 반려 생물의 모든 사진을 가져오는 함수
 * @param {string} petId - 반려 생물 ID
 * @returns {Promise<{urls: string[], error: Error}>} 사진 URL 배열 또는 에러
 */
export async function getPetPhotos(petId) {
  try {
    // 특정 반려 생물 폴더의 모든 파일 리스트 가져오기
    const { data, error } = await supabase.storage
      .from('pets-photos')
      .list(petId, {
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;

    // 각 파일의 공개 URL 생성
    const urls = data.map(file => {
      const { data: publicUrlData } = supabase.storage
        .from('pets-photos')
        .getPublicUrl(`${petId}/${file.name}`);
      
      return publicUrlData.publicUrl;
    });

    return { urls, error: null };
  } catch (error) {
    console.error('파일 목록 가져오기 에러:', error);
    return { urls: [], error };
  }
}
