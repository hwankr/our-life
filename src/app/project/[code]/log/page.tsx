'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, PenLine, Save, ArrowLeft, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { saveDailyLog, getGoalByMemberId, getDailyLogs } from '@/lib/actions'
import type { Goal } from '@/lib/supabase'

export default function LogPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [memberId, setMemberId] = useState<string | null>(null)
  const [memberName, setMemberName] = useState<string>('')
  const [goal, setGoal] = useState<Goal | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [progressValue, setProgressValue] = useState(0)
  const [activitySummary, setActivitySummary] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const storedMemberId = sessionStorage.getItem('currentMemberId')
    const storedMemberName = sessionStorage.getItem('currentMemberName')
    
    if (!storedMemberId) {
      router.push(`/project/${code}`)
      return
    }
    
    setMemberId(storedMemberId)
    setMemberName(storedMemberName || '')

    getGoalByMemberId(storedMemberId).then(g => {
      if (g) {
        setGoal(g)
        setProgressValue(g.current_value)
      } else {
        router.push(`/project/${code}/setup`)
      }
    })
  }, [code, router])

  useEffect(() => {
    if (!goal) return
    
    getDailyLogs(goal.id).then(logs => {
      const todayLog = logs.find(l => l.date === selectedDate)
      if (todayLog) {
        setProgressValue(todayLog.progress_value)
        setActivitySummary(todayLog.activity_summary || '')
      } else {
        setActivitySummary('')
      }
    })
  }, [goal, selectedDate])

  const handleSave = async () => {
    if (!goal) return
    setIsSaving(true)

    await saveDailyLog({
      goalId: goal.id,
      date: selectedDate,
      progressValue,
      activitySummary: activitySummary || null,
    })

    setIsSaving(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  if (!memberId || !goal) {
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

  const progressPercent = goal.kpi_type === 'numeric' && goal.target_value
    ? Math.round((progressValue / goal.target_value) * 100)
    : progressValue

  return (
    <main className="min-h-screen bg-background dark text-foreground p-4">
      <div className="mx-auto max-w-md space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/project/${code}/dashboard`)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> 돌아가기
          </Button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <PenLine className="w-4 h-4 text-primary" />
              오늘의 기록
            </CardTitle>
            <p className="text-sm text-muted-foreground">{memberName} · {goal.main_goal}</p>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-sm">
                <Calendar className="w-3 h-3" /> 날짜
              </Label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-input bg-background"
              />
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">진행률</Label>
                <span className="text-xl font-bold text-primary">
                  {goal.kpi_type === 'numeric' 
                    ? `${progressValue} / ${goal.target_value}`
                    : `${progressPercent}%`
                  }
                </span>
              </div>

              {goal.kpi_type === 'numeric' ? (
                <input
                  type="number"
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value) || 0)}
                  className="w-full h-12 px-3 rounded-lg border border-input bg-background text-center text-lg font-mono"
                />
              ) : (
                <Slider
                  value={[progressValue]}
                  onValueChange={(values) => setProgressValue(values[0])}
                  max={100}
                  step={10}
                  className="py-2"
                />
              )}

              {/* Progress Bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
            </div>

            {/* Activity Summary */}
            <div className="space-y-2">
              <Label className="text-sm">오늘 한 일</Label>
              <textarea
                value={activitySummary}
                onChange={(e) => setActivitySummary(e.target.value)}
                placeholder="간단히 적어주세요..."
                className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background resize-none text-sm"
              />
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full h-11">
              {isSaving ? '저장 중...' : isSaved ? (
                <><Check className="mr-1 w-4 h-4" /> 저장됨</>
              ) : (
                <><Save className="mr-1 w-4 h-4" /> 저장</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
