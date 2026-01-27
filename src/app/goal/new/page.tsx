'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewGoalPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [type, setType] = useState<'numeric' | 'boolean'>('numeric')
  const [target, setTarget] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: 실제 저장 로직
    await new Promise(resolve => setTimeout(resolve, 500))
    
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="mx-auto max-w-sm space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold">새 목표</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-3 text-center">
              <div className="mx-auto mb-2 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">목표 추가</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs">이름</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="누구의 목표인가요?"
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">목표</Label>
                  <Input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="예: 토익 900점"
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">측정 방식</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('numeric')}
                      className={`p-2 rounded-lg border-2 text-sm transition-all ${
                        type === 'numeric'
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      }`}
                    >
                      <p className="font-medium">수치형</p>
                      <p className="text-xs text-muted-foreground">100p 읽기</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('boolean')}
                      className={`p-2 rounded-lg border-2 text-sm transition-all ${
                        type === 'boolean'
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      }`}
                    >
                      <p className="font-medium">체크형</p>
                      <p className="text-xs text-muted-foreground">매일 운동</p>
                    </button>
                  </div>
                </div>

                {type === 'numeric' && (
                  <div className="space-y-1">
                    <Label className="text-xs">목표 수치</Label>
                    <Input
                      type="number"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="예: 100"
                      className="h-10"
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading || !name || !goal}
                  className="w-full"
                >
                  {isLoading ? '저장 중...' : '추가하기'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
