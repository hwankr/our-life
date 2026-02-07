'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Goal, DailyLog } from "@/types";
import { saveDailyLog } from "@/app/actions/daily-log-actions";
import { cn } from "@/lib/utils";
import { useNavigationBlocker } from "@/components/navigation-blocker";
import { Target } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-layout";

interface DailyLogFormProps {
  periodId: string;
  userId: string;
  date: string;
  goals: Goal[];
  existingLog?: DailyLog | null;
  existingGoalLogs?: {
    goal_id: string;
    count: number;
    subcategory_data: Record<string, boolean> | null;
    memo: string | null;
  }[];
}

export function DailyLogForm({
  periodId,
  userId,
  date,
  goals,
  existingLog,
  existingGoalLogs = [],
}: DailyLogFormProps) {
  const router = useRouter();
  const { setBlocked } = useNavigationBlocker();
  const [isLoading, setIsLoading] = useState(false);
  const [diary, setDiary] = useState(existingLog?.diary || "");

  // 목표별 체크 상태
  const [goalChecks, setGoalChecks] = useState<Record<string, {
    checked: boolean;
    count: number;
    subcategory_data?: Record<string, boolean>;
    memo?: string;
  }>>(() => {
    const initial: Record<string, { checked: boolean; count: number; subcategory_data?: Record<string, boolean>; memo?: string }> = {};

    goals.forEach(goal => {
      const existingGoalLog = existingGoalLogs.find(gl => gl.goal_id === goal.id);
      if (existingGoalLog) {
        initial[goal.id] = {
          checked: true,
          count: existingGoalLog.count,
          subcategory_data: existingGoalLog.subcategory_data || undefined,
          memo: existingGoalLog.memo || undefined,
        };
      } else {
        initial[goal.id] = {
          checked: false,
          count: 1,
          subcategory_data: goal.subcategories
            ? Object.fromEntries(goal.subcategories.map(s => [s, false]))
            : undefined,
        };
      }
    });

    return initial;
  });

  // Track dirty state for unsaved changes warning
  useEffect(() => {
    const isDirty = diary !== (existingLog?.diary || "") ||
      Object.entries(goalChecks).some(([goalId, data]) => {
        const existing = existingGoalLogs.find(gl => gl.goal_id === goalId);
        if (data.checked && !existing) return true;
        if (!data.checked && existing) return true;
        if (data.checked && existing && data.count !== existing.count) return true;
        return false;
      });
    setBlocked(isDirty);
    return () => setBlocked(false);
  }, [diary, goalChecks, existingLog, existingGoalLogs, setBlocked]);

  const handleGoalCheck = (goalId: string, checked: boolean) => {
    setGoalChecks(prev => ({
      ...prev,
      [goalId]: { ...prev[goalId], checked }
    }));
  };

  const handleCountChange = (goalId: string, count: number) => {
    setGoalChecks(prev => ({
      ...prev,
      [goalId]: { ...prev[goalId], count: Math.max(0, count) }
    }));
  };

  const handleSubcategoryChange = (goalId: string, subcategory: string, checked: boolean) => {
    setGoalChecks(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        subcategory_data: {
          ...prev[goalId].subcategory_data,
          [subcategory]: checked
        }
      }
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const checkedGoals = Object.entries(goalChecks)
        .filter(([, data]) => data.checked)
        .map(([goalId, data]) => ({
          goal_id: goalId,
          count: data.count,
          subcategory_data: data.subcategory_data || null,
          memo: data.memo || null,
        }));

      const result = await saveDailyLog({
        periodId,
        userId,
        date,
        diary,
        goalLogs: checkedGoals,
        existingLogId: existingLog?.id,
      });

      if (!result.success) {
        throw new Error(result.error || "저장에 실패했습니다");
      }

      toast.success(existingLog ? "기록이 수정되었습니다!" : "기록이 저장되었습니다!");
      setBlocked(false);
      router.push(`/periods/${periodId}/users/${userId}`);
      router.refresh();
    } catch (error: any) {
      console.error("저장 오류:", error);
      toast.error(error.message || "저장에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ROUTINE': return '채우기';
      case 'LIMIT': return '아껴쓰기';
      case 'OBJECTIVE': return '도달하기';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* 일기 작성 */}
      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">오늘의 일기</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="오늘 하루는 어땠나요?"
              value={diary}
              onChange={(e) => setDiary(e.target.value)}
              rows={5}
              className="resize-none"
              maxLength={2000}
            />
            <p className={cn(
              "text-xs text-right mt-1",
              diary.length > 1000 ? "text-rose-500" : diary.length > 500 ? "text-amber-500" : "text-zinc-400"
            )}>
              {diary.length}자{diary.length > 1000 ? " (권장 1000자 이내)" : ""}
            </p>
          </CardContent>
        </Card>
      </FadeIn>

      {/* 목표 체크 */}
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">목표 체크</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-full mb-3">
                  <Target className="h-5 w-5 text-zinc-400" />
                </div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">등록된 목표가 없습니다</p>
                <p className="text-xs text-zinc-400">목표를 먼저 추가한 후 기록을 작성하세요</p>
              </div>
            ) : (
              <StaggerContainer className="space-y-4">
                {goals.map((goal) => {
              const check = goalChecks[goal.id];
              return (
                <StaggerItem key={goal.id}>
                  <div className={cn(
                    "rounded-lg p-3 sm:p-4 space-y-3 transition-all duration-200",
                    check?.checked ? [
                      "border-l-4 border border-l-current bg-opacity-50",
                      goal.type === 'ROUTINE' && "border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800",
                      goal.type === 'LIMIT' && "border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800",
                      goal.type === 'OBJECTIVE' && "border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800",
                    ] : "border border-zinc-200 dark:border-zinc-800 opacity-70"
                  )}>
                    <div className="flex items-start gap-3 min-h-[44px]">
                    <Checkbox
                      id={goal.id}
                      checked={check?.checked || false}
                      onCheckedChange={(checked) => handleGoalCheck(goal.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={goal.id} className="text-base cursor-pointer">
                        {goal.title}
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          check?.checked && goal.type === 'ROUTINE' && "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
                          check?.checked && goal.type === 'LIMIT' && "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
                          check?.checked && goal.type === 'OBJECTIVE' && "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
                        )}>
                          {getTypeLabel(goal.type)}
                        </Badge>
                        {goal.type === 'ROUTINE' && (
                          <span className="text-xs text-zinc-500">
                            현재: {goal.current_count || 0}/{goal.target_count}{goal.unit}
                          </span>
                        )}
                        {goal.type === 'LIMIT' && (
                          <span className="text-xs text-zinc-500">
                            {goal.cycle === 'WEEKLY' ? '주' : goal.cycle === 'TOTAL' ? '전체' : '월'} {goal.limit_value || goal.monthly_limit}{goal.unit} 이하
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* LIMIT 타입: 횟수 입력 */}
                  {check?.checked && goal.type === 'LIMIT' && (
                    <div className="ml-7 flex items-center gap-2">
                      <Label className="text-sm">오늘 사용 횟수:</Label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={check.count}
                        onChange={(e) => handleCountChange(goal.id, parseFloat(e.target.value) || 0)}
                        className="w-24 sm:w-20 text-base"
                      />
                      <span className="text-sm text-zinc-500">{goal.unit}</span>
                    </div>
                  )}

                  {/* OBJECTIVE 타입: 공부량 입력 */}
                  {check?.checked && goal.type === 'OBJECTIVE' && (
                    <div className="ml-7 flex items-center gap-2">
                      <Label className="text-sm">오늘 공부량:</Label>
                      <Input
                        type="number"
                        min="1"
                        step="any"
                        value={check.count}
                        onChange={(e) => handleCountChange(goal.id, parseFloat(e.target.value) || 1)}
                        className="w-24 sm:w-20 text-base"
                      />
                      <span className="text-sm text-zinc-500">{goal.study_unit || '분'}</span>
                    </div>
                  )}

                  {/* OBJECTIVE 타입: 세부 카테고리 */}
                  {check?.checked && goal.type === 'OBJECTIVE' && goal.subcategories && (
                    <div className="ml-7 flex flex-wrap gap-2">
                      {goal.subcategories.map((sub) => (
                        <label key={sub} className="flex items-center gap-1 text-sm cursor-pointer">
                          <Checkbox
                            checked={check.subcategory_data?.[sub] || false}
                            onCheckedChange={(checked) => 
                              handleSubcategoryChange(goal.id, sub, checked as boolean)
                            }
                          />
                          {sub}
                        </label>
                      ))}
                    </div>
                  )}
                  </div>
                </StaggerItem>
              );
            })}
              </StaggerContainer>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* 저장 버튼 */}
      <FadeIn delay={0.2}>
        <div className="sticky bottom-0 bg-zinc-50 dark:bg-zinc-950 pt-2 pb-6">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-2">
            {Object.values(goalChecks).filter(g => g.checked).length}개 목표 체크됨
          </p>
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white border-none shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "저장 중..." : existingLog ? "수정하기" : "저장하기"}
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
