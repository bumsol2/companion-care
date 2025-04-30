'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Calendar, Check, Filter, Search, CheckCircle } from 'lucide-react';
import CareCompletionCheckbox from './CareCompletionCheckbox';
import { calculateDaysLeft, formatDateToKorean } from '../lib/dateUtils';
import { getUserPets } from '../lib/supabaseData';

/**
 * 케어 일정 테이블 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.cares - 케어 일정 목록
 * @param {Function} props.onComplete - 케어 완료 처리 함수
 * @returns {React.ReactNode} - 케어 일정 테이블 컴포넌트
 */
export default function CareTable({ cares = [], onComplete }) {
  const router = useRouter();
  const [filteredCares, setFilteredCares] = useState(cares);
  const [pets, setPets] = useState([]);
  const [filters, setFilters] = useState({
    petId: '',
    careType: '',
    dateRange: 'all', // all, upcoming, today, overdue
    searchTerm: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // 반려 생물 목록 가져오기
  useEffect(() => {
    async function fetchPets() {
      try {
        const { pets: petsData } = await getUserPets();
        setPets(petsData || []);
      } catch (error) {
        console.error('반려 생물 목록 가져오기 오류:', error);
      }
    }
    
    fetchPets();
  }, []);

  // 필터 적용
  useEffect(() => {
    let result = [...cares];
    
    // 반려 생물 필터
    if (filters.petId) {
      result = result.filter(care => care.pet_id === filters.petId);
    }
    
    // 케어 종류 필터
    if (filters.careType) {
      result = result.filter(care => care.care_type === filters.careType);
    }
    
    // 날짜 범위 필터
    if (filters.dateRange !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (filters.dateRange) {
        case 'upcoming':
          result = result.filter(care => {
            const nextDate = new Date(care.next_date);
            return nextDate >= today;
          });
          break;
        case 'today':
          result = result.filter(care => {
            const nextDate = new Date(care.next_date);
            nextDate.setHours(0, 0, 0, 0);
            return nextDate.getTime() === today.getTime();
          });
          break;
        case 'overdue':
          result = result.filter(care => {
            const nextDate = new Date(care.next_date);
            return nextDate < today;
          });
          break;
      }
    }
    
    // 검색어 필터
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(care => 
        care.care_type.toLowerCase().includes(term) || 
        care.pets?.name?.toLowerCase().includes(term)
      );
    }
    
    // 날짜순 정렬
    result.sort((a, b) => new Date(a.next_date) - new Date(b.next_date));
    
    setFilteredCares(result);
  }, [cares, filters]);

  // 필터 변경 핸들러
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      petId: '',
      careType: '',
      dateRange: 'all',
      searchTerm: ''
    });
  };

  // 케어 종류 목록 (중복 제거)
  const careTypes = [...new Set(cares.map(care => care.care_type))];

  // 행 클릭 핸들러
  const handleRowClick = (careId) => {
    router.push(`/care/${careId}`);
  };

  // 완료 버튼 클릭 핸들러
  const handleComplete = async (e, careId) => {
    e.stopPropagation(); // 행 클릭 이벤트 전파 방지
    
    if (onComplete) {
      setIsLoading(true);
      await onComplete(careId);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 필터 섹션 */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-neutral-500" />
          <h3 className="text-sm font-medium">필터</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 반려 생물 필터 */}
          <div>
            <Select
              value={filters.petId}
              onValueChange={(value) => handleFilterChange('petId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="반려 생물 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name} ({pet.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 케어 종류 필터 */}
          <div>
            <Select
              value={filters.careType}
              onValueChange={(value) => handleFilterChange('careType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="케어 종류 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                {careTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 날짜 범위 필터 */}
          <div>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => handleFilterChange('dateRange', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="날짜 범위 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 기간</SelectItem>
                <SelectItem value="upcoming">예정된 일정</SelectItem>
                <SelectItem value="today">오늘</SelectItem>
                <SelectItem value="overdue">지난 일정</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* 검색 필터 */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              className="pl-8"
              placeholder="검색어 입력"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>
        </div>
        
        {/* 필터 초기화 버튼 */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            필터 초기화
          </Button>
        </div>
      </div>
      
      {/* 테이블 */}
      {filteredCares.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>반려 생물</TableHead>
                <TableHead>케어 종류</TableHead>
                <TableHead>다음 일정</TableHead>
                <TableHead>주기 (일)</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCares.map((care) => {
                const daysLeft = calculateDaysLeft(care.next_date);
                const isToday = daysLeft === 0;
                const isOverdue = daysLeft < 0;
                
                return (
                  <TableRow 
                    key={care.id}
                    className="cursor-pointer hover:bg-neutral-50"
                    onClick={() => handleRowClick(care.id)}
                  >
                    <TableCell>
                      <div className={`font-medium ${care.is_completed ? 'line-through text-neutral-400' : ''}`}>
                        {care.pets?.name}
                      </div>
                      <div className="text-xs text-neutral-500">{care.pets?.type}</div>
                    </TableCell>
                    <TableCell className={care.is_completed ? 'line-through text-neutral-400' : ''}>
                      {care.care_type}
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 ${care.is_completed ? 'line-through text-neutral-400' : ''}`}>
                        <Calendar className="h-4 w-4 text-neutral-500" />
                        {formatDateToKorean(care.next_date)}
                      </div>
                    </TableCell>
                    <TableCell className={care.is_completed ? 'line-through text-neutral-400' : ''}>
                      {care.cycle_days}일
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          isOverdue ? 'destructive' : 
                          isToday ? 'warning' : 
                          'primary'
                        }
                      >
                        {isOverdue ? '지남' : isToday ? '오늘' : `D-${daysLeft}`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        {care.is_completed && (
                          <span className="text-green-500 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">완료됨</span>
                          </span>
                        )}
                        <CareCompletionCheckbox 
                          careId={care.id} 
                          initialCompleted={care.is_completed || false} 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg border border-neutral-200 text-center">
          <p className="text-neutral-600">조건에 맞는 케어 일정이 없습니다.</p>
          {Object.values(filters).some(v => v !== '' && v !== 'all') && (
            <p className="text-sm text-neutral-500 mt-2">필터를 변경해보세요.</p>
          )}
        </div>
      )}
    </div>
  );
}
