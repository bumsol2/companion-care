'use client';

import { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { SortAsc, SortDesc } from 'lucide-react';

/**
 * 케어 항목 정렬 선택 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.defaultValue - 기본 정렬 기준
 * @param {Function} props.onChange - 정렬 기준 변경 시 호출되는 함수
 * @returns {React.ReactNode} - 케어 정렬 선택 컴포넌트
 */
export default function CareSortSelect({ defaultValue = 'created_desc', onChange }) {
  const [sortKey, setSortKey] = useState(defaultValue);

  const handleSortChange = (value) => {
    setSortKey(value);
    onChange(value);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-neutral-600">정렬:</span>
      <Select value={sortKey} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="정렬 기준 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_desc" className="flex items-center">
            <div className="flex items-center gap-2">
              <SortDesc className="h-4 w-4" />
              <span>최신순</span>
            </div>
          </SelectItem>
          <SelectItem value="created_asc">
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4" />
              <span>오래된순</span>
            </div>
          </SelectItem>
          <SelectItem value="title_asc">
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4" />
              <span>제목순 (A→Z)</span>
            </div>
          </SelectItem>
          <SelectItem value="title_desc">
            <div className="flex items-center gap-2">
              <SortDesc className="h-4 w-4" />
              <span>제목순 (Z→A)</span>
            </div>
          </SelectItem>
          <SelectItem value="completed_desc">
            <div className="flex items-center gap-2">
              <SortDesc className="h-4 w-4" />
              <span>완료된 항목 먼저</span>
            </div>
          </SelectItem>
          <SelectItem value="completed_asc">
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4" />
              <span>미완료 항목 먼저</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
