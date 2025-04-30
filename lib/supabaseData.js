import supabase from './supabaseBrowserClient';

/**
 * 사용자의 모든 반려 생물 목록 가져오기
 * @returns {Promise<{pets: Array, error: Error}>} 반려 생물 목록 또는 에러
 */
export async function getUserPets() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) return { pets: [], error: new Error('로그인되지 않은 사용자') };

    // 사용자의 반려 생물 목록 조회
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { pets: data, error: null };
  } catch (error) {
    console.error('반려 생물 목록 가져오기 에러:', error);
    return { pets: [], error };
  }
}

/**
 * 반려 생물 상세 정보 가져오기
 * @param {string} petId - 반려 생물 ID
 * @returns {Promise<{pet: Object, error: Error}>} 반려 생물 정보 또는 에러
 */
export async function getPetDetails(petId) {
  try {
    // 반려 생물 정보 조회
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();
    
    if (error) throw error;
    
    return { pet: data, error: null };
  } catch (error) {
    console.error('반려 생물 정보 가져오기 에러:', error);
    return { pet: null, error };
  }
}

/**
 * 새 반려 생물 등록하기
 * @param {Object} petData - 반려 생물 데이터 (name, type, breed, photo_url)
 * @returns {Promise<{pet: Object, error: Error}>} 등록된 반려 생물 정보 또는 에러
 */
export async function createPet(petData) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) return { pet: null, error: new Error('로그인되지 않은 사용자') };

    // 반려 생물 등록
    const { data, error } = await supabase
      .from('pets')
      .insert([
        { 
          user_id: user.id,
          name: petData.name,
          type: petData.type,
          breed: petData.breed || null,
          photo_url: petData.photo_url || null
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    return { pet: data, error: null };
  } catch (error) {
    console.error('반려 생물 등록 에러:', error);
    return { pet: null, error };
  }
}

/**
 * 반려 생물 정보 업데이트
 * @param {string} petId - 반려 생물 ID
 * @param {Object} petData - 업데이트할 데이터
 * @returns {Promise<{success: boolean, error: Error}>} 성공 여부 또는 에러
 */
export async function updatePet(petId, petData) {
  try {
    // 업데이트 데이터에 updated_at 추가
    const updateData = {
      ...petData,
      updated_at: new Date()
    };

    // 반려 생물 정보 업데이트
    const { error } = await supabase
      .from('pets')
      .update(updateData)
      .eq('id', petId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('반려 생물 정보 업데이트 에러:', error);
    return { success: false, error };
  }
}

/**
 * 반려 생물 삭제
 * @param {string} petId - 삭제할 반려 생물 ID
 * @returns {Promise<{success: boolean, error: Error}>} 성공 여부 또는 에러
 */
export async function deletePet(petId) {
  try {
    // 먼저 관련 케어 일정 삭제
    const { error: caresError } = await supabase
      .from('cares')
      .delete()
      .eq('pet_id', petId);
    
    if (caresError) throw caresError;

    // 반려 생물 삭제
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('반려 생물 삭제 에러:', error);
    return { success: false, error };
  }
}

/**
 * 반려 생물의 케어 일정 목록 가져오기
 * @param {string} petId - 반려 생물 ID
 * @returns {Promise<{cares: Array, error: Error}>} 케어 일정 목록 또는 에러
 */
export async function getPetCares(petId) {
  try {
    // 반려 생물의 케어 일정 조회
    const { data, error } = await supabase
      .from('cares')
      .select('*')
      .eq('pet_id', petId)
      .order('next_date', { ascending: true });
    
    if (error) throw error;
    
    return { cares: data, error: null };
  } catch (error) {
    console.error('케어 일정 목록 가져오기 에러:', error);
    return { cares: [], error };
  }
}

/**
 * 새 케어 일정 등록하기
 * @param {Object} careData - 케어 일정 데이터 (pet_id, care_type, cycle_days, next_date)
 * @returns {Promise<{care: Object, error: Error}>} 등록된 케어 일정 정보 또는 에러
 */
export async function createCare(careData) {
  try {
    // 케어 일정 등록
    const { data, error } = await supabase
      .from('cares')
      .insert([careData])
      .select()
      .single();
    
    if (error) throw error;
    
    return { care: data, error: null };
  } catch (error) {
    console.error('케어 일정 등록 에러:', error);
    return { care: null, error };
  }
}

/**
 * 케어 일정 완료 처리
 * @param {string} careId - 케어 일정 ID
 * @returns {Promise<{success: boolean, error: Error}>} 성공 여부 또는 에러
 */
export async function completeCare(careId) {
  try {
    // 케어 일정 완료 처리 (last_completed 업데이트)
    // 트리거에 의해 next_date가 자동으로 계산됨
    const { error } = await supabase
      .from('cares')
      .update({ last_completed: new Date() })
      .eq('id', careId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('케어 일정 완료 처리 에러:', error);
    return { success: false, error };
  }
}

/**
 * 다가오는 모든 케어 일정 가져오기
 * @param {number} days - 조회할 일수 (기본값: 7일)
 * @returns {Promise<{cares: Array, error: Error}>} 케어 일정 목록 또는 에러
 */
export async function getUpcomingCares(days = 7) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) return { cares: [], error: new Error('로그인되지 않은 사용자') };

    // 현재 날짜와 지정된 일수 후의 날짜 계산
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);

    // 사용자의 모든 반려 생물 ID 가져오기
    const { data: pets, error: petsError } = await supabase
      .from('pets')
      .select('id')
      .eq('user_id', user.id);
    
    if (petsError) throw petsError;
    
    if (!pets || pets.length === 0) {
      return { cares: [], error: null };
    }

    const petIds = pets.map(pet => pet.id);

    // 다가오는 케어 일정 조회
    const { data, error } = await supabase
      .from('cares')
      .select('*, pets:pet_id(name, type)')
      .in('pet_id', petIds)
      .gte('next_date', today.toISOString().split('T')[0])
      .lte('next_date', endDate.toISOString().split('T')[0])
      .order('next_date', { ascending: true });
    
    if (error) throw error;
    
    return { cares: data, error: null };
  } catch (error) {
    console.error('다가오는 케어 일정 가져오기 에러:', error);
    return { cares: [], error };
  }
}

/**
 * 사용자의 모든 케어 일정 가져오기
 * @returns {Promise<{cares: Array, error: Error}>} 케어 일정 목록 또는 에러
 */
export async function getAllCares() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) return { cares: [], error: new Error('로그인되지 않은 사용자') };

    // 사용자의 모든 반려 생물 ID 가져오기
    const { data: pets, error: petsError } = await supabase
      .from('pets')
      .select('id')
      .eq('user_id', user.id);
    
    if (petsError) throw petsError;
    
    if (!pets || pets.length === 0) {
      return { cares: [], error: null };
    }

    const petIds = pets.map(pet => pet.id);

    // 모든 케어 일정 조회
    const { data, error } = await supabase
      .from('cares')
      .select('*, pets:pet_id(name, type, breed, photo_url)')
      .in('pet_id', petIds)
      .order('next_date', { ascending: true });
    
    if (error) throw error;
    
    return { cares: data, error: null };
  } catch (error) {
    console.error('모든 케어 일정 가져오기 에러:', error);
    return { cares: [], error };
  }
}

/**
 * 특정 케어 일정 상세 정보 가져오기
 * @param {string} careId - 케어 일정 ID
 * @returns {Promise<{care: Object, pet: Object, error: Error}>} 케어 일정 정보와 반려 생물 정보 또는 에러
 */
export async function getCareDetails(careId) {
  try {
    // 케어 일정 정보 조회
    const { data: care, error: careError } = await supabase
      .from('cares')
      .select('*')
      .eq('id', careId)
      .single();
    
    if (careError) throw careError;
    
    // 반려 생물 정보 조회
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', care.pet_id)
      .single();
    
    if (petError) throw petError;
    
    return { care, pet, error: null };
  } catch (error) {
    console.error('케어 일정 상세 정보 가져오기 에러:', error);
    return { care: null, pet: null, error };
  }
}
