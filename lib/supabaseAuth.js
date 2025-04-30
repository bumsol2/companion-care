import supabase from './supabaseBrowserClient';

/**
 * Google OAuth를 통한 로그인 함수
 * @returns {Promise<{user: Object, error: Error}>} 사용자 정보 또는 에러
 */
export async function signInWithGoogle() {
  try {
    // 절대 URL을 사용하여 리다이렉트 URL 설정
    const redirectUrl = 'https://companion-care-black.vercel.app/auth/callback';
    console.log('리다이렉트 URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'email profile',
      },
    });

    if (error) {
      console.error('Google OAuth 시작 오류:', error.message);
      throw error;
    }
    
    console.log('OAuth 시작 성공, 리다이렉트 중...');
    return { data, error: null };
  } catch (error) {
    console.error('Google 로그인 에러:', error);
    return { data: null, error };
  }
}

/**
 * 현재 로그인된 사용자 정보 가져오기
 * @returns {Promise<{user: Object, error: Error}>} 사용자 정보 또는 에러
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    console.error('사용자 정보 가져오기 에러:', error);
    return { user: null, error };
  }
}

/**
 * 로그아웃 함수
 * @returns {Promise<{success: boolean, error: Error}>} 성공 여부 또는 에러
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('로그아웃 에러:', error);
    return { success: false, error };
  }
}

/**
 * 사용자 프로필 정보 가져오기
 * @returns {Promise<{profile: Object, error: Error}>} 프로필 정보 또는 에러
 */
export async function getUserProfile() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) return { profile: null, error: new Error('로그인되지 않은 사용자') };

    // users 테이블에서 추가 정보 가져오기
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    
    return { profile: { ...user, ...data }, error: null };
  } catch (error) {
    console.error('프로필 정보 가져오기 에러:', error);
    return { profile: null, error };
  }
}

/**
 * 사용자 로케일 업데이트
 * @param {string} locale - 업데이트할 로케일 (예: 'ko-KR')
 * @returns {Promise<{success: boolean, error: Error}>} 성공 여부 또는 에러
 */
export async function updateUserLocale(locale) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) return { success: false, error: new Error('로그인되지 않은 사용자') };

    // users 테이블 업데이트
    const { error } = await supabase
      .from('users')
      .update({ locale, updated_at: new Date() })
      .eq('id', user.id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('로케일 업데이트 에러:', error);
    return { success: false, error };
  }
}
