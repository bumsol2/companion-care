'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../components/ui/card';
import { useToast } from '../../components/ui/use-toast';
import Stepper from '../../components/StepForm/Stepper';
import BasicInfoForm from '../../components/StepForm/BasicInfoForm';
import PhotoUploader from '../../components/StepForm/PhotoUploader';
import CareCycleForm from '../../components/StepForm/CareCycleForm';
import AuthGuard from '../../lib/authGuard';
import { createPet, updatePet } from '../../lib/supabaseData';
import { uploadPetPhoto } from '../../lib/supabaseStorage';
import { createCare } from '../../lib/supabaseData';

// 스텝 정의
const STEPS = [
  { label: '기본 정보', description: '이름과 종류를 입력하세요' },
  { label: '사진 업로드', description: '반려 생물의 사진을 등록하세요' },
  { label: '케어 주기', description: '케어 일정을 설정하세요' }
];

function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  
  // 상태 관리
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '식물',
    breed: '',
    photo: null,
    cares: []
  });

  // 스텝 이동 함수
  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // 데이터 변경 핸들러
  const handleBasicInfoChange = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handlePhotoChange = (photo) => {
    setFormData(prev => ({ ...prev, photo }));
  };

  const handleCaresChange = (cares) => {
    setFormData(prev => ({ ...prev, cares }));
  };

  // 폼 제출 처리
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // 1. 반려 생물 기본 정보 등록
      const { pet, error: petError } = await createPet({
        name: formData.name,
        type: formData.type,
        breed: formData.breed || null
      });
      
      if (petError) throw petError;
      
      // 2. 사진이 있는 경우 업로드
      let photoUrl = null;
      if (formData.photo && pet) {
        const { path, error: photoError } = await uploadPetPhoto(formData.photo, pet.id);
        if (photoError) {
          console.error('사진 업로드 오류:', photoError);
          toast({
            title: '사진 업로드 실패',
            description: '사진 업로드에 실패했지만, 기본 정보는 저장되었습니다.',
            variant: 'destructive'
          });
        } else {
          photoUrl = path;
          
          // 사진 URL 업데이트
          await updatePet(pet.id, { photo_url: photoUrl });
        }
      }
      
      // 3. 케어 일정 등록
      if (formData.cares.length > 0 && pet) {
        const carePromises = formData.cares.map(care => {
          return createCare({
            pet_id: pet.id,
            care_type: care.care_type,
            cycle_days: Number(care.cycle_days),
            next_date: care.next_date
          });
        });
        
        await Promise.all(carePromises);
      }
      
      // 성공 메시지 표시
      toast({
        title: '등록 완료',
        description: `${formData.name}이(가) 성공적으로 등록되었습니다.`,
        variant: 'default'
      });
      
      // 대시보드로 이동
      router.push('/dashboard');
      
    } catch (error) {
      console.error('등록 오류:', error);
      toast({
        title: '등록 실패',
        description: '반려 생물 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <h1 className="text-2xl font-bold mb-6">새 반려 등록</h1>
      
      {/* 스텝퍼 */}
      <Stepper 
        steps={STEPS} 
        currentStep={currentStep} 
        onStepClick={goToStep} 
      />

      {/* 스텝 별 폼 컴포넌트 */}
      <Card className="p-6">
        {currentStep === 0 && (
          <BasicInfoForm 
            data={{
              name: formData.name,
              type: formData.type,
              breed: formData.breed
            }}
            onDataChange={handleBasicInfoChange}
            onNext={goToNextStep}
          />
        )}
        
        {currentStep === 1 && (
          <PhotoUploader 
            initialPhoto={formData.photo}
            onPhotoChange={handlePhotoChange}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )}
        
        {currentStep === 2 && (
          <CareCycleForm 
            petType={formData.type}
            initialCares={formData.cares}
            onCaresChange={handleCaresChange}
            onSubmit={handleSubmit}
            onPrevious={goToPreviousStep}
            isSubmitting={isSubmitting}
          />
        )}
      </Card>
    </div>
  );
}

// AuthGuard로 감싸서 로그인한 사용자만 접근 가능하도록 설정
export default function RegisterPage() {
  return (
    <AuthGuard>
      <RegisterForm />
    </AuthGuard>
  );
}
