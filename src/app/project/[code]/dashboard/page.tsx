'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, PenLine, Settings, Clock, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getProjectByCode, getDashboardData } from '@/lib/actions'
import { calculateDaysRemaining, calculateProgress, type Project } from '@/lib/supabase'

interface MemberWithGoal {
  id: string
  name: string
  goals?: {
    id: string
    main_goal: string
    kpi_type: 'numeric' | 'boolean'
    target_value: number | null
    current_value: number
    daily_logs?: {
      date: string
      progress_value: number
      activity_summary: string | null
    }[]
  }[]
}

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<MemberWithGoal[]>([])
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedMemberId = sessionStorage.getItem('currentMemberId')
    if (!storedMemberId) {
      router.push(`/project/${code}`)
      return
    }
    setCurrentMemberId(storedMemberId)

    async function loadData() {
      const projectData = await getProjectByCode(code)
      if (projectData) {
        setProject(projectData.project)
        const dashboardData = await getDashboardData(projectData.project.id)
        setMembers(dashboardData)
      }
      setIsLoading(false)
    }
    loadData()
  }, [code, router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </main>
    )
  }

  if (!project) return null

  const daysRemaining = calculateDaysRemaining(project.end_date)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="mx-auto max-w-lg space-y-4">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-primary text-primary-foreground">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold">{project.name}</h1>
                <p className="text-primary-foreground/80 text-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {project.start_date} ~ {project.end_date}
                </p>
              </div>
              <div className="text-center bg-white/20 rounded-lg px-4 py-2">
                <p className="text-2xl font-bold">D-{daysRemaining > 0 ? daysRemaining : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/project/${code}/log`)} className="flex-1 gap-1">
            <PenLine className="w-4 h-4" /> 기록하기
          </Button>
          <Button variant="outline" onClick={() => router.push(`/project/${code}/setup`)} className="gap-1">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Members */}
        <div className="space-y-3">
          {members.map((member, index) => {
            const goal = member.goals?.[0]
            const progress = goal 
              ? goal.kpi_type === 'numeric' && goal.target_value
                ? calculateProgress(goal.current_value, goal.target_value)
                : goal.current_value
              : 0
            
            const latestLog = goal?.daily_logs?.[0]
            const isMe = member.id === currentMemberId

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-0 shadow-md ${isMe ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {member.name}
                        {isMe && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">나</span>
                        )}
                      </CardTitle>
                      <span className={`text-lg font-bold ${
                        progress >= 70 ? 'text-green-500' : progress < 30 ? 'text-red-500' : 'text-primary'
                      }`}>
                        {progress}%
                      </span>
                    </div>
                    {goal && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Target className="w-3 h-3" /> {goal.main_goal}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pb-4 space-y-2">
                    <Progress value={progress} className="h-2" />
                    
                    {goal?.kpi_type === 'numeric' && goal.target_value && (
                      <p className="text-xs text-muted-foreground text-right">
                        {goal.current_value} / {goal.target_value}
                      </p>
                    )}

                    {latestLog ? (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 최근: {latestLog.date}
                        {latestLog.activity_summary && (
                          <span className="ml-1 truncate">- {latestLog.activity_summary}</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">아직 기록 없음</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
