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
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Goal } from "@/types";
import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [unit, setUnit] = useState(goal.unit || "");
  const [subcategories, setSubcategories] = useState(goal.subcategories?.join(", ") || "");

  useEffect(() => {
    if (open) {
      setTitle(goal.title);
      setTargetCount(goal.target_count?.toString() || "");
      setMonthlyLimit(goal.monthly_limit?.toString() || "");
      setTargetValue(goal.target_value?.toString() || "");
      setUnit(goal.unit || "");
      setSubcategories(goal.subcategories?.join(", ") || "");
    }
  }, [open, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      
      const updateData: any = {
        title,
        unit,
      };

      if (goal.type === 'ROUTINE') {
        updateData.target_count = parseInt(targetCount);
      } else if (goal.type === 'LIMIT') {
        updateData.monthly_limit = parseInt(monthlyLimit);
      } else if (goal.type === 'OBJECTIVE') {
        updateData.target_value = parseInt(targetValue);
        updateData.subcategories = subcategories.split(',').map(s => s.trim()).filter(Boolean);
      }

      const { error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', goal.id);

      if (error) throw error;

      toast.success("목표가 수정되었습니다.");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("목표 수정 오류:", error);
      toast.error("수정에 실패했습니다.");
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
            <div className="space-y-2">
              <Label htmlFor="targetCount">목표 횟수 (총)</Label>
              <Input
                id="targetCount"
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                required
              />
            </div>
          )}

          {goal.type === 'LIMIT' && (
            <div className="space-y-2">
              <Label htmlFor="monthlyLimit">월 제한</Label>
              <Input
                id="monthlyLimit"
                type="number"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                required
              />
            </div>
          )}

          {goal.type === 'OBJECTIVE' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="targetValue">목표 수치</Label>
                <Input
                  id="targetValue"
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  required
                />
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
