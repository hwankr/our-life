'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Calendar, Users, ChevronRight, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// 임시 데이터
const mockPlans = [
  {
    id: '1',
    title: '26년 상반기 도전',
    startDate: '2026-02-01',
    endDate: '2026-07-31',
    members: [
      { 
        name: '나', 
        goals: ['토익 900점', '정보처리기사', '학점 4.0', '주 3회 운동'],
        completedCount: 1,
      },
      { 
        name: '친구', 
        goals: ['다이어트 -10kg', '배달 안시켜먹기'],
        completedCount: 0,
      },
    ],
  },
]

function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = end.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export default function HomePage() {
  const router = useRouter()
  const [plans] = useState(mockPlans)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="mx-auto max-w-lg space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            우리들의 목표
          </h1>
          <Button size="sm" onClick={() => router.push('/plan/new')} className="gap-1">
            <Plus className="w-4 h-4" /> 플랜
          </Button>
        </div>

        {/* Plan Cards */}
        <div className="space-y-4">
          {plans.map((plan, index) => {
            const daysRemaining = calculateDaysRemaining(plan.endDate)
            const totalGoals = plan.members.reduce((sum, m) => sum + m.goals.length, 0)
            const completedGoals = plan.members.reduce((sum, m) => sum + m.completedCount, 0)
            const progressPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all overflow-hidden"
                  onClick={() => router.push(`/plan/${plan.id}`)}
                >
                  {/* Header */}
                  <div className="bg-primary text-primary-foreground p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-lg">{plan.title}</h2>
                      <span className="text-sm bg-white/20 px-2 py-1 rounded">
                        D-{daysRemaining > 0 ? daysRemaining : 0}
                      </span>
                    </div>
                    <p className="text-sm text-primary-foreground/80 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(plan.startDate)} ~ {formatDate(plan.endDate)}
                    </p>
                  </div>

                  <CardContent className="pt-4">
                    {/* Members Preview */}
                    <div className="space-y-3">
                      {plan.members.map((member, mIndex) => (
                        <div key={mIndex} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                              {member.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {member.goals.slice(0, 2).join(', ')}
                                {member.goals.length > 2 && ` 외 ${member.goals.length - 2}개`}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="mt-4 pt-3 border-t">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">전체 진행률</span>
                        <span className="font-medium">{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}

          {/* Empty State */}
          {plans.length === 0 && (
            <Card 
              className="border-2 border-dashed cursor-pointer hover:border-primary/50"
              onClick={() => router.push('/plan/new')}
            >
              <CardContent className="py-10 text-center">
                <Plus className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">첫 번째 플랜을 만들어보세요</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
