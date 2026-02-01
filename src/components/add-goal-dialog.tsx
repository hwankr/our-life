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
import { toast } from "sonner";
import { GoalType, GoalCycle } from "@/types";
import { addGoal } from "@/app/actions/goal-actions";

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
  const [cycle, setCycle] = useState<GoalCycle>("TOTAL");
  const [targetCount, setTargetCount] = useState("");
  const [limitValue, setLimitValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [subcategories, setSubcategories] = useState("");
  const [unit, setUnit] = useState("회");

  // 타입 변경 시 기본 주기 설정
  useEffect(() => {
    if (type === 'ROUTINE') {
      setCycle('TOTAL');
    } else if (type === 'LIMIT') {
      setCycle('MONTHLY');
    }
  }, [type]);

  const resetForm = () => {
    setTitle("");
    setType("ROUTINE");
    setCycle("TOTAL");
    setTargetCount("");
    setLimitValue("");
    setTargetValue("");
    setSubcategories("");
    setUnit("회");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await addGoal({
        periodId,
        userId,
        title,
        type,
        unit,
        cycle,
        targetCount: targetCount ? parseInt(targetCount) : undefined,
        limitValue: limitValue ? parseInt(limitValue) : undefined,
        targetValue: targetValue.trim() !== "" ? parseFloat(targetValue) : undefined,
        subcategories: subcategories.trim() 
          ? subcategories.split(',').map(s => s.trim()).filter(Boolean)
          : undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "목표 추가에 실패했습니다");
      }

      toast.success("목표가 추가되었습니다!");
      resetForm();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("목표 추가 오류:", error);
      toast.error(error.message || "목표 추가에 실패했습니다");
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
      case 'ROUTINE': return '예: 운동 72회 달성 또는 주 3회';
      case 'LIMIT': return '예: 배달음식 주/월 N회 이하';
      case 'OBJECTIVE': return '예: 토익 800점 달성';
    }
  };

  const getCycleLabel = (c: GoalCycle) => {
    switch (c) {
      case 'TOTAL': return '전체 기간';
      case 'WEEKLY': return '주간';
      case 'MONTHLY': return '월간';
    }
  };

  const getCycleDescription = (c: GoalCycle) => {
    switch (c) {
      case 'TOTAL': return '설정 기간 동안 총 N회';
      case 'WEEKLY': return '매주 N회 반복';
      case 'MONTHLY': return '매월 N회 반복';
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

            {/* 채우기(ROUTINE) 전용 필드 */}
            {type === 'ROUTINE' && (
              <>
                {/* 주기 선택 */}
                <div className="space-y-2">
                  <Label>반복 주기</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {getCycleLabel(cycle)}
                        <span>▼</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {(['TOTAL', 'WEEKLY', 'MONTHLY'] as GoalCycle[]).map((c) => (
                        <DropdownMenuItem key={c} onClick={() => setCycle(c)}>
                          <div>
                            <p className="font-medium">{getCycleLabel(c)}</p>
                            <p className="text-xs text-zinc-500">{getCycleDescription(c)}</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetCount">
                      {cycle === 'TOTAL' ? '목표 횟수' : cycle === 'WEEKLY' ? '주간 목표' : '월간 목표'}
                    </Label>
                    <Input
                      id="targetCount"
                      type="number"
                      placeholder={cycle === 'TOTAL' ? '72' : cycle === 'WEEKLY' ? '3' : '12'}
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
              </>
            )}

            {/* 아껴쓰기(LIMIT) 전용 필드 */}
            {type === 'LIMIT' && (
              <>
                {/* 주기 선택 */}
                <div className="space-y-2">
                  <Label>제한 주기</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {getCycleLabel(cycle)}
                        <span>▼</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                    {(['WEEKLY', 'MONTHLY', 'TOTAL'] as GoalCycle[]).map((c) => (
                        <DropdownMenuItem key={c} onClick={() => setCycle(c)}>
                          <div>
                            <p className="font-medium">{getCycleLabel(c)}</p>
                            <p className="text-xs text-zinc-500">
                              {c === 'WEEKLY' ? '매주 N회 이하' : c === 'MONTHLY' ? '매월 N회 이하' : '기간 내 총 N회 이하'}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="limitValue">
                      {cycle === 'WEEKLY' ? '주간 제한' : cycle === 'MONTHLY' ? '월간 제한' : '전체 제한'}
                    </Label>
                    <Input
                      id="limitValue"
                      type="number"
                      placeholder={cycle === 'WEEKLY' ? '2' : '8'}
                      value={limitValue}
                      onChange={(e) => setLimitValue(e.target.value)}
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
              </>
            )}

            {/* 도달하기(OBJECTIVE) 전용 필드 */}
            {type === 'OBJECTIVE' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetValue">목표 점수 (선택)</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      step="any"
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
