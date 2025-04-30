'use client';

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 차트 로딩 스켈레톤 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.title - 차트 제목
 * @param {string} props.height - 차트 높이 (기본값: 300px)
 * @returns {React.ReactNode} - 차트 로딩 스켈레톤 컴포넌트
 */
export default function ChartSkeleton({ title = "차트 로딩 중", height = "300px" }) {
  return (
    <div 
      className="w-full bg-white p-5 rounded-lg shadow-sm border border-neutral-100"
      style={{ height }}
    >
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        
        <div className="pt-4 space-y-2">
          {/* 차트 범례 스켈레톤 */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          
          {/* Y축 라벨 스켈레톤 */}
          <div className="flex h-[200px]">
            <div className="w-10 flex flex-col justify-between py-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-8" />
            </div>
            
            {/* 차트 영역 스켈레톤 */}
            <div className="flex-1 flex items-end">
              <div className="w-full flex justify-between items-end gap-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <Skeleton 
                      className="w-full" 
                      style={{ 
                        height: `${Math.random() * 100 + 20}px`,
                        opacity: 0.7 + (Math.random() * 0.3)
                      }} 
                    />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
