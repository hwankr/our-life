'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, Period } from '@/types';
import { DayDetailModal } from './DayDetailModal';

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
}

const PARTICIPANT_COLORS = [
  'bg-rose-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
];

// 로컬 타임존 기준 날짜 포맷 (YYYY-MM-DD)
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function PeriodCalendar({ 
  period, 
  participants, 
  dailyLogs, 
  goalLogs, 
  goals 
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
    const dateStr = formatLocalDate(date);
    return dateStr >= period.start_date && dateStr <= period.end_date;
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    if (!isInPeriod(date)) return;
    const dateStr = formatLocalDate(date);
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

  const today = formatLocalDate(new Date());

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
      {/* 헤더: 필터 + 월 네비게이션 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* 참여자 필터 */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedFilter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter(null)}
            className="text-xs"
          >
            전체
          </Button>
          {participants.map((p, idx) => (
            <Button
              key={p.id}
              variant={selectedFilter === p.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(p.id)}
              className="text-xs gap-1"
            >
              <span className={`w-2 h-2 rounded-full ${PARTICIPANT_COLORS[idx % PARTICIPANT_COLORS.length]}`} />
              {p.name}
            </Button>
          ))}
        </div>

        {/* 월 네비게이션 */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[100px] text-center">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </span>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div 
            key={day} 
            className={`text-center text-xs font-medium py-2 ${
              idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-zinc-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const dateStr = formatLocalDate(date);
          const isToday = dateStr === today;
          const inPeriod = isInPeriod(date);
          const logs = getFilteredLogs(dateStr);
          const dayOfWeek = date.getDay();

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              disabled={!inPeriod}
              className={`
                aspect-square rounded-lg p-1 flex flex-col items-center justify-start gap-1
                transition-all duration-200
                ${inPeriod 
                  ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer' 
                  : 'opacity-30 cursor-not-allowed'
                }
                ${isToday ? 'ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-zinc-900' : ''}
              `}
            >
              <span className={`text-sm font-medium ${
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
                        className={`w-1.5 h-1.5 rounded-full ${PARTICIPANT_COLORS[participantIdx % PARTICIPANT_COLORS.length]}`} 
                      />
                    );
                  })}
                </div>
              )}
            </button>
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
          dailyLogs={getDateDetails(selectedDate)}
          goalLogs={goalLogs}
          goals={goals}
        />
      )}
    </div>
  );
}
