"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  title: z.string().min(1, "목표 이름을 입력해주세요."),
  type: z.enum(["checkbox", "count", "progress"]),
  targetValue: z.string().min(1, "목표 수치는 1 이상이어야 합니다."),
  period: z.enum(["daily", "weekly", "one_off"]),
})

export function CreateGoalForm() {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "checkbox",
      targetValue: "1",
      period: "daily",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
    // TODO: Send to backend
    setOpen(false)
  }

  const type = watch("type")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> 새 목표 만들기
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새로운 목표 설정</DialogTitle>
          <DialogDescription>
            친구와 함께 도전할 새로운 목표를 만들어보세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">목표 이름</Label>
            <Input
              id="title"
              placeholder="예: 매일 물 2L 마시기"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type">유형</Label>
              <Select
                onValueChange={(val: any) => setValue("type", val)}
                defaultValue="checkbox"
              >
                <SelectTrigger>
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkbox">체크박스 (단순달성)</SelectItem>
                  <SelectItem value="count">횟수 (카운트)</SelectItem>
                  <SelectItem value="progress">진행률 (페이지 등)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="period">주기</Label>
              <Select
                onValueChange={(val: any) => setValue("period", val)}
                defaultValue="daily"
              >
                <SelectTrigger>
                  <SelectValue placeholder="주기 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">매일</SelectItem>
                  <SelectItem value="weekly">매주</SelectItem>
                  <SelectItem value="one_off">일회성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {type !== "checkbox" && (
            <div className="grid gap-2">
              <Label htmlFor="targetValue">목표 수치</Label>
              <Input
                id="targetValue"
                type="number"
                {...register("targetValue")}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit">만들기</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
