'use client';

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

/**
 * 플로팅 추가 버튼 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.href - 이동할 경로
 * @param {string} props.label - 버튼 레이블 (화면 리더용)
 * @returns {React.ReactNode} - 플로팅 추가 버튼 컴포넌트
 */
export default function FloatingAddButton({ href = '/register', label = '새 반려 등록' }) {
  return (
    <Link href={href}>
      <button
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 z-10"
        aria-label={label}
      >
        <PlusCircle className="h-6 w-6" />
        <span className="sr-only">{label}</span>
      </button>
    </Link>
  );
}
