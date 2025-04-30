import supabase from './supabaseBrowserClient';

/**
 * 현재 사용자 프로필 정보 가져오기
 * @returns {Promise<{profile: Object, error: Error}>} 사용자 프로필 정보 또는 에러
 */
export async function getUserProfile() {
  try {
    // 현재 로그인된 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) return { profile: null, error: new Error('로그인되지 않은 사용자') };

    // 사용자 프로필 정보 조회
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      // 프로필이 없는 경우 기본 프로필 생성
      if (error.code === 'PGRST116') {
        return await createDefaultProfile(user);
      }
      throw error;
    }
    
    return { profile: data, error: null };
  } catch (error) {
    console.error('사용자 프로필 가져오기 에러:', error);
    return { profile: null, error };
  }
}

/**
 * 기본 사용자 프로필 생성
 * @param {Object} user - 사용자 정보
 * @returns {Promise<{profile: Object, error: Error}>} 생성된 프로필 정보 또는 에러
 */
async function createDefaultProfile(user) {
  try {
    const defaultProfile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      notifications_enabled: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([defaultProfile])
      .select()
      .single();
    
    if (error) throw error;
    
    return { profile: data, error: null };
  } catch (error) {
    console.error('기본 프로필 생성 에러:', error);
    return { profile: null, error };
  }
}

/**
 * 사용자 프로필 업데이트
 * @param {Object} profileData - 업데이트할 프로필 데이터
 * @returns {Promise<{success: boolean, error: Error}>} 성공 여부 또는 에러
 */
export async function updateUserProfile(profileData) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) return { success: false, error: new Error('로그인되지 않은 사용자') };

    // 업데이트 데이터에 updated_at 추가
    const updateData = {
      ...profileData,
      updated_at: new Date()
    };

    // 프로필 정보 업데이트
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);
    
    if (error) throw error;
    
    // Auth 메타데이터도 업데이트 (이름 변경 시)
    if (profileData.full_name) {
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: { full_name: profileData.full_name }
      });
      
      if (updateAuthError) throw updateAuthError;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('프로필 업데이트 에러:', error);
    return { success: false, error };
  }
}

/**
 * 사용자 프로필 이미지 업로드
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<{path: string, error: Error}>} 업로드된 이미지 경로 또는 에러
 */
export async function uploadProfileImage(file) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) return { path: null, error: new Error('로그인되지 않은 사용자') };

    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Storage에 이미지 업로드
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
    
    if (error) throw error;
    
    // 이미지 공개 URL 가져오기
    const { data: publicURL } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    // 프로필 업데이트
    await updateUserProfile({ avatar_url: publicURL.publicUrl });
    
    return { path: publicURL.publicUrl, error: null };
  } catch (error) {
    console.error('프로필 이미지 업로드 에러:', error);
    return { path: null, error };
  }
}

/**
 * 알림 설정 업데이트
 * @param {boolean} enabled - 알림 활성화 여부
 * @returns {Promise<{success: boolean, error: Error}>} 성공 여부 또는 에러
 */
export async function updateNotificationSettings(enabled) {
  try {
    return await updateUserProfile({ notifications_enabled: enabled });
  } catch (error) {
    console.error('알림 설정 업데이트 에러:', error);
    return { success: false, error };
  }
}
