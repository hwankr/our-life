'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Goal, Period, GoalLog, GoalProgress } from "@/types";
import { getTodayString } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { calculateGoalProgress } from "@/lib/goal-calculator";
import { Target, TrendingUp, PiggyBank, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditGoalDialog } from "@/components/goals/EditGoalDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteGoal } from "@/app/actions/goal-actions";

interface GoalCardProps {
  goal: Goal;
  period: Period;
  isEditable?: boolean;
  goalLogs?: GoalLog[];
  logDateMap?: Record<string, string>;
}

export function GoalCard({ goal, period, isEditable, goalLogs, logDateMap }: GoalCardProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  // Convert Record to Map for calculator compatibility
  const logDateMapObj = new Map(Object.entries(logDateMap || {}));

  // Calculate real progress from goal_logs
  const calculatedProgress: GoalProgress | null = (() => {
    try {
      return calculateGoalProgress(goal, period, goalLogs, logDateMapObj);
    } catch {
      return null;
    }
  })();

  const progress = calculatedProgress?.progress_percent ?? 0;
  const studyTarget = goal.study_target || 0;
  const studyCurrent = calculatedProgress?.current_value ?? (goal.current_count || 0);
  const studyUnit = goal.study_unit || '분';
  const studyDayCount = goal.study_day_count || 0;
  const hasStudyTarget = studyTarget > 0;
  const resultLabel =
    goal.target_value !== null && goal.target_value !== undefined
      ? `${goal.target_value}${goal.unit}`
      : '목표 없음';

  // 타입별 스타일 설정
  const getTypeStyle = () => {
    switch (goal.type) {
      case 'ROUTINE':
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          label: '채우기',
          color: 'text-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-100 dark:border-blue-900',
        };
      case 'LIMIT':
        return {
          icon: <PiggyBank className="h-4 w-4" />,
          label: '아껴쓰기',
          color: 'text-orange-500',
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-100 dark:border-orange-900',
        };
      case 'OBJECTIVE':
        return {
          icon: <Target className="h-4 w-4" />,
          label: '도달하기',
          color: 'text-purple-500',
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-100 dark:border-purple-900',
        };
      default:
        return {
          icon: <Target className="h-4 w-4" />,
          label: '목표',
          color: 'text-zinc-500',
          bg: 'bg-zinc-50 dark:bg-zinc-900',
          border: 'border-zinc-200 dark:border-zinc-800',
        };
    }
  };

  const style = getTypeStyle();

  const handleDelete = async () => {
    if (!confirm("정말 이 목표를 삭제하시겠습니까?")) return;

    try {
      const result = await deleteGoal(goal.id, period.id, goal.user_id);
      if (!result.success) {
        throw new Error(result.error || "삭제에 실패했습니다.");
      }
      toast.success("목표가 삭제되었습니다.");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "삭제에 실패했습니다.");
    }
  };

  return (
    <>
      <Card className={cn(
         "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-zinc-900",
         "border-l-4 h-full flex flex-col w-full min-w-0",
         goal.type === 'ROUTINE' && "border-l-blue-500",
         goal.type === 'LIMIT' && "border-l-orange-500",
         goal.type === 'OBJECTIVE' && "border-l-purple-500",
      )}>
        <CardHeader className="pb-3 pt-3 sm:pt-4 px-4 sm:px-5">
          <div className="flex items-start justify-between mb-1">
             <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium mb-2", style.bg, style.color)}>
                {style.icon}
                {style.label}
             </div>
             {isEditable && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                       <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                      <Pencil className="mr-2 h-4 w-4" /> 수정하기
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-rose-600 focus:text-rose-600">
                      <Trash2 className="mr-2 h-4 w-4" /> 삭제하기
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
             )}
          </div>
          <CardTitle className="text-lg font-bold leading-tight">{goal.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5 flex-1 flex flex-col">
          {/* 상태 표시 */}
          <div className="mb-4 text-sm">
              {goal.type === 'ROUTINE' && (
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-zinc-500 dark:text-zinc-400">현재</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                       {calculatedProgress?.current_value ?? (goal.current_count || 0)} <span className="text-zinc-400 text-sm font-normal">/ {calculatedProgress?.target_value ?? goal.target_count}{goal.unit}</span>
                    </span>
                 </div>
              )}
              {goal.type === 'LIMIT' && (
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-zinc-500 dark:text-zinc-400">
                        {parseInt(getTodayString().slice(5, 7))}월 {goal.cycle === 'WEEKLY' ? '주간' : '월간'} 현황
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                       {calculatedProgress?.current_value ?? (goal.current_count || 0)}
                       <span className="text-zinc-400 text-sm font-normal">
                          {' '}/ {goal.limit_value || goal.monthly_limit}{goal.unit}
                          {/* 남은 횟수 표시 */}
                          <span className="ml-1.5 text-xs text-zinc-500">
                             ({Math.max(0, (goal.limit_value || goal.monthly_limit || 0) - (calculatedProgress?.current_value ?? (goal.current_count || 0)))}회 남음)
                          </span>
                       </span>
                    </span>
                 </div>
              )}
              {goal.type === 'OBJECTIVE' && (
                 <>
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-zinc-500 dark:text-zinc-400">결과 목표</span>
                      <span className={cn("font-semibold text-base", goal.is_achieved ? "text-emerald-500" : "text-zinc-900 dark:text-zinc-100")}>
                         {goal.is_achieved ? '달성!' : resultLabel}
                      </span>
                   </div>
                   <div className="flex justify-between items-end">
                      <span className="text-zinc-500 dark:text-zinc-400">공부 누적</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                         {studyCurrent}{studyUnit}
                         {hasStudyTarget && (
                           <span className="text-zinc-400 text-sm font-normal">
                             {' '}/ {studyTarget}{studyUnit}
                           </span>
                         )}
                      </span>
                   </div>
                   <div className="flex justify-between items-end mt-1">
                      <span className="text-zinc-400 text-xs">공부 일수</span>
                      <span className="text-zinc-500 text-xs">{studyDayCount}일</span>
                   </div>
                 </>
              )}
          </div>

          {/* 진행률 바 / 그리드 / 태그 */}
          <div className="mt-auto">
             {goal.type === 'ROUTINE' && (
               <div className="relative pt-1">
                 <Progress value={progress} className="h-2.5 bg-blue-100 dark:bg-blue-900/20" indicatorClassName="bg-blue-500" />
               </div>
             )}
             
             {goal.type === 'LIMIT' && (
               <div className="relative pt-1">
                  {(goal.limit_value || goal.monthly_limit || 0) <= 20 ? (
                    /* Segmented Bar (<= 20) */
                    <div className="flex gap-0.5 w-full">
                       {Array.from({ length: (goal.limit_value || goal.monthly_limit || 1) }).map((_, i) => {
                          const limit = goal.limit_value || goal.monthly_limit || 1;
                          const current = calculatedProgress?.current_value ?? (goal.current_count || 0);
                          const isFilled = i < current;
                          const isExceeded = current > limit;

                          return (
                             <div
                                key={i}
                                className={cn(
                                   "h-2.5 flex-1 rounded-sm transition-all duration-300",
                                   isFilled
                                     ? (isExceeded ? "bg-rose-500" : "bg-orange-500")
                                     : "bg-orange-100 dark:bg-orange-900/20"
                                )}
                             />
                          );
                       })}
                    </div>
                  ) : (
                    /* Continuous Bar (> 20) */
                    <div className="h-2.5 w-full bg-orange-100 dark:bg-orange-900/20 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-500",
                          (calculatedProgress?.current_value ?? (goal.current_count || 0)) > (goal.limit_value || goal.monthly_limit || 0)
                            ? "bg-rose-500"
                            : "bg-orange-500"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
               </div>
             )}
             
             {goal.type === 'OBJECTIVE' && (
               <div className="space-y-3">
                 {hasStudyTarget && (
                   <div className="relative pt-1">
                     <Progress value={progress} className="h-2.5 bg-purple-100 dark:bg-purple-900/20" indicatorClassName="bg-purple-500" />
                   </div>
                 )}
                 {goal.subcategories && goal.subcategories.length > 0 ? (
                   <div className="flex flex-wrap gap-1.5">
                     {goal.subcategories.map((sub: string) => (
                       <Badge key={sub} variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-none font-normal">
                         {sub}
                       </Badge>
                     ))}
                   </div>
                 ) : (
                    <p className="text-sm text-zinc-400 italic">세부 목표가 없습니다</p>
                 )}
               </div>
             )}
          </div>
        </CardContent>
      </Card>

      <EditGoalDialog 
        goal={goal} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
      />
    </>
  );
}
