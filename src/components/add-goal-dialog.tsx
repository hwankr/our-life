'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { GoalType } from "@/types";

interface AddGoalDialogProps {
  periodId: string;
  userId: string;
}

export function AddGoalDialog({ periodId, userId }: AddGoalDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [type, setType] = useState<GoalType>("ROUTINE");
  const [targetCount, setTargetCount] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [subcategories, setSubcategories] = useState("");
  const [unit, setUnit] = useState("회");

  const resetForm = () => {
    setTitle("");
    setType("ROUTINE");
    setTargetCount("");
    setMonthlyLimit("");
    setTargetValue("");
    setSubcategories("");
    setUnit("회");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      const goalData: Record<string, unknown> = {
        period_id: periodId,
        user_id: userId,
        title,
        type,
        unit,
      };

      if (type === 'ROUTINE') {
        goalData.target_count = parseInt(targetCount) || 1;
      } else if (type === 'LIMIT') {
        goalData.monthly_limit = parseInt(monthlyLimit) || 1;
      } else if (type === 'OBJECTIVE') {
        goalData.target_value = targetValue ? parseInt(targetValue) : null;
        goalData.subcategories = subcategories.trim() 
          ? subcategories.split(',').map(s => s.trim()).filter(Boolean)
          : null;
      }

      const { error } = await supabase
        .from('goals')
        .insert(goalData);

      if (error) throw error;

      toast.success("목표가 추가되었습니다!");
      resetForm();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("목표 추가 오류:", error);
      toast.error("목표 추가에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (t: GoalType) => {
    switch (t) {
      case 'ROUTINE': return '채우기 (ROUTINE)';
      case 'LIMIT': return '아껴쓰기 (LIMIT)';
      case 'OBJECTIVE': return '도달하기 (OBJECTIVE)';
    }
  };

  const getTypeDescription = (t: GoalType) => {
    switch (t) {
      case 'ROUTINE': return '예: 운동 72회 달성';
      case 'LIMIT': return '예: 배달음식 월 8회 이하';
      case 'OBJECTIVE': return '예: 토익 800점 달성';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">+ 목표 추가</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>새 목표 추가</DialogTitle>
            <DialogDescription>
              달성하고 싶은 목표를 설정하세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title">목표 제목</Label>
              <Input
                id="title"
                placeholder="예: 매일 운동하기"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* 타입 선택 */}
            <div className="space-y-2">
              <Label>목표 유형</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {getTypeLabel(type)}
                    <span>▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {(['ROUTINE', 'LIMIT', 'OBJECTIVE'] as GoalType[]).map((t) => (
                    <DropdownMenuItem key={t} onClick={() => setType(t)}>
                      <div>
                        <p className="font-medium">{getTypeLabel(t)}</p>
                        <p className="text-xs text-zinc-500">{getTypeDescription(t)}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* 타입별 추가 필드 */}
            {type === 'ROUTINE' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetCount">목표 횟수</Label>
                  <Input
                    id="targetCount"
                    type="number"
                    placeholder="72"
                    value={targetCount}
                    onChange={(e) => setTargetCount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">단위</Label>
                  <Input
                    id="unit"
                    placeholder="회"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
              </div>
            )}

            {type === 'LIMIT' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyLimit">월 제한</Label>
                  <Input
                    id="monthlyLimit"
                    type="number"
                    placeholder="8"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">단위</Label>
                  <Input
                    id="unit"
                    placeholder="회"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
              </div>
            )}

            {type === 'OBJECTIVE' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetValue">목표 점수 (선택)</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      placeholder="800"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">단위</Label>
                    <Input
                      id="unit"
                      placeholder="점"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategories">세부 카테고리 (선택)</Label>
                  <Input
                    id="subcategories"
                    placeholder="단어, 문법, 듣기"
                    value={subcategories}
                    onChange={(e) => setSubcategories(e.target.value)}
                  />
                  <p className="text-xs text-zinc-500">쉼표로 구분해서 입력하세요</p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
