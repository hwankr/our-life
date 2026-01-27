'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Save, Check, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'

// 임시 데이터
const mockGoals: Record<string, any> = {
  '1': {
    id: '1',
    name: '철수',
    goal: '토익 900점',
    type: 'numeric',
    current: 780,
    target: 900,
    logs: [
      { date: '2024-01-27', value: 780, note: 'LC 파트 연습' },
      { date: '2024-01-26', value: 750, note: 'RC 단어 암기' },
    ]
  },
  '2': {
    id: '2',
    name: '영희',
    goal: '책 50권 읽기',
    type: 'numeric',
    current: 23,
    target: 50,
    logs: [
      { date: '2024-01-27', value: 23, note: '데미안 완독' },
    ]
  },
}

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.id as string

  const [goal, setGoal] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [progressValue, setProgressValue] = useState(0)
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // 목표 데이터 로드
    const data = mockGoals[goalId]
    if (data) {
      setGoal(data)
      setProgressValue(data.current)
    }
  }, [goalId])

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: 실제 저장 로직
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSaving(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  if (!goal) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">목표를 찾을 수 없습니다</p>
      </main>
    )
  }

  const progress = goal.type === 'numeric' 
    ? Math.round((progressValue / goal.target) * 100)
    : progressValue

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="mx-auto max-w-lg space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">{goal.name}</p>
            <h1 className="font-bold">{goal.goal}</h1>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">진행률</span>
              <span className={`text-2xl font-bold ${
                progress >= 70 ? 'text-green-500' : 
                progress < 30 ? 'text-orange-500' : 'text-primary'
              }`}>
                {progress}%
              </span>
            </div>
            
            <Progress value={progress} className="h-3" />
            
            <div className="text-center text-sm text-muted-foreground">
              {progressValue} / {goal.target}
            </div>
          </CardContent>
        </Card>

        {/* Log Entry */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">오늘의 기록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" /> 날짜
              </Label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
              />
            </div>

            {/* Progress Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">현재 수치</Label>
                <span className="text-lg font-bold">{progressValue}</span>
              </div>
              
              {goal.type === 'numeric' ? (
                <input
                  type="number"
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value) || 0)}
                  className="w-full h-11 px-3 rounded-lg border border-input bg-background text-center text-lg"
                />
              ) : (
                <Slider
                  value={[progressValue]}
                  onValueChange={(values) => setProgressValue(values[0])}
                  max={100}
                  step={5}
                />
              )}
            </div>

            {/* Note */}
            <div className="space-y-1">
              <Label className="text-xs">메모</Label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="오늘 한 일을 간단히..."
                className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none"
              />
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? '저장 중...' : isSaved ? (
                <><Check className="mr-1 w-4 h-4" /> 저장됨</>
              ) : (
                <><Save className="mr-1 w-4 h-4" /> 저장</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        {goal.logs && goal.logs.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> 최근 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {goal.logs.slice(0, 5).map((log: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground">{log.date}</span>
                    <span>{log.note}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
