'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * 인증된 사용자만 접근할 수 있도록 하는 가드 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @returns {React.ReactNode} - 자식 컴포넌트 또는 null (리다이렉트 중)
 */
export default function AuthGuard({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중이 아니고, 세션이 없으면 로그인 페이지로 리다이렉트
    if (status !== 'loading' && !session) {
      router.push('/auth');
    }
  }, [session, status, router]);

  // 로딩 중이거나 세션이 없으면 로딩 표시
  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return children;
}

/**
 * 로그인한 사용자가 접근하면 대시보드로 리다이렉트하는 가드 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @returns {React.ReactNode} - 자식 컴포넌트 또는 null (리다이렉트 중)
 */
export function UnauthGuard({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중이 아니고, 세션이 있으면 대시보드로 리다이렉트
    if (status !== 'loading' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // 로딩 중이면 로딩 표시
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return children;
}
