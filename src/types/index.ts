// Goal 타입 정의
export type GoalType = 'ROUTINE' | 'LIMIT' | 'OBJECTIVE';
export type GoalCycle = 'TOTAL' | 'WEEKLY' | 'MONTHLY';

// 데이터베이스 테이블 타입
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Period {
  id: string;
  title: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  is_active: boolean;
  participant_ids: string[];
  created_at: string;
}

export interface Goal {
  id: string;
  period_id: string;
  user_id: string;
  title: string;
  type: GoalType;
  
  // 주기 설정 (ROUTINE, LIMIT)
  cycle: GoalCycle;
  
  // ROUTINE 전용
  target_count: number | null;
  current_count: number;
  
  // LIMIT 전용 (레거시)
  monthly_limit: number | null;
  // LIMIT/ROUTINE 주간/월간 제한값
  limit_value: number | null;
  
  // OBJECTIVE 전용
  subcategories: string[] | null;
  is_achieved: boolean;
  achieved_value: number | null;
  target_value: number | null;
  study_target: number | null;
  study_unit: string | null;
  study_day_count: number | null;
  
  // 공통
  unit: string;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  period_id: string;
  log_date: string; // YYYY-MM-DD
  diary: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalLog {
  id: string;
  daily_log_id: string;
  goal_id: string;
  count: number;
  subcategory_data: Record<string, boolean> | null;
  memo: string | null;
  created_at: string;
}

// API 응답 타입
export interface GoalWithLogs extends Goal {
  goal_logs?: GoalLog[];
}

export interface DailyLogWithGoalLogs extends DailyLog {
  goal_logs?: GoalLog[];
}

// 폼 타입
export interface GoalFormData {
  title: string;
  type: GoalType;
  target_count?: number;
  monthly_limit?: number;
  subcategories?: string[];
  target_value?: number;
  study_target?: number;
  study_unit?: string;
  unit: string;
}

export interface DailyLogFormData {
  diary: string;
  goal_checks: {
    goal_id: string;
    checked: boolean;
    count: number;
    subcategory_data?: Record<string, boolean>;
    memo?: string;
  }[];
}

// 계산 결과 타입
export interface GoalProgress {
  goal_id: string;
  type: GoalType;
  progress_percent: number; // 0-100
  current_value: number;
  target_value: number;
  // LIMIT 전용
  monthly_status?: {
    year: number;
    month: number;
    used: number;
    limit: number;
    is_success: boolean;
  }[];
  // OBJECTIVE 전용
  study_log_count?: number;
}
