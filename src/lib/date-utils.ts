/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Date 객체를 YYYY-MM-DD 형식으로 변환
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * YYYY-MM-DD 문자열을 한국어로 포맷팅
 */
export function formatDateKorean(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 두 날짜 사이의 일수 차이 계산
 */
export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * D-day 계산 (음수: 남은 일, 양수: 지난 일)
 */
export function getDDay(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - target.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * D-day 문자열 포맷팅
 */
export function formatDDay(targetDate: string): string {
  const dday = getDDay(targetDate);
  if (dday === 0) return 'D-Day';
  if (dday < 0) return `D${dday}`;
  return `D+${dday}`;
}

/**
 * 두 날짜 사이의 월 목록 반환
 */
export function getMonthsBetween(startDate: string, endDate: string): { year: number; month: number }[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months: { year: number; month: number }[] = [];

  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= endMonth) {
    months.push({
      year: current.getFullYear(),
      month: current.getMonth() + 1, // 1-12
    });
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}
