'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '../../lib/authGuard';
import PetCard from '../../components/PetCard';
import UpcomingList from '../../components/UpcomingList';
import FloatingAddButton from '../../components/FloatingAddButton';
import { getUserPets, getUpcomingCares } from '../../lib/supabaseData';
import supabase from '../../lib/supabaseClient';

function DashboardPage() {
  // 상태 관리
  const [pets, setPets] = useState([]);
  const [upcomingCares, setUpcomingCares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 사용자 정보 상태
  const [user, setUser] = useState(null);
  
  // Supabase 세션 정보 가져오기
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    
    getSession();
    
    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  // 반려 생물 및 케어 일정 데이터 가져오기
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // 반려 생물 목록 가져오기
        const { pets: petsData, error: petsError } = await getUserPets();
        if (petsError) throw petsError;
        
        // 다가오는 케어 일정 가져오기 (14일 이내)
        const { cares: caresData, error: caresError } = await getUpcomingCares(14);
        if (caresError) throw caresError;
        
        setPets(petsData || []);
        setUpcomingCares(caresData || []);
      } catch (err) {
        console.error('데이터 가져오기 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // 각 반려 생물의 다음 케어 일정 찾기
  const getPetNextCare = (petId) => {
    if (!upcomingCares || upcomingCares.length === 0) return null;
    
    return upcomingCares
      .filter(care => care.pet_id === petId)
      .sort((a, b) => new Date(a.next_date) - new Date(b.next_date))[0];
  };

  // 케어 완료 처리 후 데이터 새로고침
  const handleCareComplete = async () => {
    // 다가오는 케어 일정 다시 가져오기
    const { cares: caresData } = await getUpcomingCares(14);
    setUpcomingCares(caresData || []);
  };

  return (
    <div className="pb-20"> {/* 플로팅 버튼을 위한 하단 여백 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-neutral-600">
              {user.email}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-neutral-600">데이터를 불러오는 중...</p>
        </div>
      ) : (
        <>
          {pets.length === 0 ? (
            <div className="py-10 text-center bg-white rounded-lg shadow-sm border border-neutral-100 mb-8">
              <p className="text-neutral-600">등록된 반려 생물이 없습니다.</p>
              <p className="text-sm text-neutral-500 mt-2">새 반려 생물을 등록해보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {pets.map((pet) => (
                <PetCard 
                  key={pet.id} 
                  pet={pet} 
                  nextCare={getPetNextCare(pet.id)} 
                />
              ))}
            </div>
          )}

          <UpcomingList 
            cares={upcomingCares} 
            onCareComplete={handleCareComplete} 
            limit={5} 
          />
        </>
      )}

      {/* 플로팅 추가 버튼 */}
      <FloatingAddButton href="/register" label="새 반려 등록" />
    </div>
  );
}

// AuthGuard로 감싸서 로그인한 사용자만 접근 가능하도록 설정
export default function DashboardPageWithGuard() {
  return (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  );
}
