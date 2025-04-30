'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { updateCare } from '@/lib/actions/careActions';

/**
 * 케어 폼 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.initialData - 초기 데이터
 * @param {string} props.initialData.id - 케어 항목 ID
 * @param {string} props.initialData.title - 케어 항목 제목
 * @param {string} props.initialData.description - 케어 항목 설명
 * @param {string} props.initialData.time - 케어 항목 시간
 * @param {string} props.initialData.repeat - 케어 항목 반복 주기
 * @param {boolean} props.initialData.notify - 케어 항목 알림 여부
 */
export function CareForm({ initialData }) {
  const router = useRouter();
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (checked) => {
    setForm((prev) => ({ ...prev, notify: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const success = await updateCare(form);

    setLoading(false);
    if (success) {
      router.push(`/care/${form.id}`);
      router.refresh();
    } else {
      alert('케어 항목 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/care/${initialData.id}`} className="flex items-center text-sm text-neutral-600 hover:text-neutral-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          상세 페이지로 돌아가기
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
        <h1 className="text-xl font-bold mb-4">케어 항목 수정</h1>
        <p className="text-neutral-500 mb-6">케어 항목 정보를 수정하세요.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">설명</label>
            <Textarea
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">시간</label>
            <Input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">반복 주기</label>
            <select
              name="repeat"
              value={form.repeat}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
              <option value="none">반복 없음</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">알림 여부</label>
            <Switch
              checked={form.notify}
              onCheckedChange={handleSwitch}
            />
          </div>

          <div className="flex gap-4 mt-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? '수정 중...' : '수정 완료'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/care/${initialData.id}`)}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
