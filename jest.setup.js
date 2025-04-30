// jest-dom은 DOM 노드에 대한 assertion을 위한 커스텀 matcher를 추가합니다
import '@testing-library/jest-dom';

// 전역 mocks 설정
global.fetch = jest.fn();

// localStorage 모킹
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Supabase 모킹을 위한 설정
jest.mock('@supabase/supabase-js', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    data: null,
    error: null,
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
      user: jest.fn(),
      session: jest.fn(),
    },
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
      remove: jest.fn(),
    },
  };

  return {
    createClient: jest.fn(() => mockSupabase),
  };
});

// 테스트에서 사용할 수 있도록 console.error를 모킹
global.console.error = jest.fn();

// 테스트 타임아웃 설정
jest.setTimeout(30000);
