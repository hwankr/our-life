'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Goal, DailyLog } from "@/types";

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

  const handleGoalCheck = (goalId: string, checked: boolean) => {
    setGoalChecks(prev => ({
      ...prev,
      [goalId]: { ...prev[goalId], checked }
    }));
  };

  const handleCountChange = (goalId: string, count: number) => {
    setGoalChecks(prev => ({
      ...prev,
      [goalId]: { ...prev[goalId], count: Math.max(1, count) }
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
      const supabase = createClient();

      // 1. DailyLog 생성 또는 업데이트
      let dailyLogId = existingLog?.id;

      if (existingLog) {
        await supabase
          .from('daily_logs')
          .update({ diary, updated_at: new Date().toISOString() })
          .eq('id', existingLog.id);
      } else {
        const { data: newLog, error } = await supabase
          .from('daily_logs')
          .insert({
            period_id: periodId,
            user_id: userId,
            log_date: date,
            diary,
          })
          .select()
          .single();

        if (error) throw error;
        dailyLogId = newLog.id;
      }

      // 2. 기존 goal_logs 삭제 (있는 경우)
      if (existingLog) {
        await supabase
          .from('goal_logs')
          .delete()
          .eq('daily_log_id', existingLog.id);
      }

      // 3. 체크된 목표들의 goal_logs 생성
      const checkedGoals = Object.entries(goalChecks)
        .filter(([, data]) => data.checked)
        .map(([goalId, data]) => ({
          daily_log_id: dailyLogId,
          goal_id: goalId,
          count: data.count,
          subcategory_data: data.subcategory_data || null,
          memo: data.memo || null,
        }));

      if (checkedGoals.length > 0) {
        const { error } = await supabase
          .from('goal_logs')
          .insert(checkedGoals);
        if (error) throw error;
      }

      toast.success(existingLog ? "기록이 수정되었습니다!" : "기록이 저장되었습니다!");
      router.push(`/periods/${periodId}/users/${userId}`);
      router.refresh();
    } catch (error) {
      console.error("저장 오류:", error);
      toast.error("저장에 실패했습니다");
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
          />
        </CardContent>
      </Card>

      {/* 목표 체크 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">목표 체크</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">
              등록된 목표가 없습니다
            </p>
          ) : (
            goals.map((goal) => {
              const check = goalChecks[goal.id];
              return (
                <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
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
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(goal.type)}
                        </Badge>
                        {goal.type === 'ROUTINE' && (
                          <span className="text-xs text-zinc-500">
                            현재: {goal.current_count || 0}/{goal.target_count}{goal.unit}
                          </span>
                        )}
                        {goal.type === 'LIMIT' && (
                          <span className="text-xs text-zinc-500">
                            월 {goal.monthly_limit}{goal.unit} 이하
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
                        min="1"
                        value={check.count}
                        onChange={(e) => handleCountChange(goal.id, parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <span className="text-sm text-zinc-500">{goal.unit}</span>
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
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 저장 버튼 */}
      <Button 
        className="w-full" 
        size="lg" 
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "저장 중..." : existingLog ? "수정하기" : "저장하기"}
      </Button>
    </div>
  );
}
