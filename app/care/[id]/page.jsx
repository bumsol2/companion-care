export const dynamic = 'force-dynamic';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuthGuard from '../../../lib/authGuard';

/**
 * 케어 상세 페이지 (서버 컴포넌트)
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.params - 페이지 파라미터
 * @param {string} props.params.id - 케어 ID
 */
async function CareDetailContent({ params }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: care, error } = await supabase
    .from('cares')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !care) {
    redirect('/care'); // 데이터 없으면 목록으로 리다이렉트
  }

  // 반복 주기 표시 텍스트 변환
  const getRepeatText = (repeat) => {
    switch(repeat) {
      case 'daily': return '매일';
      case 'weekly': return '매주';
      case 'monthly': return '매월';
      case 'none': return '반복 없음';
      default: return repeat;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/care" className="flex items-center text-sm text-neutral-600 hover:text-neutral-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
        <h1 className="text-2xl font-bold mb-4">{care.title}</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-neutral-500">설명</h3>
            <p className="mt-1">{care.description || '설명이 없습니다.'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-500">시간</h3>
              <p className="mt-1">{care.time || '지정되지 않음'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-500">반복 주기</h3>
              <p className="mt-1">{getRepeatText(care.repeat)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-500">알림 설정</h3>
              <div className="mt-1 flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${care.notify ? 'bg-green-500' : 'bg-neutral-300'}`}></span>
                <span>{care.notify ? '활성화' : '비활성화'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href={`/care/${care.id}/edit`}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            수정하기
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * 케어 상세 페이지 (인증 보호 적용)
 */
export default function CareDetailPage({ params }) {
  return (
    <AuthGuard>
      <CareDetailContent params={params} />
    </AuthGuard>
  );
}
