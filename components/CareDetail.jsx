'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { calculateDaysLeft, formatDateToKorean } from '@/lib/dateUtils';
import { completeCare } from '@/lib/supabaseData';

/**
 * 케어 상세 정보 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.care - 케어 정보
 * @param {Object} props.pet - 반려 생물 정보
 * @param {boolean} props.autoComplete - 자동 완료 여부 (URL 파라미터에서 전달)
 * @returns {React.ReactNode} - 케어 상세 정보 컴포넌트
 */
export default function CareDetail({ care, pet, autoComplete = false }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 날짜 계산
  const daysLeft = calculateDaysLeft(care?.next_date);
  const isToday = daysLeft === 0;
  const isOverdue = daysLeft < 0;
  
  // 완료 가능 여부
  const canComplete = isToday || isOverdue;
  
  // 자동 완료 처리
  useState(() => {
    if (autoComplete && canComplete && !isSubmitting) {
      handleComplete();
    }
  }, [autoComplete, canComplete]);

  // 케어 완료 처리
  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      
      const { error } = await completeCare(care.id);
      
      if (error) throw error;
      
      toast({
        title: '케어 완료!',
        description: `${pet.name}의 ${care.care_type} 케어가 완료되었습니다.`,
        variant: 'success',
      });
      
      // 페이지 새로고침 (데이터 갱신)
      router.refresh();
      
    } catch (error) {
      console.error('케어 완료 오류:', error);
      toast({
        title: '오류 발생',
        description: '케어 완료 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 뒤로 가기
  const handleBack = () => {
    router.back();
  };

  // 케어 정보가 없는 경우
  if (!care || !pet) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">케어 정보를 찾을 수 없습니다</h2>
        <p className="text-neutral-600 mb-6">요청하신 케어 정보가 존재하지 않거나 접근 권한이 없습니다.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> 돌아가기
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> 돌아가기
        </Button>
        
        <Badge 
          variant={
            isOverdue ? 'destructive' : 
            isToday ? 'warning' : 
            'primary'
          }
          className="px-3 py-1"
        >
          {isOverdue ? '지난 일정' : isToday ? '오늘 일정' : `D-${daysLeft}`}
        </Badge>
      </div>
      
      {/* 반려 생물 정보 */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 반려 생물 사진 */}
          <div className="w-full md:w-1/3">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
              {pet.photo_url ? (
                <Image
                  src={pet.photo_url}
                  alt={pet.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-400">
                  사진 없음
                </div>
              )}
            </div>
          </div>
          
          {/* 반려 생물 및 케어 정보 */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">{pet.name}</h1>
              <p className="text-neutral-600">{pet.type}{pet.breed ? ` · ${pet.breed}` : ''}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">케어 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-neutral-50 rounded-md">
                    <p className="text-sm text-neutral-500 mb-1">케어 종류</p>
                    <p className="font-medium">{care.care_type}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-md">
                    <p className="text-sm text-neutral-500 mb-1">반복 주기</p>
                    <p className="font-medium">{care.cycle_days}일마다</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-2">일정</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-neutral-50 rounded-md flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">다음 일정</p>
                      <p className="font-medium">{formatDateToKorean(care.next_date)}</p>
                    </div>
                  </div>
                  
                  {care.last_completed && (
                    <div className="p-3 bg-neutral-50 rounded-md flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-neutral-500 mb-1">마지막 완료</p>
                        <p className="font-medium">{formatDateToKorean(care.last_completed)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* 완료 버튼 */}
      <div className="flex justify-center mt-6">
        <Button
          size="lg"
          className="w-full md:w-auto md:px-12"
          disabled={!canComplete || isSubmitting}
          onClick={handleComplete}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          {isSubmitting ? '처리 중...' : '케어 완료하기'}
        </Button>
        
        {!canComplete && (
          <p className="text-sm text-neutral-500 mt-2 text-center">
            예정일(D-Day)에 도달했을 때 완료할 수 있습니다.
          </p>
        )}
      </div>
    </div>
  );
}
