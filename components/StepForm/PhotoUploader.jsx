'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

/**
 * 반려 생물 사진 업로드 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {File|string} props.initialPhoto - 초기 사진 (File 객체 또는 URL 문자열)
 * @param {Function} props.onPhotoChange - 사진 변경 시 호출할 함수
 * @param {Function} props.onNext - 다음 단계로 이동하는 함수
 * @param {Function} props.onPrevious - 이전 단계로 이동하는 함수
 * @returns {React.ReactNode} - 사진 업로드 컴포넌트
 */
export default function PhotoUploader({ initialPhoto, onPhotoChange, onNext, onPrevious }) {
  const [photo, setPhoto] = useState(initialPhoto);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  // 사진 미리보기 URL 생성
  const photoPreviewUrl = photo 
    ? (typeof photo === 'string' ? photo : URL.createObjectURL(photo))
    : null;
  
  // 파일 선택 처리
  const handleFileSelect = (file) => {
    // 파일 유효성 검사
    if (!file) return;
    
    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    
    // 이미지 파일 타입 검사
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }
    
    setError(null);
    setPhoto(file);
    
    // 부모 컴포넌트에 사진 전달
    if (onPhotoChange) {
      onPhotoChange(file);
    }
  };
  
  // 파일 입력 변경 이벤트 처리
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };
  
  // 드래그 앤 드롭 이벤트 처리
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };
  
  // 파일 선택 버튼 클릭
  const handleSelectButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  // 사진 제거
  const handleRemovePhoto = () => {
    setPhoto(null);
    if (onPhotoChange) {
      onPhotoChange(null);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 파일 입력 (숨김) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />
      
      {/* 드래그 앤 드롭 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!photo ? handleSelectButtonClick : undefined}
        className={`
          border-2 border-dashed rounded-lg p-4 h-64 flex flex-col items-center justify-center
          transition-colors cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5' : 'border-neutral-300'}
          ${photo ? 'cursor-default' : 'hover:border-primary hover:bg-primary/5'}
        `}
      >
        {photo ? (
          <div className="relative w-full h-full">
            <Image
              src={photoPreviewUrl}
              alt="반려 생물 사진"
              fill
              className="object-contain"
            />
            <button
              onClick={handleRemovePhoto}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-neutral-100"
              title="사진 제거"
            >
              <X className="w-5 h-5 text-neutral-700" />
            </button>
          </div>
        ) : (
          <>
            <ImageIcon className="w-12 h-12 text-neutral-400 mb-2" />
            <p className="text-neutral-600 text-center">
              사진을 드래그하여 업로드하거나 클릭하여 선택하세요
            </p>
            <p className="text-neutral-500 text-sm mt-1">
              최대 5MB, JPG, PNG, GIF 형식
            </p>
          </>
        )}
      </div>
      
      {/* 에러 메시지 */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {/* 버튼 영역 */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          이전
        </Button>
        
        <div className="flex gap-2">
          {!photo && (
            <Button variant="outline" onClick={handleSelectButtonClick}>
              <Upload className="w-4 h-4 mr-2" />
              사진 선택
            </Button>
          )}
          
          <Button onClick={onNext}>
            {photo ? '다음' : '사진 없이 계속'}
          </Button>
        </div>
      </div>
    </div>
  );
}
