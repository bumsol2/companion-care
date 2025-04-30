'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { calculateDaysLeft } from '@/lib/dateUtils';

/**
 * 반려 생물 카드 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.pet - 반려 생물 정보
 * @param {Object} props.nextCare - 다음 케어 정보
 * @returns {React.ReactNode} - 반려 생물 카드 컴포넌트
 */
export default function PetCard({ pet, nextCare }) {
  // 다음 케어까지 남은 일수 계산
  const daysLeft = nextCare ? calculateDaysLeft(nextCare.next_date) : null;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="truncate">{pet.name}</CardTitle>
        <CardDescription>{pet.type} {pet.breed ? `(${pet.breed})` : ''}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="aspect-square rounded-lg bg-neutral-100 flex items-center justify-center relative overflow-hidden">
          {pet.photo_url ? (
            <Image
              src={pet.photo_url}
              alt={pet.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <p className="text-neutral-400">이미지 없음</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {nextCare ? (
          <Badge variant={daysLeft === 0 ? 'destructive' : 'primary'}>
            {nextCare.care_type} {daysLeft === 0 ? '오늘' : `D-${daysLeft}`}
          </Badge>
        ) : (
          <Badge variant="outline">예정된 케어 없음</Badge>
        )}
        <Link href={`/pets/${pet.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
