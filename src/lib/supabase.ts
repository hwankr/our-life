// Database types (no Supabase dependency for now)

export interface Project {
  id: string
  code: string
  name: string
  start_date: string
  end_date: string
  pin: string
  created_at: string
}

export interface Member {
  id: string
  project_id: string
  name: string
  created_at: string
}

export interface Goal {
  id: string
  member_id: string
  main_goal: string
  kpi_type: 'numeric' | 'boolean'
  target_value: number | null
  current_value: number
  motivation: string | null
  created_at: string
}

export interface DailyLog {
  id: string
  goal_id: string
  date: string
  progress_value: number
  activity_summary: string | null
  created_at: string
}

// Helper functions
export function generateProjectCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = end.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function calculateProgress(currentValue: number, targetValue: number): number {
  if (targetValue === 0) return 0
  return Math.min(100, Math.round((currentValue / targetValue) * 100))
}
