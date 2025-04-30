/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 주어진 날짜까지 남은 일수를 계산합니다.
 * @param {string|Date} date - 계산할 날짜 (ISO 문자열 또는 Date 객체)
 * @returns {number} 남은 일수 (오늘이면 0, 지난 날짜면 음수)
 */
export function calculateDaysLeft(date) {
  const targetDate = new Date(date);
  const today = new Date();
  
  // 시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환합니다.
 * @param {Date} date - 변환할 날짜
 * @returns {string} YYYY-MM-DD 형식의 문자열
 */
export function formatDateToString(date) {
  return date.toISOString().split('T')[0];
}

/**
 * 날짜를 한국어 형식으로 변환합니다. (YYYY년 MM월 DD일)
 * @param {string|Date} date - 변환할 날짜 (ISO 문자열 또는 Date 객체)
 * @returns {string} YYYY년 MM월 DD일 형식의 문자열
 */
export function formatDateToKorean(date) {
  const targetDate = new Date(date);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();
  
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 오늘로부터 지정된 일수 후의 날짜를 계산합니다.
 * @param {number} days - 더할 일수
 * @returns {Date} 계산된 날짜
 */
export function addDaysToToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * 두 날짜 사이의 일수를 계산합니다.
 * @param {string|Date} startDate - 시작 날짜
 * @param {string|Date} endDate - 종료 날짜
 * @returns {number} 두 날짜 사이의 일수
 */
export function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
