import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UpcomingList from '../../components/UpcomingList';

// 모킹된 데이터
const mockCares = [
  {
    id: '101',
    pet_id: '1',
    pet_name: '초코',
    pet_type: '강아지',
    care_type: '목욕',
    cycle_days: 14,
    next_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_completed: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '102',
    pet_id: '1',
    pet_name: '초코',
    pet_type: '강아지',
    care_type: '미용',
    cycle_days: 30,
    next_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_completed: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '201',
    pet_id: '2',
    pet_name: '나비',
    pet_type: '고양이',
    care_type: '발톱 깎기',
    cycle_days: 21,
    next_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_completed: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// 모킹된 함수
const mockCompleteCare = jest.fn();
const mockToast = jest.fn();

// 라우터 모킹
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// 토스트 모킹
jest.mock('../../components/ui/toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Supabase 함수 모킹
jest.mock('../../lib/supabaseData', () => ({
  completeCare: () => mockCompleteCare(),
}));

describe('UpcomingList 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('다가오는 케어 일정이 날짜순으로 정렬되어 표시되는지 확인', () => {
    render(<UpcomingList cares={mockCares} />);
    
    const careItems = screen.getAllByTestId('upcoming-care-item');
    expect(careItems).toHaveLength(3);
    
    // 미용이 가장 먼저 표시되어야 함 (날짜가 가장 가까우므로)
    expect(careItems[0]).toHaveTextContent('미용');
    expect(careItems[1]).toHaveTextContent('목욕');
    expect(careItems[2]).toHaveTextContent('발톱 깎기');
  });
  
  test('케어 완료 버튼 클릭 시 completeCare 함수가 호출되는지 확인', async () => {
    render(<UpcomingList cares={mockCares} />);
    
    const completeButtons = screen.getAllByText('완료');
    fireEvent.click(completeButtons[0]);
    
    expect(mockCompleteCare).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith({
      title: '케어 완료',
      description: '케어 일정이 완료 처리되었습니다.',
    });
  });
  
  test('케어 일정이 없을 때 메시지가 표시되는지 확인', () => {
    render(<UpcomingList cares={[]} />);
    
    expect(screen.getByText('다가오는 케어 일정이 없습니다.')).toBeInTheDocument();
  });
  
  test('반려동물 이름과 케어 유형이 함께 표시되는지 확인', () => {
    render(<UpcomingList cares={mockCares} />);
    
    expect(screen.getByText('초코 - 미용')).toBeInTheDocument();
    expect(screen.getByText('초코 - 목욕')).toBeInTheDocument();
    expect(screen.getByText('나비 - 발톱 깎기')).toBeInTheDocument();
  });
});
