'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, ChevronRight, ChevronLeft, TrendingUp, Target, Check, Plus, UserPlus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// 임시 데이터
const mockPlanData: Record<string, any> = {
  '1': {
    id: '1',
    title: '26년 상반기 도전',
    startDate: '2026-02-01',
    endDate: '2026-07-31',
    members: [
      {
        id: 'm1',
        name: '나',
        goals: [
          { id: 'g1', title: '토익 900점', type: 'numeric', current: 780, target: 900 },
          { id: 'g2', title: '정보처리기사', type: 'boolean', current: 0, target: 1 },
          { id: 'g3', title: '학점 4.0', type: 'numeric', current: 3.5, target: 4.0 },
          { id: 'g4', title: '주 3회 운동', type: 'count', current: 24, target: 78 },
        ],
      },
      {
        id: 'm2',
        name: '친구',
        goals: [
          { id: 'g5', title: '다이어트 -10kg', type: 'numeric', current: 3, target: 10 },
          { id: 'g6', title: '배달 안시켜먹기', type: 'count', current: 45, target: 180 },
        ],
      },
    ],
    // 기록된 날짜들 (임시 데이터)
    loggedDates: {
      'm1': ['2026-01-20', '2026-01-21', '2026-01-23', '2026-01-25', '2026-01-26', '2026-01-27'],
      'm2': ['2026-01-22', '2026-01-24', '2026-01-26', '2026-01-27'],
    },
  },
}

function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = end.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function calculateDaysPassed(startDate: string): number {
  const start = new Date(startDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = today.getTime() - start.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function calculateTotalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

// 캘린더 컴포넌트
function MiniCalendar({ 
  loggedDates, 
  members,
  onDateClick,
  selectedDate,
}: { 
  loggedDates: Record<string, string[]>
  members: { id: string; name: string }[]
  onDateClick?: (date: string) => void
  selectedDate?: string | null
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay() // 0 = Sunday
  const daysInMonth = lastDay.getDate()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const getDayStatus = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const memberLogs = members.map(m => loggedDates[m.id]?.includes(dateStr))
    const allLogged = memberLogs.every(Boolean)
    const someLogged = memberLogs.some(Boolean)
    return { allLogged, someLogged, memberLogs, dateStr }
  }

  const days = []
  // 빈 칸
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />)
  }
  // 날짜
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day)
    const isToday = dateObj.getTime() === today.getTime()
    const isFuture = dateObj > today
    const { allLogged, someLogged, memberLogs, dateStr } = getDayStatus(day)
    const isSelected = selectedDate === dateStr

    days.push(
      <button 
        key={day}
        type="button"
        disabled={isFuture}
        onClick={() => !isFuture && onDateClick?.(dateStr)}
        className={`h-10 flex flex-col items-center justify-center rounded-lg text-sm relative transition-all ${
          isSelected ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' :
          isToday ? 'ring-2 ring-primary/50' : ''
        } ${isFuture ? 'text-muted-foreground/40 cursor-not-allowed' : 'hover:bg-muted cursor-pointer active:scale-95'}`}
      >
        <span className={`${!isSelected && allLogged ? 'font-bold text-green-600' : !isSelected && someLogged ? 'font-medium' : ''}`}>
          {day}
        </span>
        {/* 멤버별 기록 표시 (점) */}
        {!isFuture && !isSelected && (
          <div className="flex gap-0.5 mt-0.5">
            {memberLogs.map((logged, i) => (
              <div 
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  logged ? (i === 0 ? 'bg-blue-500' : 'bg-pink-500') : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}
      </button>
    )
  }

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="text-base">
            {year}년 {monthNames[month]}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map(d => (
            <div key={d} className="h-6 flex items-center justify-center text-xs text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-0.5">
          {days}
        </div>
        {/* 범례 */}
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
          {members.map((m, i) => (
            <div key={m.id} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-pink-500'}`} />
              <span>{m.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string

  const [plan, setPlan] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')

  useEffect(() => {
    setPlan(mockPlanData[planId])
  }, [planId])

  const handleAddMember = () => {
    if (!newMemberName.trim() || !plan) return
    
    const newMember = {
      id: `m${Date.now()}`,
      name: newMemberName.trim(),
      goals: [],
    }
    
    setPlan({
      ...plan,
      members: [...plan.members, newMember],
      loggedDates: {
        ...plan.loggedDates,
        [newMember.id]: [],
      },
    })
    
    setNewMemberName('')
    setShowAddMember(false)
  }

  if (!plan) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">플랜을 찾을 수 없습니다</p>
      </main>
    )
  }

  const daysRemaining = calculateDaysRemaining(plan.endDate)
  const daysPassed = calculateDaysPassed(plan.startDate)
  const totalDays = calculateTotalDays(plan.startDate, plan.endDate)
  const timeProgress = Math.min(100, Math.round((daysPassed / totalDays) * 100))

  // 전체 진행률 계산
  const allGoals = plan.members.flatMap((m: any) => m.goals)
  const overallProgress = Math.round(
    allGoals.reduce((sum: number, g: any) => {
      const p = g.type === 'boolean' ? (g.current ? 100 : 0) : Math.round((g.current / g.target) * 100)
      return sum + Math.min(100, p)
    }, 0) / allGoals.length
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="mx-auto max-w-lg space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">{plan.title}</h1>
            <p className="text-sm text-muted-foreground">
              {plan.startDate} ~ {plan.endDate}
            </p>
          </div>
        </div>

        {/* 전체 요약 카드 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden">
          <CardContent className="pt-5 pb-5">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <p className="text-3xl font-bold">D-{daysRemaining > 0 ? daysRemaining : 0}</p>
                <p className="text-xs text-primary-foreground/70">남은 일수</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{overallProgress}%</p>
                <p className="text-xs text-primary-foreground/70">전체 진행률</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{allGoals.length}</p>
                <p className="text-xs text-primary-foreground/70">총 목표</p>
              </div>
            </div>
            
            {/* 시간 진행 바 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-primary-foreground/70">
                <span>기간 진행률</span>
                <span>{timeProgress}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${timeProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 캘린더 */}
        <MiniCalendar 
          loggedDates={plan.loggedDates} 
          members={plan.members.map((m: any) => ({ id: m.id, name: m.name }))}
          selectedDate={selectedDate}
          onDateClick={(date) => setSelectedDate(selectedDate === date ? null : date)}
        />

        {/* 선택된 날짜 기록 */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-md border-l-4 border-l-primary">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {selectedDate}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                    닫기
                  </Button>
                </div>
                <div className="space-y-2">
                  {plan.members.map((member: any, i: number) => {
                    const hasLog = plan.loggedDates[member.id]?.includes(selectedDate)
                    return (
                      <div 
                        key={member.id}
                        className={`flex items-center justify-between p-2 rounded-lg ${hasLog ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            i === 0 ? 'bg-blue-500' : 'bg-pink-500'
                          }`}>
                            {member.name[0]}
                          </div>
                          <span className="text-sm">{member.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          hasLog 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {hasLog ? (
                            <span className="flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> 기록함
                            </span>
                          ) : '기록 없음'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 멤버별 요약 카드 */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> 멤버별 진행 상황
          </h2>
          
          {plan.members.map((member: any, mIndex: number) => {
            const memberProgress = Math.round(
              member.goals.reduce((sum: number, g: any) => {
                const p = g.type === 'boolean' ? (g.current ? 100 : 0) : Math.round((g.current / g.target) * 100)
                return sum + Math.min(100, p)
              }, 0) / member.goals.length
            )
            const completedGoals = member.goals.filter((g: any) => {
              const p = g.type === 'boolean' ? g.current : (g.current / g.target) >= 1
              return p
            }).length

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: mIndex * 0.1 }}
              >
                <Card 
                  className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-all active:scale-[0.98]"
                  onClick={() => router.push(`/plan/${planId}/member/${member.id}`)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${
                          mIndex === 0 ? 'bg-blue-500' : 'bg-pink-500'
                        }`}>
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {completedGoals}/{member.goals.length} 목표 완료
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${
                          memberProgress >= 70 ? 'text-green-500' : 
                          memberProgress < 30 ? 'text-orange-500' : 'text-primary'
                        }`}>
                          {memberProgress}%
                        </span>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <Progress value={memberProgress} className="h-2" />

                    {/* 목표 미리보기 */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {member.goals.map((goal: any) => {
                        const gProgress = goal.type === 'boolean' 
                          ? (goal.current ? 100 : 0) 
                          : Math.min(100, Math.round((goal.current / goal.target) * 100))
                        return (
                          <span 
                            key={goal.id}
                            className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                              gProgress >= 100 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {gProgress >= 100 && <Check className="w-3 h-3" />}
                            {goal.title}
                          </span>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}

          {/* 멤버 추가 버튼 / 입력 폼 */}
          {showAddMember ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-2 border-dashed border-primary/50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="이름 입력"
                      autoFocus
                      className="flex-1 h-10 px-3 rounded-lg border border-input bg-background text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                    />
                    <Button size="icon" onClick={handleAddMember} disabled={!newMemberName.trim()}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setShowAddMember(false); setNewMemberName(''); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowAddMember(true)}
            >
              <UserPlus className="w-4 h-4" /> 인원 추가
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
