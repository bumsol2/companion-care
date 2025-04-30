'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, 
  Calendar, 
  BarChart, 
  ListChecks, 
  CalendarClock,
  FilterIcon
} from 'lucide-react';
import { getCareStats } from '@/lib/actions/careStats';

/**
 * 케어 통계 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {number} props.total - 전체 케어 항목 수
 * @param {number} props.completed - 완료된 케어 항목 수
 * @param {number} props.completionRate - 완료율 (%)
 * @param {number} props.weeklyCompleted - 최근 일주일 완료 수
 * @param {number} props.monthlyCompleted - 최근 한 달 완료 수
 * @param {string} props.period - 현재 선택된 기간
 * @returns {React.ReactNode} - 케어 통계 컴포넌트
 */
export default function CareStats({ 
  total, 
  completed, 
  completionRate, 
  weeklyCompleted, 
  monthlyCompleted,
  period = 'all'
}) {
  const [stats, setStats] = useState({ 
    total, 
    completed, 
    completionRate, 
    weeklyCompleted, 
    monthlyCompleted,
    period
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // 기간 변경 시 호출되는 함수
  const handlePeriodChange = async (newPeriod) => {
    if (newPeriod === stats.period) return;
    
    setIsLoading(true);
    try {
      // 서버 액션 호출
      const newStats = await getCareStats(newPeriod);
      setStats(newStats);
    } catch (error) {
      console.error('통계 데이터 가져오기 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">케어 통계</h2>
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-neutral-500" />
          <Select value={stats.period} onValueChange={handlePeriodChange} disabled={isLoading}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="week">이번 주</SelectItem>
              <SelectItem value="month">이번 달</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 케어 항목</CardTitle>
            <ListChecks className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-neutral-200 animate-pulse rounded-md"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.total}개</div>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              등록된 모든 케어 항목
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">완료된 케어</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-neutral-200 animate-pulse rounded-md"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.completed}개</div>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              완료 처리된 케어 항목
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">완료율</CardTitle>
            <BarChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-neutral-200 animate-pulse rounded-md"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
            )}
            <div className="w-full bg-neutral-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${isLoading ? 0 : stats.completionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">최근 일주일</CardTitle>
            <Calendar className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-neutral-200 animate-pulse rounded-md"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.weeklyCompleted}개</div>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              최근 7일 동안 완료한 케어 항목
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">최근 한 달</CardTitle>
            <CalendarClock className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-neutral-200 animate-pulse rounded-md"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.monthlyCompleted}개</div>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              최근 30일 동안 완료한 케어 항목
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
