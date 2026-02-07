/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
// KST timezone settings
const SEOUL_TIME_ZONE = 'Asia/Seoul';
const DAY_MS = 24 * 60 * 60 * 1000;

function formatDateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value ?? '0000';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

export function parseDateOnly(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Today's date in KST (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return formatDateInTimeZone(new Date(), SEOUL_TIME_ZONE);
}

/**
 * Date 객체를 YYYY-MM-DD 형식으로 변환
 */
export function formatDate(date: Date): string {
  return formatDateInTimeZone(date, SEOUL_TIME_ZONE);
}

/**
 * YYYY-MM-DD 문자열을 한국어로 포맷팅
 */
export function formatDateKorean(dateString: string): string {
  const date = parseDateOnly(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: SEOUL_TIME_ZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * 두 날짜 사이의 일수 차이 계산
 */
export function getDaysBetween(startDate: string, endDate: string): number {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / DAY_MS);
}

/**
 * D-day 계산 (음수: 남은 일, 양수: 지난 일)
 */
export function getDDay(targetDate: string): number {
  return getDaysBetween(targetDate, getTodayString());
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
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const months: { year: number; month: number }[] = [];

  const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const endMonth = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));

  while (current <= endMonth) {
    months.push({
      year: current.getUTCFullYear(),
      month: current.getUTCMonth() + 1, // 1-12
    });
    current.setUTCMonth(current.getUTCMonth() + 1);
  }

  return months;
}

/**
 * 날짜에 월을 더한 문자열 반환
 */
export function addMonthsToDateString(dateString: string, monthsToAdd: number): string {
  const date = parseDateOnly(dateString);
  date.setUTCMonth(date.getUTCMonth() + monthsToAdd);
  return formatDate(date);
}
