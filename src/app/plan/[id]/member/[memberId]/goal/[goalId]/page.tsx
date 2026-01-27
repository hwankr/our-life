'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Save, Check, Plus, Minus, TrendingUp, Edit2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// 임시 데이터
const mockGoals: Record<string, any> = {
  'g1': { id: 'g1', memberName: '나', title: '토익 900점', description: '취업 준비용', type: 'numeric', current: 780, target: 900, unit: '점' },
  'g2': { id: 'g2', memberName: '나', title: '정보처리기사', description: '필기/실기 모두', type: 'boolean', current: 0, target: 1 },
  'g3': { id: 'g3', memberName: '나', title: '학점 4.0', description: '이번 학기', type: 'numeric', current: 3.5, target: 4.0, unit: '' },
  'g4': { id: 'g4', memberName: '나', title: '주 3회 운동', description: '헬스장', type: 'count', current: 24, target: 78, unit: '회' },
  'g5': { id: 'g5', memberName: '친구', title: '다이어트 -10kg', description: '여름까지', type: 'numeric', current: 3, target: 10, unit: 'kg' },
  'g6': { id: 'g6', memberName: '친구', title: '배달 안시켜먹기', description: '자취 연습', type: 'count', current: 45, target: 180, unit: '일' },
}

export default function GoalEditPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string
  const memberId = params.memberId as string
  const goalId = params.goalId as string

  const [goal, setGoal] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [currentValue, setCurrentValue] = useState(0)
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  // 목표 편집 모드
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editTarget, setEditTarget] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    const data = mockGoals[goalId]
    if (data) {
      setGoal(data)
      setCurrentValue(data.current)
      setEditTitle(data.title)
      setEditTarget(data.target.toString())
      setEditDescription(data.description || '')
    }
  }, [goalId])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSaving(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleSaveEdit = async () => {
    // TODO: 실제 저장
    setIsEditing(false)
  }

  if (!goal) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">목표를 찾을 수 없습니다</p>
      </main>
    )
  }

  const progress = goal.type === 'boolean'
    ? (currentValue ? 100 : 0)
    : Math.min(100, Math.round((currentValue / goal.target) * 100))

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="mx-auto max-w-md space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/plan/${planId}/member/${memberId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{goal.memberName}</p>
            <h1 className="font-bold">{goal.title}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>

        {/* 목표 편집 모드 */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <Card className="border-0 shadow-lg border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">목표 수정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">목표 이름</Label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">목표 수치</Label>
                  <Input
                    type="number"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">설명</Label>
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="간단한 설명"
                    className="h-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                    취소
                  </Button>
                  <Button className="flex-1" onClick={handleSaveEdit}>
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">진행률</span>
              <span className={`text-2xl font-bold ${
                progress >= 100 ? 'text-green-500' :
                progress >= 70 ? 'text-green-500' : 
                progress < 30 ? 'text-orange-500' : 'text-primary'
              }`}>
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            {goal.type !== 'boolean' && (
              <p className="text-center text-sm text-muted-foreground">
                {currentValue} / {goal.target} {goal.unit}
              </p>
            )}
            {goal.description && (
              <p className="text-xs text-center text-muted-foreground italic">
                "{goal.description}"
              </p>
            )}
          </CardContent>
        </Card>

        {/* Log Entry Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              기록하기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {/* Type-specific input */}
            {goal.type === 'boolean' ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={currentValue ? 'default' : 'outline'}
                  className="h-12"
                  onClick={() => setCurrentValue(1)}
                >
                  <Check className="mr-1 w-4 h-4" /> 완료
                </Button>
                <Button
                  variant={!currentValue ? 'default' : 'outline'}
                  className="h-12"
                  onClick={() => setCurrentValue(0)}
                >
                  미완료
                </Button>
              </div>
            ) : goal.type === 'count' ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs">누적 횟수</Label>
                  <span className="text-xl font-bold">{currentValue} {goal.unit}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 text-lg"
                    onClick={() => setCurrentValue(Math.max(0, currentValue - 1))}
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <Button 
                    className="flex-1 h-12 text-lg"
                    onClick={() => setCurrentValue(currentValue + 1)}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs">현재 수치</Label>
                  <span className="text-xl font-bold">{currentValue} {goal.unit}</span>
                </div>
                <input
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                  step={goal.target < 10 ? 0.1 : 1}
                  className="w-full h-12 px-3 rounded-lg border border-input bg-background text-center text-xl font-mono"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs">메모 (선택)</Label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="오늘 한 일..."
                className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none"
              />
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full h-11">
              {isSaving ? '저장 중...' : isSaved ? (
                <><Check className="mr-1 w-4 h-4" /> 저장됨!</>
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
