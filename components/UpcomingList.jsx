'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { calculateDaysLeft, formatDateToKorean } from '@/lib/dateUtils';
import { CheckCircle } from 'lucide-react';
import { completeCare } from '@/lib/supabaseData';
import { useState } from 'react';

/**
 * 다가오는 케어 일정 목록 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.cares - 케어 일정 목록
 * @param {Function} props.onCareComplete - 케어 완료 시 호출할 함수
 * @param {number} props.limit - 표시할 최대 항목 수 (기본값: 5)
 * @returns {React.ReactNode} - 다가오는 케어 일정 목록 컴포넌트
 */
export default function UpcomingList({ cares, onCareComplete, limit = 5 }) {
  const [loadingCareId, setLoadingCareId] = useState(null);

  // 케어 완료 처리 함수
  const handleComplete = async (careId) => {
    try {
      setLoadingCareId(careId);
      const { success, error } = await completeCare(careId);
      
      if (error) throw error;
      if (success && onCareComplete) {
        onCareComplete(careId);
      }
    } catch (error) {
      console.error('케어 완료 처리 중 오류:', error);
    } finally {
      setLoadingCareId(null);
    }
  };

  // 케어 일정이 없는 경우
  if (!cares || cares.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
        <h2 className="text-xl font-semibold mb-4">다가오는 케어 일정</h2>
        <div className="py-8 text-center text-neutral-500">
          <p>예정된 케어 일정이 없습니다.</p>
          <p className="text-sm mt-2">반려 생물을 등록하고 케어 일정을 추가해보세요.</p>
        </div>
      </div>
    );
  }

  // 케어 일정을 날짜순으로 정렬하고 제한된 수만 표시
  const sortedCares = [...cares]
    .sort((a, b) => {
      const daysLeftA = calculateDaysLeft(a.next_date);
      const daysLeftB = calculateDaysLeft(b.next_date);
      return daysLeftA - daysLeftB;
    })
    .slice(0, limit);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
      <h2 className="text-xl font-semibold mb-4">다가오는 케어 일정</h2>
      <div className="space-y-3">
        {sortedCares.map((care) => {
          const daysLeft = calculateDaysLeft(care.next_date);
          const isToday = daysLeft === 0;
          const isPast = daysLeft < 0;
          
          return (
            <div key={care.id} className="flex justify-between items-center p-3 border-b">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{care.pets.name}</p>
                  <span className="text-xs text-neutral-500">{care.pets.type}</span>
                </div>
                <p className="text-sm text-neutral-500">
                  {care.care_type} - {formatDateToKorean(care.next_date)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    isPast ? 'destructive' : 
                    isToday ? 'warning' : 
                    'primary'
                  }
                >
                  {isPast ? '지남' : isToday ? '오늘' : `D-${daysLeft}`}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleComplete(care.id)}
                  disabled={loadingCareId === care.id}
                  title="케어 완료"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {cares.length > limit && (
        <div className="mt-4 text-center">
          <Link href="/care">
            <Button variant="outline" size="sm">
              모든 케어 일정 보기
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
