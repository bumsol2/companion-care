"use client"

import { cn } from "@/lib/utils"

/**
 * 로딩 스켈레톤 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.className - 추가 클래스명
 * @param {React.ReactNode} props.children - 자식 요소
 * @returns {React.ReactNode} - 스켈레톤 컴포넌트
 */
function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-200", className)}
      {...props}
    />
  )
}

export { Skeleton }
