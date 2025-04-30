import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationToggle from '../../components/NotificationToggle';

// 모킹된 데이터
const mockUserSettings = {
  id: 'user-1',
  email_notifications: true,
};

// 모킹된 함수
const mockUpdateUserSettings = jest.fn().mockResolvedValue({ data: { email_notifications: false }, error: null });
const mockToast = jest.fn();

// 토스트 모킹
jest.mock('../../components/ui/toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Supabase 함수 모킹
jest.mock('../../lib/supabaseUser', () => ({
  updateUserSettings: (userId, settings) => mockUpdateUserSettings(userId, settings),
}));

describe('NotificationToggle 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('초기 상태가 사용자 설정에 따라 올바르게 설정되는지 확인', () => {
    render(<NotificationToggle userSettings={mockUserSettings} />);
    
    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeChecked();
  });
  
  test('토글 클릭 시 상태가 변경되고 updateUserSettings 함수가 호출되는지 확인', async () => {
    render(<NotificationToggle userSettings={mockUserSettings} />);
    
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);
    
    expect(toggle).not.toBeChecked();
    
    await waitFor(() => {
      expect(mockUpdateUserSettings).toHaveBeenCalledWith('user-1', { email_notifications: false });
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: '설정 변경 완료',
      description: '이메일 알림 설정이 변경되었습니다.',
    });
  });
  
  test('설정 변경 중 로딩 상태가 표시되는지 확인', async () => {
    // 의도적으로 응답을 지연시키는 모킹 함수
    mockUpdateUserSettings.mockImplementationOnce(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({ data: { email_notifications: false }, error: null });
      }, 100);
    }));
    
    render(<NotificationToggle userSettings={mockUserSettings} />);
    
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);
    
    // 로딩 상태 확인
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // 응답 완료 후 로딩 상태 사라짐 확인
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });
  
  test('에러 발생 시 토스트 메시지가 표시되는지 확인', async () => {
    // 에러를 반환하는 모킹 함수
    mockUpdateUserSettings.mockResolvedValueOnce({ data: null, error: { message: '설정 변경 중 오류가 발생했습니다.' } });
    
    render(<NotificationToggle userSettings={mockUserSettings} />);
    
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '오류',
        description: '설정 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    });
  });
});
