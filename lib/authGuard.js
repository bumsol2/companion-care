'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import supabase from './supabaseBrowserClient';

/**
 * 인증 가드 훅
 * 로그인하지 않은 사용자를 로그인 페이지로 리다이렉트
 * @returns {Object} { user, loading, error }
 */
export function useAuthGuard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);
        
        // 현재 세션 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          // 세션이 없으면 로그인 페이지로 리다이렉트
          router.push('/auth');
          return;
        }

        // 사용자 정보 설정
        setUser(session.user);
      } catch (err) {
        console.error('인증 확인 중 오류 발생:', err);
        setError(err);
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  return { user, loading, error };
}

/**
 * 인증 상태 확인 함수
 * 서버 컴포넌트에서 사용
 * @returns {Promise<Object>} { user, error }
 */
export async function checkAuthStatus() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }

    return { 
      user: session?.user || null,
      error: null
    };
  } catch (err) {
    console.error('인증 상태 확인 중 오류 발생:', err);
    return { 
      user: null, 
      error: err 
    };
  }
}

/**
 * 비인증 가드 컴포넌트
 * 이미 로그인한 사용자를 대시보드로 리다이렉트
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @returns {React.ReactNode} - 자식 컴포넌트 또는 로딩 상태
 */
export function UnauthGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // 현재 세션 확인
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('세션 확인 중 오류 발생:', error);
          setLoading(false);
          return;
        }

        if (session) {
          // 이미 로그인한 사용자는 대시보드로 리다이렉트
          router.push('/dashboard');
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error('인증 확인 중 오류 발생:', err);
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return children;
}
/**
 * 인증 가드 컴포넌트
 * 로그인하지 않은 사용자를 로그인 페이지로 리다이렉트
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @returns {React.ReactNode} - 자식 컴포넌트 또는 로딩 상태
 */
export function AuthGuard({ children }) {
  const { user, loading, error } = useAuthGuard();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!user && !loading) {
    return null; // useAuthGuard에서 리다이렉트 처리
  }
  
  return children;
}

export default AuthGuard;
