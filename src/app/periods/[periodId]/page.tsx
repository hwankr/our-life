import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatDateKorean, formatDDay, getDaysBetween, getTodayString } from "@/lib/date-utils";
import { User, Period, Goal, GoalLog } from "@/types";
import { calculateGoalProgress } from "@/lib/goal-calculator";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-layout";
import { EditPeriodDialog } from "@/components/periods/EditPeriodDialog";
import { PeriodCalendar } from "@/components/periods/PeriodCalendar";
import { AttendanceStats } from "@/components/periods/AttendanceStats";
import { CalendarDays, ArrowRight, ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";

interface PeriodPageProps {
  params: Promise<{ periodId: string }>;
}

export default async function PeriodPage({ params }: PeriodPageProps) {
  const { periodId } = await params;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/');
  }

  // 기간 정보 조회
  const { data: period } = await supabase
    .from('periods')
    .select('*')
    .eq('id', periodId)
    .single();

  if (!period) {
    notFound();
  }

  // 참여자 정보 조회
  const { data: participants } = await supabase
    .from('users')
    .select('*')
    .in('id', period.participant_ids);

  // 각 참여자의 목표 조회
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .eq('period_id', periodId);

  if (goalsError) {
    console.error('Failed to fetch goals:', goalsError);
  }

  // 일일 기록 조회 (캘린더용)
  const { data: dailyLogs, error: dailyLogsError } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('period_id', periodId);

  if (dailyLogsError) {
    console.error('Failed to fetch daily logs:', dailyLogsError);
  }

  // 목표 기록 조회 (캘린더용)
  const dailyLogIds = (dailyLogs || []).map(l => l.id);
  const { data: goalLogs } = dailyLogIds.length > 0
    ? await supabase
        .from('goal_logs')
        .select('*')
        .in('daily_log_id', dailyLogIds)
    : { data: [] };

  // logDateMap: daily_log_id -> log_date
  const logDateMap = new Map<string, string>();
  (dailyLogs || []).forEach(log => {
    logDateMap.set(log.id, log.log_date);
  });

  // goalLogs grouped by goal_id
  const goalLogsByGoalId: Record<string, GoalLog[]> = {};
  (goalLogs || []).forEach((gl: GoalLog) => {
    if (!goalLogsByGoalId[gl.goal_id]) goalLogsByGoalId[gl.goal_id] = [];
    goalLogsByGoalId[gl.goal_id].push(gl);
  });

  // 참여자별 목표 그룹화
  const goalsByUser = (goals || []).reduce((acc, goal) => {
    if (!acc[goal.user_id]) acc[goal.user_id] = [];
    acc[goal.user_id].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  // 전체 진행률 계산
  const totalDays = getDaysBetween(period.start_date, period.end_date);
  const today = getTodayString();
  const elapsedDays = getDaysBetween(period.start_date, today);
  const periodProgress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  const elapsedLabel =
    elapsedDays < 0 ? '시작 전' : elapsedDays === 0 ? '오늘 시작' : `${elapsedDays}일 지남`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-rose-500/20 selection:text-rose-600">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/app" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors p-2 -ml-2">
               <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold tracking-tight truncate max-w-[200px] sm:max-w-md">{period.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
               {formatDDay(period.end_date)}
            </span>
            <EditPeriodDialog period={period} />
            <span className="hidden sm:block"><ThemeToggle /></span>
            <UserMenu user={authUser} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-5xl py-8 space-y-10">
        <Breadcrumb items={[
          { label: '대시보드', href: '/app' },
          { label: period.title, href: `/periods/${periodId}` },
        ]} />

        {/* 기간 요약 및 진행률 */}
        <FadeIn>
           <section className="bg-gradient-to-br from-white to-rose-50/30 dark:from-zinc-900 dark:to-rose-950/10 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
              {/* Decorative background orbs */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl" />

              <div className="relative">
                 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                    <div>
                       <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">기간 진행률</h2>
                       <div className="flex items-center gap-3">
                          <CalendarDays className="h-6 w-6 text-rose-400" />
                          <span className="text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
                             {Math.round(periodProgress)}%
                          </span>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                          {formatDateKorean(period.start_date)} - {formatDateKorean(period.end_date)}
                       </p>
                       <p className="text-xs font-medium text-rose-500">
                          {elapsedLabel} / 총 {totalDays}일 여정
                       </p>
                    </div>
                 </div>

                 {/* Stat Pills */}
                 <div className="flex flex-wrap gap-2 mb-4">
                    <div className="px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
                       <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          경과 <span className="text-zinc-900 dark:text-zinc-100 font-bold">{Math.max(0, elapsedDays)}</span>일
                       </span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
                       <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          남은 <span className="text-zinc-900 dark:text-zinc-100 font-bold">{Math.max(0, totalDays - elapsedDays)}</span>일
                       </span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20">
                       <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                          완료율 <span className="font-bold">{Math.round(periodProgress)}%</span>
                       </span>
                    </div>
                 </div>

                 <Progress value={periodProgress} className="h-3" indicatorClassName="bg-gradient-to-r from-rose-500 to-orange-500" />
              </div>
           </section>
        </FadeIn>

        {/* 캘린더 */}
        <FadeIn delay={0.1}>
           <PeriodCalendar
             period={period}
             participants={participants || []}
             dailyLogs={dailyLogs || []}
             goalLogs={goalLogs || []}
             goals={goals || []}
             currentUserId={authUser.id}
           />
        </FadeIn>

        {/* 출석 현황 */}
        <FadeIn delay={0.15}>
          <AttendanceStats
            period={period}
            participants={participants || []}
            dailyLogs={dailyLogs || []}
          />
        </FadeIn>

        {/* 참여자 카드 목록 */}
        <StaggerContainer className="grid gap-6 md:grid-cols-2">
          {(participants || []).map((participant: User) => {
            const userGoals = goalsByUser[participant.id] || [];
            const completedGoals = userGoals.filter((g: Goal) => {
              if (g.type === 'ROUTINE') return (g.current_count || 0) >= (g.target_count || 1);
              if (g.type === 'OBJECTIVE') return g.is_achieved;
              return false;
            }).length;

            // 간단한 평균 달성률 계산
            const avgProgress = userGoals.length > 0
              ? userGoals.reduce((sum: number, g: Goal) => {
                  try {
                    const gLogs = goalLogsByGoalId[g.id] || [];
                    const progress = calculateGoalProgress(g, period, gLogs, logDateMap);
                    return sum + progress.progress_percent;
                  } catch {
                    return sum;
                  }
                }, 0) / userGoals.length
              : 0;

            // Achievement-based background tint
            const achievementTint = avgProgress > 70
              ? 'bg-gradient-to-br from-emerald-50/30 to-white dark:from-emerald-950/10 dark:to-zinc-900'
              : avgProgress > 40
              ? 'bg-gradient-to-br from-amber-50/30 to-white dark:from-amber-950/10 dark:to-zinc-900'
              : 'bg-gradient-to-br from-white to-zinc-50/30 dark:from-zinc-900 dark:to-zinc-950/10';

            // Colored ring for avatar based on achievement
            const ringColor = avgProgress > 70
              ? 'ring-emerald-500/40'
              : avgProgress > 40
              ? 'ring-amber-500/40'
              : 'ring-rose-500/40';

            return (
              <StaggerItem key={participant.id}>
                <Link href={`/periods/${periodId}/users/${participant.id}`} className="block h-full">
                  <Card className={`h-full hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-zinc-200 dark:border-zinc-800 backdrop-blur-sm group cursor-pointer overflow-hidden relative ${achievementTint}`}>
                     {/* Gradient border on hover */}
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                     {/* Decorative orb */}
                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors duration-500" />

                    <CardHeader className="pb-4 relative">
                      <div className="flex items-center gap-4">
                         <div className="relative">
                            <Avatar className={`h-16 w-16 border-4 border-white dark:border-zinc-950 shadow-md ring-4 ${ringColor} transition-all duration-300 group-hover:ring-8`}>
                              <AvatarImage src={participant.avatar_url || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 text-lg font-bold">{participant.name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            {/* Achievement indicator */}
                            {avgProgress > 70 && (
                              <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                         </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl font-bold truncate">{participant.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                             <span className="font-medium text-zinc-900 dark:text-zinc-100">{userGoals.length}</span>개의 목표 도전 중
                          </CardDescription>
                        </div>
                        <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* 전체 달성률 */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-zinc-600 dark:text-zinc-400 font-medium">전체 달성률</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">{Math.round(avgProgress)}%</span>
                        </div>
                        <Progress value={avgProgress} className="h-2.5 bg-zinc-100 dark:bg-zinc-800" indicatorClassName="bg-rose-500" />
                      </div>

                      <div className="space-y-3">
                         <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">주요 목표</p>
                         <div className="space-y-2">
                            {userGoals.slice(0, 3).map((goal: Goal) => (
                              <div key={goal.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 group-hover:bg-white dark:group-hover:bg-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-600 transition-all">
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                   <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                                      goal.type === 'ROUTINE' ? 'bg-blue-500' :
                                      goal.type === 'LIMIT' ? 'bg-orange-500' : 'bg-purple-500'
                                   }`} />
                                   <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">{goal.title}</span>
                                </div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2 whitespace-nowrap flex-shrink-0 font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700/50">
                                  {goal.type === 'ROUTINE' && `${Math.min(
                                    (goalLogsByGoalId[goal.id] || []).reduce((s: number, gl: GoalLog) => s + (gl.count || 0), 0),
                                    goal.target_count || 1
                                  )}/${goal.target_count || 1}`}
                                  {goal.type === 'LIMIT' && `D-${getDaysBetween(today, period.end_date)}`}
                                  {goal.type === 'OBJECTIVE' && (goal.is_achieved ? '✓ 달성' : '진행 중')}
                                </span>
                              </div>
                            ))}
                            {userGoals.length === 0 && (
                               <div className="text-center py-4 text-xs text-zinc-400 italic">등록된 목표가 없습니다</div>
                            )}
                         </div>
                         {userGoals.length > 3 && (
                            <p className="text-center text-xs text-zinc-400 pt-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                               +{userGoals.length - 3}개의 목표 더보기
                            </p>
                         )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </main>
    </div>
  );
}
