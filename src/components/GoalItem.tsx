"use client"

import { useState } from "react"
import confetti from "canvas-confetti"
import { Check, Flame } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface GoalItemProps {
  title: string
  type: "checkbox" | "count" | "progress"
  period: "daily" | "weekly" | "one_off"
  targetValue: number
  initialValue?: number
  streak?: number
}

export function GoalItem({
  title,
  type,
  period,
  targetValue,
  initialValue = 0,
  streak = 0,
}: GoalItemProps) {
  const [currentValue, setCurrentValue] = useState(initialValue)
  const isCompleted = currentValue >= targetValue

  const handleIncrement = () => {
    if (isCompleted) return

    const newValue = currentValue + 1
    setCurrentValue(newValue)

    if (newValue >= targetValue) {
      triggerConfetti()
    }
  }

  const handleCheckboxChange = () => {
    if (isCompleted) {
      setCurrentValue(0)
    } else {
      setCurrentValue(targetValue)
      triggerConfetti()
    }
  }

  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000 // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"]

    const frame = () => {
      if (Date.now() > end) return

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      })

      requestAnimationFrame(frame)
    }

    frame()
  }

  return (
    <Card className={cn("transition-all", isCompleted && "border-primary/50 bg-primary/5")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription className="text-xs">
            {period === "daily" ? "매일" : period === "weekly" ? "매주" : "목표"} • {type === "checkbox" ? "체크박스" : type === "count" ? "횟수" : "진행률"}
          </CardDescription>
        </div>
        {streak > 0 && (
          <div className="flex items-center text-xs font-medium text-orange-500">
            <Flame className="mr-1 h-3 w-3 fill-orange-500" />
            {streak}일 연속
          </div>
        )}
      </CardHeader>
      <CardContent>
        {type === "checkbox" ? (
          <Button
             variant={isCompleted ? "default" : "outline"}
             className={cn("w-full justify-start", isCompleted && "bg-primary hover:bg-primary/90")}
             onClick={handleCheckboxChange}
          >
            <Check className={cn("mr-2 h-4 w-4", isCompleted ? "opacity-100" : "opacity-0")} />
            {isCompleted ? "완료함!" : "오늘 완료하기"}
          </Button>
        ) : (
          <div className="space-y-2">
             <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">진행 상황</span>
                <span className="font-medium">
                  {currentValue} / {targetValue}
                </span>
             </div>
             <Progress value={(currentValue / targetValue) * 100} className="h-2" />
             <div className="flex justify-end pt-2">
                 <Button size="sm" onClick={handleIncrement} disabled={isCompleted}>
                    + 1 기록
                 </Button>
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
