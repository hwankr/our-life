'use server'

import { generateProjectCode, type Project, type Member, type Goal, type DailyLog } from './supabase'

// In-memory storage for server-side (will reset on server restart)
// For demo purposes without database
let projects: Project[] = []
let members: Member[] = []
let goals: Goal[] = []
let dailyLogs: DailyLog[] = []

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Project Actions
export async function createProject(data: {
  name: string
  startDate: string
  endDate: string
  pin: string
  memberNames: string[]
}): Promise<{ project: Project; members: Member[] } | { error: string }> {
  const code = generateProjectCode()
  const projectId = generateId()
  
  const project: Project = {
    id: projectId,
    code,
    name: data.name,
    start_date: data.startDate,
    end_date: data.endDate,
    pin: data.pin,
    created_at: new Date().toISOString(),
  }
  
  projects.push(project)

  const newMembers: Member[] = data.memberNames.map(name => ({
    id: generateId(),
    project_id: projectId,
    name,
    created_at: new Date().toISOString(),
  }))

  members.push(...newMembers)

  return { project, members: newMembers }
}

export async function getProjectByCode(code: string): Promise<{ project: Project; members: Member[] } | null> {
  const project = projects.find(p => p.code === code.toUpperCase())
  if (!project) return null

  const projectMembers = members.filter(m => m.project_id === project.id)
  return { project, members: projectMembers }
}

export async function verifyPin(projectId: string, pin: string): Promise<boolean> {
  const project = projects.find(p => p.id === projectId)
  return project?.pin === pin
}

// Goal Actions
export async function saveGoal(data: {
  memberId: string
  mainGoal: string
  kpiType: 'numeric' | 'boolean'
  targetValue: number | null
  motivation: string | null
}): Promise<Goal | { error: string }> {
  // Check if goal exists for this member
  const existingIndex = goals.findIndex(g => g.member_id === data.memberId)
  
  const goal: Goal = {
    id: existingIndex >= 0 ? goals[existingIndex].id : generateId(),
    member_id: data.memberId,
    main_goal: data.mainGoal,
    kpi_type: data.kpiType,
    target_value: data.targetValue,
    current_value: existingIndex >= 0 ? goals[existingIndex].current_value : 0,
    motivation: data.motivation,
    created_at: existingIndex >= 0 ? goals[existingIndex].created_at : new Date().toISOString(),
  }

  if (existingIndex >= 0) {
    goals[existingIndex] = goal
  } else {
    goals.push(goal)
  }

  return goal
}

export async function getGoalByMemberId(memberId: string): Promise<Goal | null> {
  return goals.find(g => g.member_id === memberId) || null
}

// Daily Log Actions
export async function saveDailyLog(data: {
  goalId: string
  date: string
  progressValue: number
  activitySummary: string | null
}): Promise<DailyLog | { error: string }> {
  // Check if log exists for this goal and date
  const existingIndex = dailyLogs.findIndex(l => l.goal_id === data.goalId && l.date === data.date)
  
  const log: DailyLog = {
    id: existingIndex >= 0 ? dailyLogs[existingIndex].id : generateId(),
    goal_id: data.goalId,
    date: data.date,
    progress_value: data.progressValue,
    activity_summary: data.activitySummary,
    created_at: existingIndex >= 0 ? dailyLogs[existingIndex].created_at : new Date().toISOString(),
  }

  if (existingIndex >= 0) {
    dailyLogs[existingIndex] = log
  } else {
    dailyLogs.push(log)
  }

  // Update current value in goal
  const goal = goals.find(g => g.id === data.goalId)
  if (goal) {
    goal.current_value = data.progressValue
  }

  return log
}

export async function getDailyLogs(goalId: string): Promise<DailyLog[]> {
  return dailyLogs
    .filter(l => l.goal_id === goalId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Dashboard Data
export async function getDashboardData(projectId: string) {
  const projectMembers = members.filter(m => m.project_id === projectId)
  
  return projectMembers.map(member => {
    const memberGoals = goals.filter(g => g.member_id === member.id)
    
    return {
      ...member,
      goals: memberGoals.map(goal => ({
        ...goal,
        daily_logs: dailyLogs
          .filter(l => l.goal_id === goal.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }))
    }
  })
}

// Demo data initializer (optional - for testing)
export async function initDemoData() {
  if (projects.length > 0) return // Already initialized
  
  const demoProject: Project = {
    id: 'demo-project-1',
    code: 'DEMO01',
    name: '2024 상반기 자격증반',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    pin: '1234',
    created_at: new Date().toISOString(),
  }
  projects.push(demoProject)

  const demoMembers: Member[] = [
    { id: 'member-1', project_id: demoProject.id, name: '철수', created_at: new Date().toISOString() },
    { id: 'member-2', project_id: demoProject.id, name: '영희', created_at: new Date().toISOString() },
    { id: 'member-3', project_id: demoProject.id, name: '민수', created_at: new Date().toISOString() },
  ]
  members.push(...demoMembers)

  const demoGoals: Goal[] = [
    { id: 'goal-1', member_id: 'member-1', main_goal: '정보처리기사 합격', kpi_type: 'numeric', target_value: 500, current_value: 320, motivation: '이번엔 꼭!', created_at: new Date().toISOString() },
    { id: 'goal-2', member_id: 'member-2', main_goal: 'TOEIC 900점', kpi_type: 'numeric', target_value: 900, current_value: 780, motivation: '화이팅!', created_at: new Date().toISOString() },
    { id: 'goal-3', member_id: 'member-3', main_goal: '매일 운동하기', kpi_type: 'boolean', target_value: null, current_value: 75, motivation: '건강이 최고', created_at: new Date().toISOString() },
  ]
  goals.push(...demoGoals)

  const today = new Date().toISOString().split('T')[0]
  const demoLogs: DailyLog[] = [
    { id: 'log-1', goal_id: 'goal-1', date: today, progress_value: 320, activity_summary: '오늘 30페이지 읽음. 데이터베이스 파트 정리 완료!', created_at: new Date().toISOString() },
    { id: 'log-2', goal_id: 'goal-2', date: today, progress_value: 780, activity_summary: 'LC 파트 3, 4 연습. 틀린 문제 복습함.', created_at: new Date().toISOString() },
  ]
  dailyLogs.push(...demoLogs)
}
