/**
 * 목표 달성률 계산 함수들
 * 
 * ROUTINE: 
 *   - TOTAL: currentCount / targetCount
 *   - WEEKLY: 이번 주 횟수 / 주간 목표
 *   - MONTHLY: 이번 달 횟수 / 월간 목표
 * LIMIT: 
 *   - WEEKLY: 성공한 주 수 / 전체 주 수
 *   - MONTHLY: 성공한 달 수 / 전체 달 수
 * OBJECTIVE: 공부 로그 수 + 달성 여부
 */

import { getTodayString } from '@/lib/date-utils';
import { Goal, GoalLog, GoalProgress, Period, GoalCycle } from '@/types';

/**
 * 로컬 타임존 기준 날짜 포맷 (YYYY-MM-DD)
 */
function parseDateOnly(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekStartDate(dateStr: string): Date {
  const date = parseDateOnly(dateStr);
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday
  date.setUTCDate(date.getUTCDate() - dayOfWeek);
  return date;
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
 * Weeks between dates (Sunday start, key = week start date)
 */
export function getWeeksBetween(startDate: string, endDate: string): string[] {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const weeks: string[] = [];

  // 시작 날짜의 주 일요일로 이동
  const current = new Date(start.getTime());
  current.setUTCDate(current.getUTCDate() - current.getUTCDay());

  while (current <= end) {
    weeks.push(formatDateUTC(current));
    current.setUTCDate(current.getUTCDate() + 7);
  }

  return weeks;
}

/**
 * ISO 주차 번호 계산 (월요일 시작)
 */
export function getISOWeekNumber(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

/**
 * Convert date to week key (Sunday start, YYYY-MM-DD of week start)
 */
export function getWeekKey(dateStr: string): string {
  return formatDateUTC(getWeekStartDate(dateStr));
}

/**
 * 날짜를 월 키로 변환 (YYYY-MM)
 */
export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/**
 * 현재 주차 키 반환
 */
export function getCurrentWeekKey(): string {
  return getWeekKey(getTodayString());
}

/**
 * 현재 월 키 반환
 */
export function getCurrentMonthKey(): string {
  return getMonthKey(getTodayString());
}

/**
 * ROUTINE 목표 달성률 계산
 */
export function calculateRoutineProgress(
  goal: Goal,
  goalLogs?: GoalLog[],
  logDateMap?: Map<string, string>
): GoalProgress {
  const cycle = goal.cycle || 'TOTAL';
  
  if (cycle === 'TOTAL') {
    // 전체 기간 목표
    const currentCount = goal.current_count || 0;
    const targetCount = goal.target_count || 1;
    const progressPercent = Math.min((currentCount / targetCount) * 100, 100);

    return {
      goal_id: goal.id,
      type: 'ROUTINE',
      progress_percent: Math.round(progressPercent * 10) / 10,
      current_value: currentCount,
      target_value: targetCount,
    };
  }
  
  // 주간/월간 반복 목표
  const limitValue = goal.limit_value || goal.target_count || 1;
  const currentKey = cycle === 'WEEKLY' ? getCurrentWeekKey() : getCurrentMonthKey();
  
  // 현재 주기의 횟수 계산
  let currentPeriodCount = 0;
  if (goalLogs && logDateMap) {
    goalLogs.forEach((gl) => {
      const logDate = logDateMap.get(gl.daily_log_id);
      if (!logDate) return;
      
      const logKey = cycle === 'WEEKLY' 
        ? getWeekKey(logDate) 
        : getMonthKey(logDate);
      
      if (logKey === currentKey) {
        currentPeriodCount += gl.count;
      }
    });
  }
  
  const progressPercent = Math.min((currentPeriodCount / limitValue) * 100, 100);

  return {
    goal_id: goal.id,
    type: 'ROUTINE',
    progress_percent: Math.round(progressPercent * 10) / 10,
    current_value: currentPeriodCount,
    target_value: limitValue,
  };
}

/**
 * 주간 사용량 계산
 */
export function calculateWeeklyUsage(
  goalLogs: GoalLog[],
  logDateMap: Map<string, string>
): Map<string, number> {
  const weeklyUsage = new Map<string, number>();

  goalLogs.forEach((log) => {
    const logDate = logDateMap.get(log.daily_log_id);
    if (!logDate) return;

    const weekKey = getWeekKey(logDate);
    const current = weeklyUsage.get(weekKey) || 0;
    weeklyUsage.set(weekKey, current + log.count);
  });

  return weeklyUsage;
}

/**
 * LIMIT 목표 월별 사용량 계산
 */
export function calculateMonthlyUsage(
  goalLogs: GoalLog[],
  logDateMap: Map<string, string> // daily_log_id -> log_date
): Map<string, number> {
  const monthlyUsage = new Map<string, number>(); // "2026-02" -> 사용량

  goalLogs.forEach((log) => {
    const logDate = logDateMap.get(log.daily_log_id);
    if (!logDate) return;

    const yearMonth = logDate.slice(0, 7); // "2026-02"
    const current = monthlyUsage.get(yearMonth) || 0;
    monthlyUsage.set(yearMonth, current + log.count);
  });

  return monthlyUsage;
}

/**
 * LIMIT 목표 달성률 계산
 */
export function calculateLimitProgress(
  goal: Goal,
  period: Period,
  goalLogs: GoalLog[],
  logDateMap: Map<string, string>
): GoalProgress {
  const cycle = goal.cycle || 'MONTHLY';
  const limitValue = goal.limit_value || goal.monthly_limit || 0;
  const today = getTodayString();
  
  if (cycle === 'TOTAL') {
    // 전체 기간 제한
    const totalUsage = goalLogs.reduce((sum, log) => sum + log.count, 0);
    const isSuccess = totalUsage <= limitValue;
    const progressPercent = isSuccess ? 100 : Math.max(0, (1 - (totalUsage - limitValue) / limitValue) * 100);

    return {
      goal_id: goal.id,
      type: 'LIMIT',
      progress_percent: Math.round(progressPercent * 10) / 10,
      current_value: isSuccess ? 1 : 0,
      target_value: 1,
    };
  }
  
  if (cycle === 'WEEKLY') {
    // 주간 제한
    const weeklyUsage = calculateWeeklyUsage(goalLogs, logDateMap);
    const weeks = getWeeksBetween(period.start_date, period.end_date);
    const currentWeekKey = getCurrentWeekKey();
    
    const weeklyStatus = weeks.map((weekStart) => {
      const used = weeklyUsage.get(weekStart) || 0;
      return {
        week_start: weekStart,
        used,
        limit: limitValue,
        is_success: used <= limitValue,
      };
    });

    // 현재까지 완료된 주만 카운트
    const completedWeeks = weeklyStatus.filter(
      (w) => w.week_start <= currentWeekKey
    );

    const successCount = completedWeeks.filter((w) => w.is_success).length;
    const progressPercent =
      completedWeeks.length > 0 ? (successCount / completedWeeks.length) * 100 : 0;

    return {
      goal_id: goal.id,
      type: 'LIMIT',
      progress_percent: Math.round(progressPercent * 10) / 10,
      current_value: successCount,
      target_value: weeks.length,
    };
  }
  
  // 월간 제한 (기존 로직)
  const monthlyUsage = calculateMonthlyUsage(goalLogs, logDateMap);
  const months = getMonthsBetween(period.start_date, period.end_date);

  const monthlyStatus = months.map(({ year, month }) => {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const used = monthlyUsage.get(key) || 0;
    return {
      year,
      month,
      used,
      limit: limitValue,
      is_success: used <= limitValue,
    };
  });

  // 현재 진행 중인 달까지만 카운트
  const currentYearMonth = today.slice(0, 7);
  const completedMonths = monthlyStatus.filter(
    (m) => `${m.year}-${String(m.month).padStart(2, '0')}` <= currentYearMonth
  );

  const successCount = completedMonths.filter((m) => m.is_success).length;
  const progressPercent =
    completedMonths.length > 0 ? (successCount / completedMonths.length) * 100 : 0;

  return {
    goal_id: goal.id,
    type: 'LIMIT',
    progress_percent: Math.round(progressPercent * 10) / 10,
    current_value: successCount,
    target_value: months.length,
    monthly_status: monthlyStatus,
  };
}

/**
 * OBJECTIVE 목표 달성률 계산
 */
export function calculateObjectiveProgress(
  goal: Goal,
  goalLogs: GoalLog[]
): GoalProgress {
  const studyLogCount = goalLogs.reduce((sum, log) => sum + log.count, 0);
  const studyTarget = goal.study_target || 0;

  // 점수 기반 달성률 (달성 시)
  let progressPercent = 0;
  let currentValue = 0;
  let targetValue = 0;

  if (studyTarget > 0) {
    currentValue = studyLogCount;
    targetValue = studyTarget;
    progressPercent = Math.min((studyLogCount / studyTarget) * 100, 100);
  } else if (goal.is_achieved && goal.achieved_value && goal.target_value) {
    currentValue = goal.achieved_value;
    targetValue = goal.target_value;
    progressPercent = Math.min((goal.achieved_value / goal.target_value) * 100, 100);
  } else {
    currentValue = studyLogCount;
    targetValue = 0;
  }

  return {
    goal_id: goal.id,
    type: 'OBJECTIVE',
    progress_percent: Math.round(progressPercent * 10) / 10,
    current_value: currentValue,
    target_value: targetValue,
    study_log_count: studyLogCount,
  };
}

/**
 * 목표 타입에 따른 달성률 계산 (통합)
 */
export function calculateGoalProgress(
  goal: Goal,
  period?: Period,
  goalLogs?: GoalLog[],
  logDateMap?: Map<string, string>
): GoalProgress {
  switch (goal.type) {
    case 'ROUTINE':
      return calculateRoutineProgress(goal, goalLogs, logDateMap);
    case 'LIMIT':
      if (!period || !goalLogs || !logDateMap) {
        throw new Error('LIMIT 타입은 period, goalLogs, logDateMap이 필요합니다');
      }
      return calculateLimitProgress(goal, period, goalLogs, logDateMap);
    case 'OBJECTIVE':
      return calculateObjectiveProgress(goal, goalLogs || []);
    default:
      throw new Error(`알 수 없는 목표 타입: ${goal.type}`);
  }
}
