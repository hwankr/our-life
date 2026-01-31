'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Goal, Period } from "@/types";
import { getMonthsBetween } from "@/lib/date-utils";

interface GoalCardProps {
  goal: Goal;
  period: Period;
  isEditable?: boolean;
}

export function GoalCard({ goal, period, isEditable }: GoalCardProps) {
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

  // 타입별 배지 색상
  const getBadgeVariant = () => {
    switch (goal.type) {
      case 'ROUTINE':
        return 'default';
      case 'LIMIT':
        return 'secondary';
      case 'OBJECTIVE':
        return 'outline';
      default:
        return 'default';
    }
  };

  // 타입별 라벨
  const getTypeLabel = () => {
    switch (goal.type) {
      case 'ROUTINE':
        return '채우기';
      case 'LIMIT':
        return '아껴쓰기';
      case 'OBJECTIVE':
        return '도달하기';
      default:
        return goal.type;
    }
  };

  // LIMIT 타입: 월별 그리드 렌더링
  const renderMonthlyGrid = () => {
    const months = getMonthsBetween(period.start_date, period.end_date);
    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    return (
      <div className="flex gap-1 mt-2">
        {months.map(({ year, month }) => {
          const key = `${year}-${String(month).padStart(2, '0')}`;
          const isPast = key < currentYearMonth;
          const isCurrent = key === currentYearMonth;
          
          // 임시: 실제로는 goal_logs에서 월별 사용량 계산 필요
          const isSuccess = isPast ? Math.random() > 0.3 : null;
          
          return (
            <div
              key={key}
              className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium
                ${isCurrent ? 'border-2 border-primary' : ''}
                ${isSuccess === true ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                ${isSuccess === false ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                ${isSuccess === null ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500' : ''}
              `}
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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{goal.title}</CardTitle>
            <Badge variant={getBadgeVariant()} className="mt-1">
              {getTypeLabel()}
            </Badge>
          </div>
          <div className="text-right text-sm">
            {goal.type === 'ROUTINE' && (
              <span className="font-medium">
                {goal.current_count || 0} / {goal.target_count}{goal.unit}
              </span>
            )}
            {goal.type === 'LIMIT' && (
              <span className="font-medium">
                월 {goal.monthly_limit}{goal.unit} 이하
              </span>
            )}
            {goal.type === 'OBJECTIVE' && (
              <span className={`font-medium ${goal.is_achieved ? 'text-green-600' : ''}`}>
                {goal.is_achieved ? '✅ 달성!' : `목표: ${goal.target_value}${goal.unit}`}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {goal.type === 'ROUTINE' && (
          <div>
            <Progress value={progress} className="h-2" />
            <p className="text-right text-xs text-zinc-500 mt-1">
              {Math.round(progress)}%
            </p>
          </div>
        )}
        
        {goal.type === 'LIMIT' && renderMonthlyGrid()}
        
        {goal.type === 'OBJECTIVE' && (
          <div>
            {goal.subcategories && goal.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {goal.subcategories.map((sub: string) => (
                  <Badge key={sub} variant="outline" className="text-xs">
                    {sub}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-zinc-500 mt-2">
              공부 기록을 쌓으며 목표를 향해 나아가세요!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
