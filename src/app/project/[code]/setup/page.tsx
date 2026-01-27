'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Target, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { saveGoal, getGoalByMemberId } from '@/lib/actions'

export default function SetupPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [memberId, setMemberId] = useState<string | null>(null)
  const [memberName, setMemberName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [mainGoal, setMainGoal] = useState('')
  const [kpiType, setKpiType] = useState<'numeric' | 'boolean'>('numeric')
  const [targetValue, setTargetValue] = useState<string>('')

  useEffect(() => {
    const storedMemberId = sessionStorage.getItem('currentMemberId')
    const storedMemberName = sessionStorage.getItem('currentMemberName')
    
    if (!storedMemberId) {
      router.push(`/project/${code}`)
      return
    }
    
    setMemberId(storedMemberId)
    setMemberName(storedMemberName || '')

    getGoalByMemberId(storedMemberId).then(goal => {
      if (goal) {
        setMainGoal(goal.main_goal)
        setKpiType(goal.kpi_type)
        setTargetValue(goal.target_value?.toString() || '')
      }
    })
  }, [code, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberId) return

    setIsLoading(true)
    setError(null)

    const result = await saveGoal({
      memberId,
      mainGoal,
      kpiType,
      targetValue: kpiType === 'numeric' ? parseInt(targetValue) || null : null,
      motivation: null,
    })

    if ('error' in result) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push(`/project/${code}/dashboard`)
  }

  if (!memberId) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">{memberName}의 목표</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="mainGoal">목표</Label>
                <Input
                  id="mainGoal"
                  value={mainGoal}
                  onChange={(e) => setMainGoal(e.target.value)}
                  placeholder="예: 토익 900점 달성"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>측정 방식</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKpiType('numeric')}
                    className={`p-3 rounded-lg border-2 text-sm transition-all ${
                      kpiType === 'numeric'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium">수치형</p>
                    <p className="text-xs text-muted-foreground">100p 읽기</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setKpiType('boolean')}
                    className={`p-3 rounded-lg border-2 text-sm transition-all ${
                      kpiType === 'boolean'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium">체크형</p>
                    <p className="text-xs text-muted-foreground">매일 운동</p>
                  </button>
                </div>
              </div>

              {kpiType === 'numeric' && (
                <div className="space-y-2">
                  <Label htmlFor="targetValue">목표 수치</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="예: 100"
                    className="h-11"
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading || !mainGoal}
                className="w-full h-11"
              >
                {isLoading ? '저장 중...' : (
                  <>저장 <ArrowRight className="ml-1 w-4 h-4" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
