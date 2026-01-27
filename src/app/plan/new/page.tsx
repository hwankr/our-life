'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Users, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewPlanPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState(['', ''])

  const handleAddMember = () => {
    if (members.length < 8) {
      setMembers([...members, ''])
    }
  }

  const handleRemoveMember = (index: number) => {
    if (members.length > 2) {
      setMembers(members.filter((_, i) => i !== index))
    }
  }

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members]
    newMembers[index] = value
    setMembers(newMembers)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: 실제 저장 로직
    await new Promise(resolve => setTimeout(resolve, 500))
    
    router.push('/plan/1') // 임시로 플랜 1로 이동
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="mx-auto max-w-sm space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold">새 플랜</h1>
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
              <CardTitle className="text-lg">플랜 만들기</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs">플랜 이름</Label>
                  <Input
                    name="title"
                    placeholder="예: 26년 상반기 도전"
                    required
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> 시작일
                    </Label>
                    <Input
                      name="startDate"
                      type="date"
                      defaultValue={today}
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">종료일</Label>
                    <Input
                      name="endDate"
                      type="date"
                      required
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Users className="w-3 h-3" /> 참여자
                  </Label>
                  {members.map((name, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={name}
                        onChange={(e) => handleMemberChange(index, e.target.value)}
                        placeholder={`참여자 ${index + 1}`}
                        className="h-10"
                      />
                      {members.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(index)}
                          className="h-10 w-10 shrink-0"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  {members.length < 8 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddMember}
                      className="w-full"
                    >
                      + 참여자 추가
                    </Button>
                  )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? '생성 중...' : '만들기'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
