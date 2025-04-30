'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { toggleCareCompletion } from '@/lib/actions/careActions';
import { useToast } from '@/components/ui/use-toast';

/**
 * 케어 완료 체크박스 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.careId - 케어 항목 ID
 * @param {boolean} props.initialCompleted - 초기 완료 상태
 * @returns {React.ReactNode} - 케어 완료 체크박스 컴포넌트
 */
export default function CareCompletionCheckbox({ careId, initialCompleted = false }) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked) => {
    // 이벤트 버블링 방지
    event.stopPropagation();
    
    setIsLoading(true);
    try {
      // 서버 액션 호출하여 완료 상태 토글
      const { success, error } = await toggleCareCompletion({
        id: careId,
        isCompleted: checked
      });

      if (success) {
        setIsCompleted(checked);
        toast({
          title: checked ? '케어 완료!' : '케어 완료 취소',
          description: checked 
            ? '케어 항목이 완료 처리되었습니다.' 
            : '케어 항목의 완료 상태가 취소되었습니다.',
          variant: checked ? 'success' : 'default',
        });
      } else {
        throw error;
      }
    } catch (error) {
      console.error('케어 완료 상태 변경 오류:', error);
      toast({
        title: '오류 발생',
        description: '케어 완료 상태를 변경하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className="flex items-center">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        className={isCompleted ? 'bg-green-500 border-green-500' : ''}
        aria-label={isCompleted ? '케어 완료됨' : '케어 미완료'}
      />
      {isLoading && (
        <div className="ml-2 w-3 h-3 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
      )}
    </div>
  );
}
