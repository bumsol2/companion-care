export const dynamic = 'force-dynamic';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { CareForm } from '@/components/CareForm';
import AuthGuard from '../../../../lib/authGuard';

/**
 * 케어 항목 편집 페이지 (서버 컴포넌트)
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.params - 페이지 파라미터
 * @param {string} props.params.id - 케어 ID
 */
async function CareEditContent({ params }) {
  const supabase = createServerComponentClient({ cookies });

  const { data: care, error } = await supabase
    .from('cares')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!care || error) {
    return notFound();
  }

  return <CareForm initialData={care} />;
}

/**
 * 케어 항목 편집 페이지 (인증 보호 적용)
 */
export default function CareEditPage({ params }) {
  return (
    <AuthGuard>
      <CareEditContent params={params} />
    </AuthGuard>
  );
}
