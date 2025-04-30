import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendCareReminderEmail, sendWithRetry } from '../../../../lib/mailer';

// Supabase 클라이언트 초기화 - 환경 변수가 없을 경우 기본값 사용
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fallback-key-for-build-process';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 오늘 예정된 케어 일정 조회
 * @returns {Promise<Array>} - 오늘 예정된 케어 일정 목록
 */
async function getTodayCares() {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    // 오늘 예정된 케어 일정 조회
    const { data, error } = await supabase
      .from('cares')
      .select(`
        *,
        pets:pet_id (
          id,
          name,
          type,
          breed,
          photo_url,
          user_id
        )
      `)
      .eq('next_date', today);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('오늘 예정된 케어 일정 조회 에러:', error);
    return [];
  }
}

/**
 * 사용자 프로필 정보 조회
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} - 사용자 프로필 정보
 */
async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('사용자 프로필 조회 에러:', error);
    return null;
  }
}

/**
 * 이메일 알림 발송 처리
 * @param {Object} care - 케어 일정 정보
 * @returns {Promise<Object>} - 이메일 발송 결과
 */
async function processCareNotification(care) {
  try {
    // 사용자 프로필 조회
    const userProfile = await getUserProfile(care.pets.user_id);
    
    // 알림 설정이 꺼져있거나 이메일이 없는 경우 스킵
    if (!userProfile || !userProfile.notifications_enabled || !userProfile.email) {
      return { 
        careId: care.id, 
        petName: care.pets.name, 
        skipped: true, 
        reason: !userProfile ? 'profile_not_found' : 
                !userProfile.notifications_enabled ? 'notifications_disabled' : 
                'email_missing'
      };
    }
    
    // 완료 URL 생성
    const completeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/care/${care.id}?complete=true`;
    
    // 이메일 발송 (재시도 로직 포함)
    const result = await sendWithRetry(
      sendCareReminderEmail,
      [{
        to: userProfile.email,
        userName: userProfile.full_name || '사용자',
        pet: care.pets,
        care: care,
        completeUrl: completeUrl,
        appUrl: process.env.NEXT_PUBLIC_APP_URL
      }]
    );
    
    return {
      careId: care.id,
      petName: care.pets.name,
      email: userProfile.email,
      success: result.success,
      error: result.error ? result.error.message : null,
      retries: result.retries
    };
  } catch (error) {
    console.error('케어 알림 처리 에러:', error);
    return {
      careId: care.id,
      petName: care.pets?.name || 'Unknown',
      success: false,
      error: error.message
    };
  }
}

/**
 * 일일 케어 알림 Cron Job 핸들러
 * @export
 * @async
 * @param {Request} request - Next.js API 요청 객체
 * @returns {Promise<NextResponse>} - API 응답
 */
export async function GET(request) {
  try {
    // API 키 검증 (보안 강화)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 오늘 예정된 케어 일정 조회
    const todayCares = await getTodayCares();
    
    if (todayCares.length === 0) {
      return NextResponse.json({
        success: true,
        message: '오늘 예정된 케어 일정이 없습니다.',
        timestamp: new Date().toISOString()
      });
    }
    
    // 각 케어 일정에 대해 이메일 알림 발송
    const results = await Promise.all(
      todayCares.map(care => processCareNotification(care))
    );
    
    // 결과 통계
    const stats = {
      total: results.length,
      success: results.filter(r => r.success).length,
      skipped: results.filter(r => r.skipped).length,
      failed: results.filter(r => !r.success && !r.skipped).length
    };
    
    return NextResponse.json({
      success: true,
      message: '일일 케어 알림 처리 완료',
      timestamp: new Date().toISOString(),
      stats,
      results
    });
  } catch (error) {
    console.error('일일 케어 알림 Cron Job 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Vercel Cron 설정 (매일 오전 6시 KST = 오전 9시 UTC-9)
export const dynamic = 'force-dynamic';
export const preferredRegion = 'icn1'; // Seoul region
export const maxDuration = 10; // 최대 실행 시간 10초

// 주의: Vercel Cron 설정은 vercel.json 파일에서 구성해야 합니다.
// cron: '0 21 * * *' // 매일 오전 6시 KST (UTC+9) = 매일 오후 9시 UTC
