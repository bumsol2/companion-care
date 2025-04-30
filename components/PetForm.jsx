'use client';

import { useState } from 'react';
import { uploadPetImage, createPet } from '@/lib/actions/petActions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/**
 * 반려동물 등록 폼 컴포넌트
 * @returns {React.ReactNode} - 반려동물 등록 폼 컴포넌트
 */
export default function PetForm() {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [birthday, setBirthday] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  /**
   * 이미지 파일 변경 핸들러
   * @param {Event} e - 이벤트 객체
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    // 파일 크기 검사 (5MB 제한)
    if (file && file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }
    
    setImageFile(file);
    setError('');
    
    // 이미지 미리보기 생성
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  /**
   * 폼 제출 핸들러
   * @param {Event} e - 이벤트 객체
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 입력값 검증
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    
    if (!species) {
      setError('종류를 선택해주세요.');
      return;
    }
    
    if (!birthday) {
      setError('생일을 입력해주세요.');
      return;
    }
    
    if (!imageFile) {
      setError('이미지를 업로드해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 이미지 업로드 후 URL 받기
      const imageUrl = await uploadPetImage(imageFile);
      
      // 반려동물 정보 저장
      await createPet({ name, species, birthday, imageUrl });
      
      // 반려동물 목록 페이지로 이동
      router.push('/pets');
      router.refresh(); // 데이터 갱신
    } catch (err) {
      console.error('등록 오류:', err);
      setError(err.message || '반려동물 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* 이미지 미리보기 */}
      {preview && (
        <div className="mb-4 flex justify-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-green-300">
            <Image 
              src={preview} 
              alt="미리보기" 
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}
      
      {/* 이름 입력 */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">이름</label>
        <input
          id="name"
          type="text"
          placeholder="반려동물 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      
      {/* 종류 선택 */}
      <div className="space-y-2">
        <label htmlFor="species" className="text-sm font-medium text-gray-700">종류</label>
        <select
          id="species"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">종류를 선택하세요</option>
          <option value="강아지">강아지</option>
          <option value="고양이">고양이</option>
          <option value="새">새</option>
          <option value="햄스터">햄스터</option>
          <option value="토끼">토끼</option>
          <option value="기타">기타</option>
        </select>
      </div>
      
      {/* 생일 입력 */}
      <div className="space-y-2">
        <label htmlFor="birthday" className="text-sm font-medium text-gray-700">생일</label>
        <input
          id="birthday"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      
      {/* 이미지 업로드 */}
      <div className="space-y-2">
        <label htmlFor="image" className="text-sm font-medium text-gray-700">사진</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500">최대 5MB, 권장 크기: 300x300</p>
      </div>
      
      {/* 등록 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '등록 중...' : '반려동물 등록하기'}
      </button>
    </form>
  );
}
