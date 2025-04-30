'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const PET_TYPES = [
  { value: '식물', label: '식물' },
  { value: '강아지', label: '강아지' },
  { value: '고양이', label: '고양이' },
  { value: '기타', label: '기타' }
];

const PLANT_BREEDS = [
  '몬스테라', '스투키', '선인장', '아레카야자', '산세베리아', 
  '행운목', '피토니아', '아이비', '파키라', '관음죽', '기타'
];

const DOG_BREEDS = [
  '말티즈', '푸들', '치와와', '포메라니안', '비숑 프리제', 
  '시츄', '골든 리트리버', '진돗개', '웰시 코기', '비글', '기타'
];

const CAT_BREEDS = [
  '코리안 숏헤어', '페르시안', '러시안 블루', '샴', '뱅갈', 
  '아메리칸 숏헤어', '스코티시 폴드', '노르웨이 숲', '메인쿤', '기타'
];

/**
 * 반려 생물 기본 정보 입력 폼 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.data - 초기 데이터
 * @param {Function} props.onDataChange - 데이터 변경 시 호출할 함수
 * @param {Function} props.onNext - 다음 단계로 이동하는 함수
 * @returns {React.ReactNode} - 기본 정보 입력 폼 컴포넌트
 */
export default function BasicInfoForm({ data, onDataChange, onNext }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '식물',
    breed: '',
    ...data
  });
  
  const [errors, setErrors] = useState({});
  const [breeds, setBreeds] = useState(PLANT_BREEDS);
  
  // 반려 생물 유형에 따라 품종 목록 변경
  useEffect(() => {
    switch (formData.type) {
      case '식물':
        setBreeds(PLANT_BREEDS);
        break;
      case '강아지':
        setBreeds(DOG_BREEDS);
        break;
      case '고양이':
        setBreeds(CAT_BREEDS);
        break;
      default:
        setBreeds([]);
        break;
    }
    
    // 품종 선택 초기화 (다른 유형으로 변경 시)
    if (formData.breed && !breeds.includes(formData.breed)) {
      setFormData(prev => ({ ...prev, breed: '' }));
    }
  }, [formData.type, formData.breed, breeds]);
  
  // 입력값 변경 처리
  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // 부모 컴포넌트에 데이터 전달
      if (onDataChange) {
        onDataChange(newData);
      }
      
      return newData;
    });
    
    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }
    
    if (!formData.type) {
      newErrors.type = '종류를 선택해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 다음 단계로 이동
  const handleNext = () => {
    if (validateForm() && onNext) {
      onNext();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          이름 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="반려 생물의 이름을 입력하세요"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>
          종류 <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value) => handleChange('type', value)}
          className="flex flex-wrap gap-4"
        >
          {PET_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <RadioGroupItem value={type.value} id={`type-${type.value}`} />
              <Label htmlFor={`type-${type.value}`}>{type.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type}</p>
        )}
      </div>
      
      {formData.type && breeds.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="breed">품종</Label>
          <Select
            value={formData.breed}
            onValueChange={(value) => handleChange('breed', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="품종을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {breeds.map((breed) => (
                <SelectItem key={breed} value={breed}>
                  {breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="pt-4">
        <Button onClick={handleNext} className="w-full">
          다음
        </Button>
      </div>
    </div>
  );
}
