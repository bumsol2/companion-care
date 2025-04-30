import PetForm from '@/components/PetForm';
import AuthGuard from '@/lib/authGuard';

/**
 * 반려동물 등록 페이지
 * @returns {React.ReactNode} - 반려동물 등록 페이지 컴포넌트
 */
export default function NewPetPage() {
  return (
    <AuthGuard>
      <div className="max-w-xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">반려동물 등록</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <PetForm />
        </div>
      </div>
    </AuthGuard>
  );
}
