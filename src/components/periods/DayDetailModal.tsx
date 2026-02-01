'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, BookOpen } from 'lucide-react';

interface DailyLogData {
  id: string;
  user_id: string;
  log_date: string;
  diary: string | null;
}

interface GoalLogData {
  id: string;
  daily_log_id: string;
  goal_id: string;
  count: number;
  memo: string | null;
}

interface GoalData {
  id: string;
  user_id: string;
  title: string;
  type: string;
}

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  participants: User[];
  dailyLogs: DailyLogData[];
  goalLogs: GoalLogData[];
  goals: GoalData[];
}

export function DayDetailModal({
  isOpen,
  onClose,
  date,
  participants,
  dailyLogs,
  goalLogs,
  goals,
}: DayDetailModalProps) {
  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
  };

  // 특정 daily_log_id에 해당하는 goal_logs 가져오기
  const getGoalLogsForDailyLog = (dailyLogId: string) => {
    return goalLogs.filter(gl => gl.daily_log_id === dailyLogId);
  };

  // goal_id로 goal 정보 가져오기
  const getGoalById = (goalId: string) => {
    return goals.find(g => g.id === goalId);
  };

  // 참여자 정보 가져오기
  const getParticipant = (userId: string) => {
    return participants.find(p => p.id === userId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📅 {formatDate(date)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {dailyLogs.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <p>이 날에는 기록이 없습니다.</p>
            </div>
          ) : (
            dailyLogs.map((log) => {
              const participant = getParticipant(log.user_id);
              const userGoalLogs = getGoalLogsForDailyLog(log.id);

              return (
                <div 
                  key={log.id} 
                  className="space-y-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
                >
                  {/* 참여자 정보 */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {participant?.name?.slice(0, 2) || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm">
                      {participant?.name || '알 수 없음'}
                    </span>
                  </div>

                  {/* 일기 내용 */}
                  {log.diary && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                        <BookOpen className="h-3.5 w-3.5" />
                        일기
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-zinc-900 rounded-lg p-3">
                        {log.diary}
                      </p>
                    </div>
                  )}

                  {/* 달성한 목표 */}
                  {userGoalLogs.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                        <Check className="h-3.5 w-3.5" />
                        달성한 목표
                      </div>
                      <div className="space-y-1.5">
                        {userGoalLogs.map((goalLog) => {
                          const goal = getGoalById(goalLog.goal_id);
                          return (
                            <div 
                              key={goalLog.id}
                              className="flex items-center gap-2 text-sm bg-white dark:bg-zinc-900 rounded-lg px-3 py-2"
                            >
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                goal?.type === 'ROUTINE' ? 'bg-blue-500' :
                                goal?.type === 'LIMIT' ? 'bg-orange-500' : 'bg-purple-500'
                              }`} />
                              <span className="text-zinc-700 dark:text-zinc-300">
                                {goal?.title || '알 수 없는 목표'}
                              </span>
                              {goalLog.count > 1 && (
                                <span className="text-xs text-zinc-500 ml-auto">
                                  ×{goalLog.count}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 기록은 있지만 일기도 목표도 없는 경우 */}
                  {!log.diary && userGoalLogs.length === 0 && (
                    <p className="text-sm text-zinc-400 italic">
                      상세 기록이 없습니다.
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
