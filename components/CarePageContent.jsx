'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import CareTable from '@/components/CareTable';
import CareSortSelect from '@/components/CareSortSelect';
import { getAllCares, completeCare } from '../lib/supabaseData';
import { calculateDaysLeft } from '../lib/dateUtils';

/**
 * 케어 페이지 클라이언트 컴포넌트
 * @returns {React.ReactNode} - 케어 페이지 컴포넌트
 */
export default function CarePageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [cares, setCares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortKey, setSortKey] = useState('created_desc');

  // 케어 일정 데이터 가져오기
  useEffect(() => {
    async function fetchCares() {
      try {
        const caresData = await getAllCares();
        setCares(caresData);
      } catch (err) {
        setError(err.message);
        toast({
          title: '오류 발생',
          description: '케어 일정을 불러오는 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCares();
  }, [toast]);

  // 케어 완료 처리
  const handleCompleteCare = async (id) => {
    try {
      await completeCare(id);
      
      // 데이터 갱신
      const caresData = await getAllCares();
      setCares(caresData);
      
      toast({
        title: '케어 완료',
        description: '케어 일정이 완료 처리되었습니다.',
      });
    } catch (err) {
      toast({
        title: '오류 발생',
        description: '케어 완료 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 케어 항목 클릭 시 상세 페이지로 이동
  const handleCareClick = (id) => {
    router.push(`/care/${id}`);
  };

  // 로딩 중인 경우
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 에러가 발생한 경우
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">오류가 발생했습니다</h2>
        <p className="text-neutral-600">{error}</p>
      </div>
    );
  }

  // 필터링된 케어 목록 가져오기
  const filteredCares = showCompleted
    ? cares.filter(care => care.is_completed)
    : cares;
    
  // 정렬된 케어 목록 가져오기
  const sortedCares = [...filteredCares].sort((a, b) => {
    switch (sortKey) {
      case 'created_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'created_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'title_desc':
        return b.title.localeCompare(a.title);
      case 'completed_desc':
        return Number(b.is_completed) - Number(a.is_completed);
      case 'completed_asc':
        return Number(a.is_completed) - Number(b.is_completed);
      default:
        return 0;
    }
  });
    
  // 데이터가 없는 경우
  if (cares.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">등록된 케어 일정이 없습니다</h2>
        <p className="text-neutral-600 mb-6">반려 생물을 등록하고 케어 일정을 추가해보세요.</p>
        <Link href="/register">
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
            반려 생물 등록하기
          </button>
        </Link>
      </div>
    );
  }
  
  // 필터링 후 데이터가 없는 경우
  if (sortedCares.length === 0 && showCompleted) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">케어 일정 관리</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="h-4 w-4"
              />
              완료된 항목만 보기
            </label>
            <Link href="/care/new" className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md">
              + 새 Care
            </Link>
          </div>
        </div>
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-neutral-100">
          <p className="text-neutral-600">완료된 케어 항목이 없습니다.</p>
          <button 
            onClick={() => setShowCompleted(false)}
            className="mt-4 text-primary-500 hover:text-primary-600 underline"
          >
            모든 케어 항목 보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">케어 일정 관리</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="h-4 w-4"
              />
              완료된 항목만 보기
            </label>
            <CareSortSelect 
              defaultValue={sortKey} 
              onChange={setSortKey} 
            />
          </div>
          <Link href="/care/new" className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md">
            + 새 Care
          </Link>
        </div>
      </div>
      
      <CareTable 
        cares={sortedCares} 
        onComplete={handleCompleteCare} 
      />
    </div>
  );
}
