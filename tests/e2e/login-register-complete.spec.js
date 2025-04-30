const { test, expect } = require('@playwright/test');

// 테스트 계정 정보
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testPassword123';

test.describe('Companion Care E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 홈페이지로 이동
    await page.goto('/');
  });

  test('로그인 → 대시보드 진입 테스트', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.click('text=로그인');
    
    // 이메일과 비밀번호 입력
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    
    // 로그인 버튼 클릭
    await page.click('button:has-text("로그인")');
    
    // 대시보드로 리다이렉트되는지 확인
    await expect(page).toHaveURL('/dashboard');
    
    // 대시보드 페이지 타이틀 확인
    await expect(page.locator('h1')).toContainText('대시보드');
    
    // 사용자 정보가 표시되는지 확인
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  });

  test('생물 등록 → 케어 일정 확인 테스트', async ({ page }) => {
    // 로그인
    await page.click('text=로그인');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("로그인")');
    
    // 대시보드로 이동 확인
    await expect(page).toHaveURL('/dashboard');
    
    // 생물 등록 버튼 클릭
    await page.click('[data-testid="add-pet-button"]');
    
    // 등록 페이지로 이동 확인
    await expect(page).toHaveURL('/register');
    
    // 기본 정보 입력 (1단계)
    await page.fill('input[name="name"]', '테스트 강아지');
    await page.selectOption('select[name="type"]', '강아지');
    await page.fill('input[name="breed"]', '말티즈');
    await page.click('button:has-text("다음")');
    
    // 사진 업로드 (2단계)
    // 파일 업로드 대신 건너뛰기
    await page.click('button:has-text("건너뛰기")');
    
    // 케어 사이클 설정 (3단계)
    await page.click('button:has-text("케어 추가")');
    await page.selectOption('select[name="care_type"]', '목욕');
    await page.fill('input[name="cycle_days"]', '14');
    await page.click('button:has-text("추가")');
    
    // 등록 완료
    await page.click('button:has-text("등록 완료")');
    
    // 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL('/dashboard');
    
    // 등록한 생물이 표시되는지 확인
    await expect(page.locator('text=테스트 강아지')).toBeVisible();
    await expect(page.locator('text=강아지 / 말티즈')).toBeVisible();
    
    // 케어 일정이 표시되는지 확인
    await expect(page.locator('text=목욕')).toBeVisible();
  });

  test('알림 설정 변경 테스트', async ({ page }) => {
    // 로그인
    await page.click('text=로그인');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("로그인")');
    
    // 설정 페이지로 이동
    await page.click('[data-testid="settings-button"]');
    await page.click('text=알림 설정');
    
    // 알림 설정 페이지로 이동 확인
    await expect(page).toHaveURL('/settings/notifications');
    
    // 현재 알림 상태 확인
    const initialState = await page.isChecked('[data-testid="email-notification-toggle"]');
    
    // 알림 토글 클릭
    await page.click('[data-testid="email-notification-toggle"]');
    
    // 토글 상태가 변경되었는지 확인
    await expect(page.locator('[data-testid="email-notification-toggle"]')).toBeChecked({ checked: !initialState });
    
    // 설정 변경 완료 메시지 확인
    await expect(page.locator('text=설정 변경 완료')).toBeVisible();
  });

  test('케어 완료 처리 테스트', async ({ page }) => {
    // 로그인
    await page.click('text=로그인');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("로그인")');
    
    // 케어 페이지로 이동
    await page.click('text=케어 일정');
    
    // 케어 페이지로 이동 확인
    await expect(page).toHaveURL('/care');
    
    // 첫 번째 케어 항목의 완료 버튼 클릭
    await page.click('[data-testid="care-item"]:first-child button:has-text("완료")');
    
    // 완료 확인 모달 표시 확인
    await expect(page.locator('text=케어를 완료하시겠습니까?')).toBeVisible();
    
    // 확인 버튼 클릭
    await page.click('button:has-text("확인")');
    
    // 완료 처리 메시지 확인
    await expect(page.locator('text=케어 완료')).toBeVisible();
    
    // 완료된 케어 항목에 완료 표시가 있는지 확인
    await expect(page.locator('[data-testid="care-item"]:first-child [data-testid="completed-badge"]')).toBeVisible();
  });
});
