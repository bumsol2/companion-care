import React from 'react';
import { render, screen } from '@testing-library/react';
import PetCard from '../../components/PetCard';

// 모킹된 데이터
const mockPet = {
  id: '1',
  name: '초코',
  type: '강아지',
  breed: '말티즈',
  photo_url: '/images/pet1.jpg',
};

const mockCares = [
  {
    id: '101',
    pet_id: '1',
    care_type: '목욕',
    cycle_days: 14,
    next_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_completed: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '102',
    pet_id: '1',
    care_type: '미용',
    cycle_days: 30,
    next_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_completed: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// 라우터 모킹
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('PetCard 컴포넌트', () => {
  test('반려동물 정보가 올바르게 렌더링되는지 확인', () => {
    render(<PetCard pet={mockPet} cares={mockCares} />);
    
    // 반려동물 이름이 표시되는지 확인
    expect(screen.getByText('초코')).toBeInTheDocument();
    
    // 반려동물 종류와 품종이 표시되는지 확인
    expect(screen.getByText('강아지 / 말티즈')).toBeInTheDocument();
    
    // 케어 일정이 표시되는지 확인
    expect(screen.getByText('목욕')).toBeInTheDocument();
    expect(screen.getByText('미용')).toBeInTheDocument();
  });
  
  test('다가오는 케어 일정이 날짜순으로 정렬되어 표시되는지 확인', () => {
    render(<PetCard pet={mockPet} cares={mockCares} />);
    
    // 미용이 목욕보다 먼저 표시되어야 함 (날짜가 더 가까우므로)
    const careItems = screen.getAllByTestId('care-item');
    expect(careItems[0]).toHaveTextContent('미용');
    expect(careItems[1]).toHaveTextContent('목욕');
  });
  
  test('케어 일정이 없을 때 메시지가 표시되는지 확인', () => {
    render(<PetCard pet={mockPet} cares={[]} />);
    
    expect(screen.getByText('예정된 케어 일정이 없습니다.')).toBeInTheDocument();
  });
  
  test('이미지가 올바르게 로드되는지 확인', () => {
    render(<PetCard pet={mockPet} cares={mockCares} />);
    
    const image = screen.getByAltText('초코');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockPet.photo_url);
  });
});
