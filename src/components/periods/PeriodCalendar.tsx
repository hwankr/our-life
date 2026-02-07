'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, Period } from '@/types';
import { DayDetailModal } from './DayDetailModal';
import { formatDate, getTodayString } from '@/lib/date-utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

interface PeriodCalendarProps {
  period: Period;
  participants: User[];
  dailyLogs: DailyLogData[];
  goalLogs: GoalLogData[];
  goals: GoalData[];
  currentUserId: string;
}

const PARTICIPANT_COLORS = [
  'bg-rose-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
];

export function PeriodCalendar({
  period,
  participants,
  dailyLogs,
  goalLogs,
  goals,
  currentUserId
}: PeriodCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 현재 월의 날짜 계산
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startOffset = firstDay.getDay();
    const days: (Date | null)[] = [];
    
    // 이전 달 빈 칸
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    
    // 현재 달 날짜
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentDate]);

  // 날짜별 기록 매핑
  const logsByDate = useMemo(() => {
    const map: Record<string, { userId: string; log: DailyLogData }[]> = {};
    
    dailyLogs.forEach(log => {
      if (!map[log.log_date]) map[log.log_date] = [];
      map[log.log_date].push({ userId: log.user_id, log });
    });
    
    return map;
  }, [dailyLogs]);

  // 기간 범위 체크
  const isInPeriod = (date: Date) => {
    const dateStr = formatDate(date);
    return dateStr >= period.start_date && dateStr <= period.end_date;
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    if (!isInPeriod(date)) return;
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  // 이전/다음 달 이동
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 필터된 기록 가져오기
  const getFilteredLogs = (dateStr: string) => {
    const logs = logsByDate[dateStr] || [];
    if (selectedFilter) {
      return logs.filter(l => l.userId === selectedFilter);
    }
    return logs;
  };

  // 날짜별 상세 데이터 가져오기
  const getDateDetails = (dateStr: string) => {
    const logs = dailyLogs.filter(l => l.log_date === dateStr);
    if (selectedFilter) {
      return logs.filter(l => l.user_id === selectedFilter);
    }
    return logs;
  };

  // 모든 참여자가 기록했는지 확인
  const isAllLogged = (dateStr: string) => {
    const relevantParticipants = selectedFilter
      ? participants.filter(p => p.id === selectedFilter)
      : participants;
    return relevantParticipants.length > 0 && relevantParticipants.every(p => {
      return (logsByDate[dateStr] || []).some(l => l.userId === p.id);
    });
  };

  // 날짜별 요약 텍스트 생성
  const getDateSummary = (dateStr: string) => {
    const logs = logsByDate[dateStr] || [];
    if (logs.length === 0) return '기록 없음';

    return logs.map(l => {
      const participant = participants.find(p => p.id === l.userId);
      const userGoalLogs = goalLogs.filter(gl => gl.daily_log_id === l.log.id);
      const hasDiary = !!l.log.diary;
      const parts = [];
      if (hasDiary) parts.push('일기');
      if (userGoalLogs.length > 0) parts.push(`${userGoalLogs.length}개 목표`);
      return `${participant?.name || '?'}: ${parts.join(' + ') || '기록만'}`;
    }).join('\n');
  };

  const today = getTodayString();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
      {/* Gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500" />

      {/* 헤더: 필터 + 월 네비게이션 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-2">
        {/* 참여자 필터 */}
        <div className="flex gap-2 overflow-x-auto flex-nowrap pb-1">
          <Button
            variant={selectedFilter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter(null)}
            className={`text-xs rounded-full transition-all ${
              selectedFilter === null
                ? 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600'
                : ''
            }`}
          >
            전체
          </Button>
          {participants.map((p, idx) => (
            <Button
              key={p.id}
              variant={selectedFilter === p.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(p.id)}
              className={`text-xs gap-1.5 rounded-full transition-all ${
                selectedFilter === p.id
                  ? 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600'
                  : ''
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${PARTICIPANT_COLORS[idx % PARTICIPANT_COLORS.length]}`} />
              {p.name}
            </Button>
          ))}
        </div>

        {/* 월 네비게이션 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevMonth}
            className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-110 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold min-w-[100px] text-center px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-110 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 참여자 범례 */}
      <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4 flex-wrap">
        {participants
          .filter(p => !selectedFilter || p.id === selectedFilter)
          .map((p, idx) => {
            const colorIdx = participants.findIndex(pp => pp.id === p.id);
            return (
              <div key={p.id} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${PARTICIPANT_COLORS[colorIdx % PARTICIPANT_COLORS.length]}`} />
                <span className="font-medium">{p.name}</span>
              </div>
            );
          })
        }
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg p-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div
            key={day}
            className={`text-center text-xs font-bold py-2 ${
              idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {calendarDays.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const dateStr = formatDate(date);
          const isToday = dateStr === today;
          const inPeriod = isInPeriod(date);
          const logs = getFilteredLogs(dateStr);
          const dayOfWeek = date.getDay();
          const allLogged = inPeriod && isAllLogged(dateStr);
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          return (
            <TooltipProvider key={dateStr} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleDateClick(date)}
                    disabled={!inPeriod}
                    className={`
                      aspect-square rounded-lg p-0.5 sm:p-1 min-h-[44px] flex flex-col items-center justify-start gap-1
                      transition-all duration-200
                      ${inPeriod
                        ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105 cursor-pointer'
                        : 'opacity-30 cursor-not-allowed'
                      }
                      ${isToday ? 'ring-2 ring-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)] dark:shadow-[0_0_12px_rgba(244,63,94,0.4)]' : ''}
                      ${allLogged ? 'bg-emerald-50 dark:bg-emerald-900/20 relative' : ''}
                      ${isWeekend && inPeriod && !allLogged ? 'bg-zinc-50/50 dark:bg-zinc-800/20' : ''}
                    `}
                  >
                    {/* All logged checkmark */}
                    {allLogged && (
                      <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">✓</span>
                      </div>
                    )}

                    <span className={`text-xs sm:text-sm font-semibold ${
                      dayOfWeek === 0 ? 'text-rose-500' :
                      dayOfWeek === 6 ? 'text-blue-500' :
                      'text-zinc-700 dark:text-zinc-300'
                    }`}>
                      {date.getDate()}
                    </span>

                    {/* 기록 표시 점 */}
                    {logs.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {logs.slice(0, 2).map((l, i) => {
                          const participantIdx = participants.findIndex(p => p.id === l.userId);
                          return (
                            <span
                              key={i}
                              className={`w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full ${PARTICIPANT_COLORS[participantIdx % PARTICIPANT_COLORS.length]} shadow-sm`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                {inPeriod && logs.length > 0 && (
                  <TooltipContent className="hidden sm:block">
                    <p className="text-xs whitespace-pre-line">{getDateSummary(dateStr)}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* 상세 모달 */}
      {selectedDate && (
        <DayDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={selectedDate}
          participants={participants}
          dailyLogs={dailyLogs.filter(l => l.log_date === selectedDate)}
          goalLogs={goalLogs}
          goals={goals}
          periodId={period.id}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
