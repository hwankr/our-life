'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, ArrowRight, Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProjectByCode } from '@/lib/actions'
import { calculateDaysRemaining, type Project, type Member } from '@/lib/supabase'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProject() {
      const data = await getProjectByCode(code)
      if (data) {
        setProject(data.project)
        setMembers(data.members)
      }
      setIsLoading(false)
    }
    loadProject()
  }, [code])

  const handleSelectMember = (member: Member) => {
    sessionStorage.setItem('currentMemberId', member.id)
    sessionStorage.setItem('currentMemberName', member.name)
    sessionStorage.setItem('currentProjectId', project!.id)
    router.push(`/project/${code}/dashboard`)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </main>
    )
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center">
          <CardHeader>
            <CardTitle className="text-destructive">프로젝트를 찾을 수 없어요</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/create')}>새로 만들기</Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const daysRemaining = calculateDaysRemaining(project.end_date)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-4"
      >
        {/* Project Info */}
        <Card className="border-0 shadow-lg bg-primary text-primary-foreground">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-bold">{project.name}</h1>
            <p className="text-primary-foreground/80 text-sm flex items-center justify-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              D-{daysRemaining > 0 ? daysRemaining : 0}
            </p>
          </CardContent>
        </Card>

        {/* Member Selection */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-center">누구세요?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.map((member, index) => (
              <motion.button
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectMember(member)}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{member.name}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.button>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
