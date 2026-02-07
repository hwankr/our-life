'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Goal, GoalCycle } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { updateGoal } from "@/app/actions/goal-actions";

interface EditGoalDialogProps {
  goal: Goal;
  trigger?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGoalDialog({ goal, open, onOpenChange }: EditGoalDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // 상태들
  const [title, setTitle] = useState(goal.title);
  const [targetCount, setTargetCount] = useState(goal.target_count?.toString() || "");
  const [monthlyLimit, setMonthlyLimit] = useState(goal.monthly_limit?.toString() || "");
  const [targetValue, setTargetValue] = useState(goal.target_value?.toString() || "");
  const [studyTarget, setStudyTarget] = useState(goal.study_target?.toString() || "");
  const [studyUnit, setStudyUnit] = useState(goal.study_unit || "분");
  const [unit, setUnit] = useState(goal.unit || "");
  const [subcategories, setSubcategories] = useState(goal.subcategories?.join(", ") || "");
  const [cycle, setCycle] = useState<GoalCycle>(goal.cycle || (goal.type === 'LIMIT' ? 'MONTHLY' : 'TOTAL'));
  const [limitValue, setLimitValue] = useState(goal.limit_value?.toString() || goal.monthly_limit?.toString() || "");

  useEffect(() => {
    if (open) {
      setTitle(goal.title);
      setTargetCount(goal.target_count?.toString() || "");
      setMonthlyLimit(goal.monthly_limit?.toString() || "");
      setTargetValue(goal.target_value?.toString() || "");
      setStudyTarget(goal.study_target?.toString() || "");
      setStudyUnit(goal.study_unit || "분");
      setUnit(goal.unit || "");
      setSubcategories(goal.subcategories?.join(", ") || "");
      setCycle(goal.cycle || (goal.type === 'LIMIT' ? 'MONTHLY' : 'TOTAL'));
      setLimitValue(goal.limit_value?.toString() || goal.monthly_limit?.toString() || "");
    }
  }, [open, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateGoal({
        goalId: goal.id,
        periodId: goal.period_id,
        title,
        unit,
        cycle,
        targetCount: goal.type === 'ROUTINE' ? parseInt(targetCount) : undefined,
        limitValue: goal.type === 'LIMIT' ? parseInt(limitValue) : (goal.type === 'ROUTINE' && cycle !== 'TOTAL' ? parseInt(targetCount) : undefined),
        monthlyLimit: goal.type === 'LIMIT' ? parseInt(limitValue) : undefined,
        targetValue: goal.type === 'OBJECTIVE' ? (targetValue.trim() === "" ? null : parseFloat(targetValue)) : undefined,
        studyTarget: goal.type === 'OBJECTIVE' ? (studyTarget.trim() === "" ? null : parseInt(studyTarget)) : undefined,
        studyUnit: goal.type === 'OBJECTIVE' ? (studyUnit.trim() === "" ? null : studyUnit.trim()) : undefined,
        subcategories: goal.type === 'OBJECTIVE' ? subcategories.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "수정에 실패했습니다.");
      }

      toast.success("목표가 수정되었습니다.");
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("목표 수정 오류:", error);
      toast.error(error.message || "수정에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>목표 수정</DialogTitle>
          <DialogDescription>
            목표의 세부 내용을 수정합니다. (타입은 변경할 수 없습니다)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="goal-title">제목</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="목표 제목"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-unit">단위</Label>
            <Input
              id="goal-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="예: 회, 시간, 권"
              required
            />
          </div>

          {goal.type === 'ROUTINE' && (
            <>
              <div className="space-y-2">
                <Label>반복 주기</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {cycle === 'TOTAL' ? '전체 기간' : cycle === 'WEEKLY' ? '주간' : '월간'}
                      <span>▼</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {(['TOTAL', 'WEEKLY', 'MONTHLY'] as GoalCycle[]).map((c) => (
                      <DropdownMenuItem key={c} onClick={() => setCycle(c)}>
                        {c === 'TOTAL' ? '전체 기간' : c === 'WEEKLY' ? '주간' : '월간'}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetCount">
                  {cycle === 'TOTAL' ? '목표 횟수 (총)' : cycle === 'WEEKLY' ? '주간 목표' : '월간 목표'}
                </Label>
                <Input
                  id="targetCount"
                  type="number"
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {goal.type === 'LIMIT' && (
            <>
              <div className="space-y-2">
                <Label>제한 주기</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {cycle === 'WEEKLY' ? '주간' : cycle === 'MONTHLY' ? '월간' : '전체 기간'}
                      <span>▼</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {(['WEEKLY', 'MONTHLY', 'TOTAL'] as GoalCycle[]).map((c) => (
                      <DropdownMenuItem key={c} onClick={() => setCycle(c)}>
                        {c === 'WEEKLY' ? '주간' : c === 'MONTHLY' ? '월간' : '전체 기간'}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <Label htmlFor="limitValue">
                  {cycle === 'WEEKLY' ? '주간 제한' : cycle === 'MONTHLY' ? '월간 제한' : '전체 제한'}
                </Label>
                <Input
                  id="limitValue"
                  type="number"
                  value={limitValue}
                  onChange={(e) => setLimitValue(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {goal.type === 'OBJECTIVE' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="targetValue">목표 수치</Label>
                <Input
                  id="targetValue"
                  type="number"
                  step="any"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studyTarget">공부 목표량 (선택)</Label>
                  <Input
                    id="studyTarget"
                    type="number"
                    min="1"
                    step="1"
                    value={studyTarget}
                    onChange={(e) => setStudyTarget(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studyUnit">공부 단위</Label>
                  <Input
                    id="studyUnit"
                    value={studyUnit}
                    onChange={(e) => setStudyUnit(e.target.value)}
                    placeholder="분"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategories">세부 카테고리 (쉼표로 구분)</Label>
                <Input
                  id="subcategories"
                  value={subcategories}
                  onChange={(e) => setSubcategories(e.target.value)}
                  placeholder="예: 국어, 수학, 영어"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "저장 중..." : "저장하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
