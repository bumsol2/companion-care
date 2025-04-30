'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import AuthGuard from '../../../lib/authGuard';

export default function NewCarePage() {
  return (
    <AuthGuard>
      <CareForm />
    </AuthGuard>
  );
}

function CareForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    time: '09:00',
    repeat: 'daily',
    notify: true
  });

  const supabase = createClientComponentClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 현재 로그인한 사용자 정보 가져오기
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) throw new Error('로그인이 필요합니다');

      // Care 항목 저장
      const { error } = await supabase
        .from('cares')
        .insert([
          {
            ...form,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      // 성공 시 케어 목록으로 리다이렉트
      router.push('/care');
      router.refresh();
    } catch (error) {
      console.error('Care 항목 저장 중 오류 발생:', error);
      alert('Care 항목을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Link href="/care" className="flex items-center text-sm text-neutral-600 hover:text-neutral-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Care 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
        <h1 className="text-xl font-bold mb-4">새 Care 항목 등록</h1>
        <p className="text-neutral-500 mb-6">반려 생물을 위한 케어 일정을 등록하세요.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">제목 *</label>
            <input
              type="text"
              placeholder="예: 혈압약 복용"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">설명 (선택사항)</label>
            <textarea
              placeholder="추가 설명을 입력하세요"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">시간</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">반복 주기</label>
            <select
              value={form.repeat}
              onChange={(e) => setForm({ ...form, repeat: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
              <option value="none">반복 없음</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm font-medium">
              <span>알림 받기</span>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.notify}
                onChange={(e) => setForm({ ...form, notify: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? '저장 중...' : 'Care 항목 등록'}
          </button>
        </form>
      </div>
    </div>
  );
}
