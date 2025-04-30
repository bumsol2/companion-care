'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { addDaysToToday, formatDateToString } from '@/lib/dateUtils';

// 반려 생물 유형별 케어 종류
const CARE_TYPES = {
  '식물': ['물주기', '분갈이', '영양제', '가지치기', '환기', '분무'],
  '강아지': ['산책', '목욕', '미용', '예방접종', '구충제', '치석제거'],
  '고양이': ['화장실 청소', '미용', '예방접종', '구충제', '치석제거'],
  '기타': ['먹이주기', '청소', '건강검진']
};

/**
 * 케어 주기 설정 폼 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.petType - 반려 생물 유형
 * @param {Array} props.initialCares - 초기 케어 목록
 * @param {Function} props.onCaresChange - 케어 목록 변경 시 호출할 함수
 * @param {Function} props.onSubmit - 제출 시 호출할 함수
 * @param {Function} props.onPrevious - 이전 단계로 이동하는 함수
 * @param {boolean} props.isSubmitting - 제출 중 여부
 * @returns {React.ReactNode} - 케어 주기 설정 폼 컴포넌트
 */
export default function CareCycleForm({ 
  petType = '식물', 
  initialCares = [], 
  onCaresChange, 
  onSubmit, 
  onPrevious,
  isSubmitting = false
}) {
  const [cares, setCares] = useState(initialCares.length > 0 ? initialCares : [
    { care_type: '', cycle_days: 7, next_date: formatDateToString(new Date()) }
  ]);
  
  const [errors, setErrors] = useState({});
  const [availableCareTypes, setAvailableCareTypes] = useState([]);
  
  // 반려 생물 유형에 따라 케어 종류 목록 설정
  useEffect(() => {
    setAvailableCareTypes(CARE_TYPES[petType] || CARE_TYPES['기타']);
  }, [petType]);
  
  // 케어 추가
  const addCare = () => {
    const newCares = [
      ...cares,
      { care_type: '', cycle_days: 7, next_date: formatDateToString(new Date()) }
    ];
    
    setCares(newCares);
    
    // 부모 컴포넌트에 데이터 전달
    if (onCaresChange) {
      onCaresChange(newCares);
    }
  };
  
  // 케어 제거
  const removeCare = (index) => {
    const newCares = cares.filter((_, i) => i !== index);
    
    setCares(newCares);
    
    // 부모 컴포넌트에 데이터 전달
    if (onCaresChange) {
      onCaresChange(newCares);
    }
    
    // 에러 메시지 업데이트
    const newErrors = { ...errors };
    delete newErrors[`care_${index}`];
    setErrors(newErrors);
  };
  
  // 케어 정보 변경
  const handleCareChange = (index, field, value) => {
    const newCares = [...cares];
    newCares[index] = { ...newCares[index], [field]: value };
    
    // 주기 변경 시 다음 날짜 자동 계산
    if (field === 'cycle_days') {
      newCares[index].next_date = formatDateToString(addDaysToToday(Number(value)));
    }
    
    setCares(newCares);
    
    // 부모 컴포넌트에 데이터 전달
    if (onCaresChange) {
      onCaresChange(newCares);
    }
    
    // 에러 메시지 초기화
    if (errors[`care_${index}`]) {
      setErrors(prev => ({ ...prev, [`care_${index}`]: null }));
    }
  };
  
  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    
    cares.forEach((care, index) => {
      if (!care.care_type) {
        newErrors[`care_${index}`] = '케어 종류를 선택해주세요';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 폼 제출
  const handleSubmit = () => {
    if (validateForm() && onSubmit) {
      onSubmit();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {cares.map((care, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">케어 {index + 1}</h3>
              {cares.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCare(index)}
                  title="케어 삭제"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`care-type-${index}`}>
                  케어 종류 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={care.care_type}
                  onValueChange={(value) => handleCareChange(index, 'care_type', value)}
                >
                  <SelectTrigger id={`care-type-${index}`} className={errors[`care_${index}`] ? 'border-red-500' : ''}>
                    <SelectValue placeholder="케어 종류를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCareTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`care_${index}`] && (
                  <p className="text-sm text-red-500">{errors[`care_${index}`]}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`cycle-days-${index}`}>주기 (일)</Label>
                <Input
                  id={`cycle-days-${index}`}
                  type="number"
                  min="1"
                  max="365"
                  value={care.cycle_days}
                  onChange={(e) => handleCareChange(index, 'cycle_days', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`next-date-${index}`}>다음 날짜</Label>
                <Input
                  id={`next-date-${index}`}
                  type="date"
                  value={care.next_date}
                  onChange={(e) => handleCareChange(index, 'next_date', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={addCare}
      >
        + 케어 추가
      </Button>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious} disabled={isSubmitting}>
          이전
        </Button>
        
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '등록 완료'}
        </Button>
      </div>
    </div>
  );
}
