'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Goal, Period } from "@/types";
import { getMonthsBetween } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Target, TrendingUp, PiggyBank, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditGoalDialog } from "@/components/goals/EditGoalDialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface GoalCardProps {
  goal: Goal;
  period: Period;
  isEditable?: boolean;
}

export function GoalCard({ goal, period, isEditable }: GoalCardProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  // 타입별 진행률 계산
  const getProgress = () => {
    switch (goal.type) {
      case 'ROUTINE':
        const routineProgress = ((goal.current_count || 0) / (goal.target_count || 1)) * 100;
        return Math.min(routineProgress, 100);
      case 'OBJECTIVE':
        return goal.is_achieved ? 100 : 0;
      case 'LIMIT':
        return 50; // 임시 (실제로는 월별 성공률 계산 필요)
      default:
        return 0;
    }
  };

  const progress = getProgress();

  // 타입별 스타일 설정
  const getTypeStyle = () => {
    switch (goal.type) {
      case 'ROUTINE':
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          label: 'Habit',
          color: 'text-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-100 dark:border-blue-900',
        };
      case 'LIMIT':
        return {
          icon: <PiggyBank className="h-4 w-4" />,
          label: 'Limit',
          color: 'text-orange-500',
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-100 dark:border-orange-900',
        };
      case 'OBJECTIVE':
        return {
          icon: <Target className="h-4 w-4" />,
          label: 'Goal',
          color: 'text-purple-500',
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-100 dark:border-purple-900',
        };
      default:
        return {
          icon: <Target className="h-4 w-4" />,
          label: 'Goal',
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
      const supabase = createClient();
      const { error } = await supabase.from('goals').delete().eq('id', goal.id);
      if (error) throw error;
      toast.success("목표가 삭제되었습니다.");
      router.refresh();
    } catch (error) {
      toast.error("삭제에 실패했습니다.");
    }
  };

  // LIMIT 타입: 월별 그리드 렌더링
  const renderMonthlyGrid = () => {
    const months = getMonthsBetween(period.start_date, period.end_date);
    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    return (
      <div className="flex gap-1 mt-3 overflow-x-auto pb-1 scrollbar-hide">
        {months.map(({ year, month }) => {
          const key = `${year}-${String(month).padStart(2, '0')}`;
          const isPast = key < currentYearMonth;
          const isCurrent = key === currentYearMonth;
          
          // 임시: 실제로는 goal_logs에서 월별 사용량 계산 필요
          const isSuccess = isPast ? Math.random() > 0.3 : null;
          
          return (
            <div
              key={key}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all",
                isCurrent && "ring-2 ring-offset-2 ring-orange-500 dark:ring-offset-zinc-900",
                isSuccess === true && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                isSuccess === false && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
                isSuccess === null && "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
              )}
              title={`${year}년 ${month}월`}
            >
              {month}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Card className={cn(
         "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-zinc-900",
         "border-l-4",
         goal.type === 'ROUTINE' && "border-l-blue-500",
         goal.type === 'LIMIT' && "border-l-orange-500",
         goal.type === 'OBJECTIVE' && "border-l-purple-500",
      )}>
        <CardHeader className="pb-3 pt-4 px-5">
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
        
        <CardContent className="px-5 pb-5">
          {/* 상태 표시 */}
          <div className="mb-4 text-sm">
              {goal.type === 'ROUTINE' && (
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-zinc-500 dark:text-zinc-400">Current</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                       {goal.current_count || 0} <span className="text-zinc-400 text-sm font-normal">/ {goal.target_count}{goal.unit}</span>
                    </span>
                 </div>
              )}
              {goal.type === 'LIMIT' && (
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-zinc-500 dark:text-zinc-400">Monthly Limit</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                       {goal.monthly_limit}{goal.unit}
                    </span>
                 </div>
              )}
              {goal.type === 'OBJECTIVE' && (
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-zinc-500 dark:text-zinc-400">Target</span>
                    <span className={cn("font-semibold text-base", goal.is_achieved ? "text-emerald-500" : "text-zinc-900 dark:text-zinc-100")}>
                       {goal.is_achieved ? 'Achieved!' : `${goal.target_value}${goal.unit}`}
                    </span>
                 </div>
              )}
          </div>

          {/* 진행률 바 / 그리드 / 태그 */}
          <div>
             {goal.type === 'ROUTINE' && (
               <div className="relative pt-1">
                 <Progress value={progress} className="h-2.5 bg-zinc-100 dark:bg-zinc-800" />
               </div>
             )}
             
             {goal.type === 'LIMIT' && renderMonthlyGrid()}
             
             {goal.type === 'OBJECTIVE' && (
               <div className="space-y-3">
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
