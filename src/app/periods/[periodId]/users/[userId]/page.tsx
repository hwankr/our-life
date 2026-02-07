import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateKorean, getTodayString } from "@/lib/date-utils";
import { Goal, DailyLog, GoalLog } from "@/types";
import { GoalCard } from "@/components/goal-card";
import { AddGoalDialog } from "@/components/add-goal-dialog";
import { RefreshButton } from "@/components/refresh-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-layout";
import { ArrowLeft, PenLine, History, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import { calculateGoalProgress } from "@/lib/goal-calculator";

interface UserDetailPageProps {
  params: Promise<{ periodId: string; userId: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { periodId, userId } = await params;
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

  // 사용자 정보 조회
  const { data: targetUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!targetUser) {
    notFound();
  }

  // 목표 목록 조회
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .eq('period_id', periodId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (goalsError) {
    console.error('Failed to fetch goals:', goalsError);
  }

  // 최근 일일 기록 조회
  const { data: recentLogs, error: recentLogsError } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('period_id', periodId)
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(5);

  if (recentLogsError) {
    console.error('Failed to fetch recent logs:', recentLogsError);
  }

  // 모든 일일 기록 조회 (goal_logs용)
  const { data: allDailyLogs } = await supabase
    .from('daily_logs')
    .select('id, log_date')
    .eq('period_id', periodId)
    .eq('user_id', userId);

  // goal_logs 조회
  const dailyLogIds = (allDailyLogs || []).map(l => l.id);
  const { data: goalLogs } = dailyLogIds.length > 0
    ? await supabase
        .from('goal_logs')
        .select('*')
        .in('daily_log_id', dailyLogIds)
    : { data: [] };

  // logDateMap 구성 (Record로 직렬화 가능하게)
  const logDateMap: Record<string, string> = {};
  (allDailyLogs || []).forEach(log => {
    logDateMap[log.id] = log.log_date;
  });

  // goalLogs를 goal_id별로 그룹화
  const goalLogsByGoalId: Record<string, any[]> = {};
  (goalLogs || []).forEach(gl => {
    if (!goalLogsByGoalId[gl.goal_id]) goalLogsByGoalId[gl.goal_id] = [];
    goalLogsByGoalId[gl.goal_id].push(gl);
  });

  // 오늘 기록이 있는지 확인
  const today = getTodayString();
  const todayLog = (recentLogs || []).find(log => log.log_date === today);

  // 자신의 페이지인지 확인
  const isOwnPage = authUser.id === userId;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-rose-500/20 selection:text-rose-600">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href={`/periods/${periodId}`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors p-2 -ml-2">
               <ArrowLeft className="h-5 w-5" />
             </Link>
             <div className="flex items-center gap-3">
               <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-800">
                  <AvatarImage src={targetUser.avatar_url || undefined} />
                  <AvatarFallback>{targetUser.name?.charAt(0) || '?'}</AvatarFallback>
               </Avatar>
               <span className="font-bold text-sm sm:text-base">{targetUser.name}의 목표</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block"><ThemeToggle /></span>
            <UserMenu user={authUser} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-5xl py-8 space-y-8">
        <Breadcrumb items={[
          { label: '대시보드', href: '/app' },
          { label: period.title, href: `/periods/${periodId}` },
          { label: `${targetUser.name}의 목표`, href: `/periods/${periodId}/users/${userId}` },
        ]} />

        {/* 상단 프로필 및 액션 섹션 */}
        <FadeIn>
           <div className="flex flex-col md:flex-row gap-6 md:items-stretch">
              {/* 프로필 요약 카드 (왼쪽) */}
              <div className="flex-1 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-6">
                 <Avatar className="h-20 w-20 ring-4 ring-rose-100 dark:ring-rose-900/30 shadow-lg">
                    <AvatarImage src={targetUser.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">{targetUser.name?.charAt(0) || '?'}</AvatarFallback>
                 </Avatar>
                 <div>
                    <h1 className="text-2xl font-bold mb-1">{targetUser.name}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">{period.title} 도전 중</p>
                    <div className="flex gap-2 mt-3">
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-900/30 dark:to-orange-900/20 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50">
                          총 {(goals || []).length}개 목표
                       </span>
                       {(goals || []).length > 0 && (
                         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                            진행률 {Math.round(((goals || []).reduce((sum, g) => {
                              try {
                                const prog = calculateGoalProgress(g as Goal, period, goalLogsByGoalId[g.id] || [], new Map(Object.entries(logDateMap || {})));
                                return sum + (prog?.progress_percent ?? 0);
                              } catch {
                                return sum;
                              }
                            }, 0) / (goals || []).length) || 0)}%
                         </span>
                       )}
                    </div>
                 </div>
              </div>

              {/* 오늘의 기록 버튼 (오른쪽 - 본인일 때만) */}
              {isOwnPage && (
                 <Link href={`/periods/${periodId}/users/${userId}/logs/${today}`} className="md:w-1/3 flex-shrink-0 group">
                    <div className="h-full bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl p-6 shadow-xl shadow-rose-500/20 text-white flex flex-col justify-between hover:shadow-2xl hover:shadow-rose-500/30 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
                       {/* Sparkle decoration */}
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                       <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/10 rounded-full blur-xl -ml-12 -mb-12"></div>

                       <div className="flex justify-between items-start relative z-10">
                          <div>
                             <p className="font-bold text-lg mb-1">오늘의 기록</p>
                             <p className="text-rose-100 text-sm">{formatDateKorean(today)}</p>
                          </div>
                          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                             <PenLine className="h-6 w-6" />
                          </div>
                       </div>
                       <div className="flex items-center gap-2 mt-4 text-sm font-semibold relative z-10">
                          {todayLog ? '수정하기' : '작성하러 가기'} <ArrowLeft className="rotate-180 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                       </div>
                    </div>
                 </Link>
              )}
           </div>
        </FadeIn>

        {/* 목표 목록 */}
        <section className="space-y-6">
          <FadeIn delay={0.2} className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 relative">
               <div className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/20 p-2 rounded-lg">
                 <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
               </div>
               목표 리스트
               <div className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
            </h2>
            <div className="flex items-center gap-2">
              <RefreshButton />
              {isOwnPage && (
                <AddGoalDialog periodId={periodId} userId={userId} />
              )}
            </div>
          </FadeIn>

          {(!goals || goals.length === 0) ? (
            <FadeIn delay={0.3}>
               <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900/50 dark:to-zinc-800/30 border-dashed border-zinc-200 dark:border-zinc-800">
                 <div className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 p-5 rounded-2xl mb-4 shadow-inner">
                   <Target className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                 </div>
                 <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-100">등록된 목표가 없습니다</h3>
                 <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm leading-relaxed">
                   {isOwnPage ? "목표를 추가하고 성장을 시작하세요!" : "아직 등록된 목표가 없습니다."}
                 </p>
                 {isOwnPage && (
                   <AddGoalDialog periodId={periodId} userId={userId} />
                 )}
               </div>
            </FadeIn>
          ) : (
            <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal: Goal) => (
                <StaggerItem key={goal.id}>
                  <GoalCard
                    goal={goal}
                    period={period}
                    isEditable={isOwnPage}
                    goalLogs={goalLogsByGoalId[goal.id] || []}
                    logDateMap={logDateMap}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </section>

        {/* 최근 기록 */}
        <FadeIn delay={0.4}>
           <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 relative">
                 <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/20 p-2 rounded-lg">
                   <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                 </div>
                 최근 기록
                 <div className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
              </h2>
              
              {(!recentLogs || recentLogs.length === 0) ? (
                 <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900/50 dark:to-zinc-800/30 border-dashed border-zinc-200 dark:border-zinc-800">
                   <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-800 dark:to-cyan-700 p-5 rounded-2xl mb-4 shadow-inner">
                     <History className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                   </div>
                   <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-100">아직 작성된 기록이 없습니다</h3>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm leading-relaxed">
                     매일 기록을 남겨 성장을 추적하세요
                   </p>
                   {isOwnPage && (
                     <Link href={`/periods/${periodId}/users/${userId}/logs/${today}`}>
                       <Button className="rounded-full">오늘의 기록 작성하기</Button>
                     </Link>
                   )}
                 </div>
              ) : (
                 <div className="space-y-3">
                    {recentLogs.map((log: DailyLog) => {
                       const hasDiary = log.diary && log.diary.trim().length > 0;
                       return (
                       <Link
                          key={log.id}
                          href={`/periods/${periodId}/users/${userId}/logs/${log.log_date}`}
                          className="block group"
                       >
                          <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm relative overflow-hidden">
                             {/* Color bar indicator */}
                             <div className={`absolute left-0 top-0 bottom-0 w-1 ${hasDiary ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}></div>
                             <CardContent className="py-4 pl-5 flex items-center justify-between">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 min-w-0">
                                   <p className="font-semibold text-zinc-900 dark:text-zinc-100 w-32 flex-shrink-0">
                                      {formatDateKorean(log.log_date)}
                                   </p>
                                   <p className={`text-sm line-clamp-1 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors ${hasDiary ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-500 italic'}`}>
                                      {log.diary || '(일기 내용 없음)'}
                                   </p>
                                </div>
                                <ArrowLeft className="rotate-180 h-4 w-4 text-zinc-300 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                             </CardContent>
                          </Card>
                       </Link>
                    )})}
                 </div>
              )}
           </section>
        </FadeIn>
      </main>
    </div>
  );
}
