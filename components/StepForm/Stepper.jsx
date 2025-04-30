'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * 다단계 폼을 위한 Stepper 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.steps - 단계 정보 배열 (예: [{label: '기본 정보', description: '이름과 종류를 입력하세요'}])
 * @param {number} props.currentStep - 현재 활성화된 단계 (0부터 시작)
 * @param {Function} props.onStepClick - 단계 클릭 시 호출할 함수
 * @returns {React.ReactNode} - Stepper 컴포넌트
 */
export default function Stepper({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 relative">
            {/* 연결선 */}
            {index < steps.length - 1 && (
              <div 
                className={`absolute top-1/2 w-full h-[2px] -translate-y-1/2 ${
                  index < currentStep ? 'bg-primary' : 'bg-neutral-200'
                }`}
              />
            )}
            
            {/* 단계 버튼 */}
            <div className="flex flex-col items-center relative z-10">
              <button
                onClick={() => onStepClick && index <= currentStep && onStepClick(index)}
                disabled={index > currentStep}
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  index < currentStep 
                    ? 'bg-primary text-white' 
                    : index === currentStep
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
                aria-current={index === currentStep ? 'step' : undefined}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>
              
              {/* 단계 레이블 */}
              <div className="text-center">
                <p className={`text-sm font-medium ${
                  index <= currentStep ? 'text-primary' : 'text-neutral-500'
                }`}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-neutral-500 mt-1 hidden md:block">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
