/**
 * 목표 달성률 계산 함수들
 * 
 * ROUTINE: currentCount / targetCount
 * LIMIT: 성공한 달 수 / 전체 달 수
 * OBJECTIVE: 공부 로그 수 + 달성 여부
 */

import { Goal, GoalLog, GoalProgress, Period } from '@/types';

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

/**
 * ROUTINE 목표 달성률 계산
 */
export function calculateRoutineProgress(goal: Goal): GoalProgress {
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
  const monthlyUsage = calculateMonthlyUsage(goalLogs, logDateMap);
  const months = getMonthsBetween(period.start_date, period.end_date);
  const monthlyLimit = goal.monthly_limit || 0;

  const monthlyStatus = months.map(({ year, month }) => {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const used = monthlyUsage.get(key) || 0;
    return {
      year,
      month,
      used,
      limit: monthlyLimit,
      is_success: used <= monthlyLimit,
    };
  });

  // 현재 진행 중인 달까지만 카운트
  const today = new Date();
  const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
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

  // 점수 기반 달성률 (달성 시)
  let progressPercent = 0;
  if (goal.is_achieved && goal.achieved_value && goal.target_value) {
    progressPercent = Math.min((goal.achieved_value / goal.target_value) * 100, 100);
  }

  return {
    goal_id: goal.id,
    type: 'OBJECTIVE',
    progress_percent: Math.round(progressPercent * 10) / 10,
    current_value: goal.achieved_value || 0,
    target_value: goal.target_value || 0,
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
      return calculateRoutineProgress(goal);
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
