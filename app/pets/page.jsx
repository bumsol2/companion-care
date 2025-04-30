import Link from 'next/link';
import Image from 'next/image';
export const dynamic = 'force-dynamic';

import { getUserPets } from '@/lib/actions/petActions';
import AuthGuard from '@/lib/authGuard';

/**
 * 반려동물 목록 페이지
 * @returns {React.ReactNode} - 반려동물 목록 페이지 컴포넌트
 */
export default async function PetsPage() {
  // 사용자의 반려동물 목록 가져오기
  const pets = await getUserPets();
  
  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">내 반려동물</h1>
          <Link 
            href="/pets/new" 
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
          >
            반려동물 등록
          </Link>
        </div>
        
        {pets.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-medium mb-4">등록된 반려동물이 없습니다</h2>
            <p className="text-gray-500 mb-6">반려동물을 등록하고 케어 항목을 관리해보세요!</p>
            <Link 
              href="/pets/new" 
              className="inline-block bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition-colors"
            >
              반려동물 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {pet.image_url ? (
                    <Image
                      src={pet.image_url}
                      alt={pet.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-400">이미지 없음</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{pet.name}</h2>
                  <div className="flex flex-col space-y-1 text-sm text-gray-600">
                    <p>종류: {pet.species}</p>
                    <p>생일: {new Date(pet.birthday).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/pets/${pet.id}`}
                      className="text-green-500 hover:text-green-700 transition-colors"
                    >
                      자세히 보기
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
