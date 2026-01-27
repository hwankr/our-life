'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Check, Circle, Edit2, Trash2, Calendar, TrendingUp, Sparkles, Minus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// 임시 데이터
const mockMemberData: Record<string, any> = {
  'm1': {
    id: 'm1',
    name: '나',
    planTitle: '26년 상반기 도전',
    goals: [
      { 
        id: 'g1', 
        title: '토익 900점', 
        description: '취업 준비용 영어 점수',
        type: 'numeric', 
        current: 780, 
        target: 900,
        unit: '점',
        dailyAction: '토익 공부하기',
        increment: 5, // 하루에 증가하는 예상치
      },
      { 
        id: 'g2', 
        title: '정보처리기사', 
        description: '필기/실기 모두 합격',
        type: 'boolean', 
        current: 0, 
        target: 1,
        dailyAction: '자격증 공부하기',
      },
      { 
        id: 'g3', 
        title: '학점 4.0', 
        description: '이번 학기 올A 도전',
        type: 'numeric', 
        current: 3.5, 
        target: 4.0,
        unit: '',
        dailyAction: '수업 복습하기',
        increment: 0.01,
      },
      { 
        id: 'g4', 
        title: '주 3회 운동', 
        description: '헬스장 가기',
        type: 'count', 
        current: 24, 
        target: 78,
        unit: '회',
        dailyAction: '운동하기',
        increment: 1,
      },
    ],
  },
  'm2': {
    id: 'm2',
    name: '친구',
    planTitle: '26년 상반기 도전',
    goals: [
      { 
        id: 'g5', 
        title: '다이어트 -10kg', 
        description: '여름까지 목표 체중 달성',
        type: 'numeric', 
        current: 3, 
        target: 10,
        unit: 'kg',
        dailyAction: '다이어트 식단 지키기',
        increment: 0.1,
      },
      { 
        id: 'g6', 
        title: '배달 안시켜먹기', 
        description: '배달앱 삭제하고 자취 연습',
        type: 'count', 
        current: 45, 
        target: 180,
        unit: '일',
        dailyAction: '오늘 배달 안시킴',
        increment: 1,
      },
    ],
  },
}

export default function MemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string
  const memberId = params.memberId as string

  const [member, setMember] = useState<any>(null)
  const [todayChecks, setTodayChecks] = useState<Record<string, boolean>>({})
  const [showConfetti, setShowConfetti] = useState<string | null>(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const data = mockMemberData[memberId]
    if (data) {
      setMember(data)
      // 오늘 이미 체크한 것들 복원 (실제로는 서버에서 가져와야 함)
      const checks: Record<string, boolean> = {}
      data.goals.forEach((g: any) => {
        checks[g.id] = false
      })
      setTodayChecks(checks)
    }
  }, [memberId])

  const handleDailyCheck = (goalId: string) => {
    if (!member) return

    const goal = member.goals.find((g: any) => g.id === goalId)
    if (!goal) return

    const isChecked = todayChecks[goalId]
    
    // 토글
    setTodayChecks(prev => ({ ...prev, [goalId]: !isChecked }))

    // 목표 값 업데이트
    const updatedGoals = member.goals.map((g: any) => {
      if (g.id !== goalId) return g

      if (g.type === 'boolean') {
        return { ...g, current: !isChecked ? 1 : 0 }
      } else if (g.type === 'count' || g.type === 'numeric') {
        const increment = g.increment || 1
        return { 
          ...g, 
          current: !isChecked 
            ? Math.min(g.target, g.current + increment)
            : Math.max(0, g.current - increment)
        }
      }
      return g
    })

    setMember({ ...member, goals: updatedGoals })

    // 체크 시 작은 애니메이션
    if (!isChecked) {
      setShowConfetti(goalId)
      setTimeout(() => setShowConfetti(null), 1000)
    }
  }

  if (!member) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">멤버를 찾을 수 없습니다</p>
      </main>
    )
  }

  const overallProgress = Math.round(
    member.goals.reduce((sum: number, g: any) => {
      const p = g.type === 'boolean' ? (g.current ? 100 : 0) : Math.round((g.current / g.target) * 100)
      return sum + Math.min(100, p)
    }, 0) / member.goals.length
  )

  const checkedCount = Object.values(todayChecks).filter(Boolean).length

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="mx-auto max-w-lg space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/plan/${planId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{member.planTitle}</p>
            <h1 className="font-bold text-lg">{member.name}의 목표</h1>
          </div>
          <div className={`text-xl font-bold ${
            overallProgress >= 70 ? 'text-green-500' : 
            overallProgress < 30 ? 'text-orange-500' : 'text-primary'
          }`}>
            {overallProgress}%
          </div>
        </div>

        {/* 오늘의 체크인 카드 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                오늘의 체크인
              </h2>
              <span className="text-sm bg-white/20 px-2 py-0.5 rounded">
                {today}
              </span>
            </div>
            <p className="text-sm text-primary-foreground/70 mb-3">
              오늘 한 일을 체크하세요! 자동으로 목표에 반영됩니다.
            </p>
            <div className="flex items-center gap-1">
              {member.goals.map((goal: any, i: number) => (
                <div 
                  key={goal.id}
                  className={`flex-1 h-2 rounded-full ${todayChecks[goal.id] ? 'bg-white' : 'bg-white/20'}`}
                />
              ))}
            </div>
            <p className="text-xs text-center mt-2 text-primary-foreground/70">
              {checkedCount}/{member.goals.length} 완료
            </p>
          </CardContent>
        </Card>

        {/* 오늘 할 일 체크리스트 */}
        <div className="space-y-2">
          {member.goals.map((goal: any, gIndex: number) => {
            const isChecked = todayChecks[goal.id]
            const progress = goal.type === 'boolean'
              ? (goal.current ? 100 : 0)
              : Math.min(100, Math.round((goal.current / goal.target) * 100))
            const isComplete = progress >= 100

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: gIndex * 0.05 }}
              >
                <Card 
                  className={`border-0 shadow-sm transition-all cursor-pointer ${
                    isChecked ? 'bg-green-50 dark:bg-green-950/30 ring-2 ring-green-500' : 
                    isComplete ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => handleDailyCheck(goal.id)}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {/* 체크박스 */}
                      <button 
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isChecked 
                            ? 'bg-green-500 text-white scale-110' 
                            : 'border-2 border-muted-foreground/30 hover:border-primary'
                        }`}
                      >
                        <AnimatePresence>
                          {isChecked && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check className="w-4 h-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                          {goal.dailyAction || goal.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Progress value={progress} className="h-1 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {goal.type === 'boolean' 
                              ? (goal.current ? '완료' : '미완료')
                              : `${goal.current}/${goal.target}`
                            }
                          </span>
                        </div>
                      </div>

                      {/* 증가량 표시 */}
                      {goal.type !== 'boolean' && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          isChecked ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                        }`}>
                          +{goal.increment || 1}
                        </span>
                      )}

                      {/* 컨페티 효과 */}
                      <AnimatePresence>
                        {showConfetti === goal.id && (
                          <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute right-4"
                          >
                            🎉
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* 목표 관리 링크 */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-1"
            onClick={() => router.push(`/plan/${planId}/member/${memberId}/goals`)}
          >
            <Edit2 className="w-4 h-4" /> 목표 상세 보기
          </Button>
          <Button 
            variant="outline" 
            className="gap-1"
            onClick={() => router.push(`/plan/${planId}/member/${memberId}/goal/new`)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </main>
  )
}
