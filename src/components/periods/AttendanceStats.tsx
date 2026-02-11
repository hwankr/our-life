'use client';

import { useMemo } from 'react';
import { User, Period } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { getTodayString, getDaysBetween } from '@/lib/date-utils';

interface DailyLogData {
  id: string;
  user_id: string;
  log_date: string;
  diary: string | null;
}

interface AttendanceStatsProps {
  period: Period;
  participants: User[];
  dailyLogs: DailyLogData[];
}

const PARTICIPANT_COLORS = [
  { bg: 'bg-rose-500', text: 'text-rose-500', indicator: 'bg-gradient-to-r from-rose-500 to-rose-400' },
  { bg: 'bg-blue-500', text: 'text-blue-500', indicator: 'bg-gradient-to-r from-blue-500 to-blue-400' },
  { bg: 'bg-emerald-500', text: 'text-emerald-500', indicator: 'bg-gradient-to-r from-emerald-500 to-emerald-400' },
  { bg: 'bg-amber-500', text: 'text-amber-500', indicator: 'bg-gradient-to-r from-amber-500 to-amber-400' },
];

export function AttendanceStats({ period, participants, dailyLogs }: AttendanceStatsProps) {
  const today = getTodayString();

  const attendanceData = useMemo(() => {
    // Elapsed days: from period start to min(today, period end)
    // If period hasn't started yet, elapsed = 0
    const effectiveEnd = today < period.end_date ? today : period.end_date;
    const rawElapsed = getDaysBetween(period.start_date, effectiveEnd);
    // +1 to include both start and end date in the count
    const totalElapsedDays = rawElapsed < 0 ? 0 : rawElapsed + 1;

    return participants.map((participant) => {
      // Count unique dates where this user has a daily log within the period range
      const userLogs = dailyLogs.filter(
        (log) =>
          log.user_id === participant.id &&
          log.log_date >= period.start_date &&
          log.log_date <= period.end_date
      );
      const uniqueDates = new Set(userLogs.map((log) => log.log_date));
      const loggedDays = uniqueDates.size;

      const attendanceRate = totalElapsedDays > 0
        ? Math.round((loggedDays / totalElapsedDays) * 100)
        : 0;

      return {
        participant,
        loggedDays,
        totalElapsedDays,
        attendanceRate,
      };
    });
  }, [participants, dailyLogs, period, today]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
      {/* Gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500" />

      <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-5 mt-2">
        출석 현황
      </h3>

      <div className="space-y-4">
        {attendanceData.map((data, idx) => {
          const colors = PARTICIPANT_COLORS[idx % PARTICIPANT_COLORS.length];
          const rateLabel = data.totalElapsedDays === 0 ? '시작 전' : `${data.attendanceRate}%`;

          return (
            <div
              key={data.participant.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 transition-all hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-900 shadow-sm">
                  <AvatarImage src={data.participant.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-sm font-bold">
                    {data.participant.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${colors.bg} border-2 border-white dark:border-zinc-900`} />
              </div>

              {/* Info + Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {data.participant.name}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{data.loggedDays}</span>
                      /{data.totalElapsedDays}일
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      data.attendanceRate >= 80
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : data.attendanceRate >= 50
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {rateLabel}
                    </span>
                  </div>
                </div>
                <Progress
                  value={data.attendanceRate}
                  className="h-2 bg-zinc-200/60 dark:bg-zinc-700/40"
                  indicatorClassName={colors.indicator}
                />
              </div>
            </div>
          );
        })}

        {participants.length === 0 && (
          <div className="text-center py-6 text-sm text-zinc-400 italic">
            참여자가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
