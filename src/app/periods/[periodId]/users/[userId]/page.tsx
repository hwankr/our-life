import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateKorean, getTodayString } from "@/lib/date-utils";
import { Goal, DailyLog } from "@/types";
import { GoalCard } from "@/components/goal-card";
import { AddGoalDialog } from "@/components/add-goal-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-layout";
import { ArrowLeft, PenLine, History, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('period_id', periodId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  // 최근 일일 기록 조회
  const { data: recentLogs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('period_id', periodId)
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(5);

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
             <Link href={`/periods/${periodId}`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
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
            <ThemeToggle />
            <UserMenu user={authUser} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-5xl py-8 space-y-8">
        {/* 상단 프로필 및 액션 섹션 */}
        <FadeIn>
           <div className="flex flex-col md:flex-row gap-6 md:items-stretch">
              {/* 프로필 요약 카드 (왼쪽) */}
              <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-6">
                 <Avatar className="h-20 w-20 border-4 border-zinc-50 dark:border-zinc-950 shadow-md">
                    <AvatarImage src={targetUser.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">{targetUser.name?.charAt(0) || '?'}</AvatarFallback>
                 </Avatar>
                 <div>
                    <h1 className="text-2xl font-bold mb-1">{targetUser.name}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">{period.title} 도전 중</p>
                    <div className="flex gap-2 mt-3">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                          총 {(goals || []).length}개 목표
                       </span>
                    </div>
                 </div>
              </div>

              {/* 오늘의 기록 버튼 (오른쪽 - 본인일 때만) */}
              {isOwnPage && (
                 <Link href={`/periods/${periodId}/users/${userId}/logs/${today}`} className="md:w-1/3 flex-shrink-0 group">
                    <div className="h-full bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl p-6 shadow-md text-white flex flex-col justify-between hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                       <div className="flex justify-between items-start">
                          <div>
                             <p className="font-bold text-lg mb-1">오늘의 기록</p>
                             <p className="text-rose-100 text-sm">{formatDateKorean(today)}</p>
                          </div>
                          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                             <PenLine className="h-6 w-6" />
                          </div>
                       </div>
                       <div className="flex items-center gap-2 mt-4 text-sm font-medium">
                          {todayLog ? '수정하기' : '작성하러 가기'} <ArrowLeft className="rotate-180 h-4 w-4" />
                       </div>
                    </div>
                 </Link>
              )}
           </div>
        </FadeIn>

        {/* 목표 목록 */}
        <section className="space-y-6">
          <FadeIn delay={0.2} className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
               <Sparkles className="h-5 w-5 text-yellow-500" />
               목표 리스트
            </h2>
            {isOwnPage && (
              <AddGoalDialog periodId={periodId} userId={userId} />
            )}
          </FadeIn>

          {(!goals || goals.length === 0) ? (
            <FadeIn delay={0.3}>
               <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-white dark:bg-zinc-900 border-dashed border-zinc-200 dark:border-zinc-800">
                 <p className="text-zinc-500 mb-2">아직 등록된 목표가 없습니다.</p>
                 {isOwnPage && (
                   <p className="text-sm text-zinc-400">오른쪽 상단의 버튼을 눌러 첫 번째 목표를 추가하세요!</p>
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
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </section>

        {/* 최근 기록 */}
        <FadeIn delay={0.4}>
           <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                 <History className="h-5 w-5 text-blue-500" />
                 최근 기록
              </h2>
              
              {(!recentLogs || recentLogs.length === 0) ? (
                 <div className="py-12 text-center text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <p>아직 작성된 기록이 없습니다.</p>
                 </div>
              ) : (
                 <div className="space-y-3">
                    {recentLogs.map((log: DailyLog) => (
                       <Link 
                          key={log.id} 
                          href={`/periods/${periodId}/users/${userId}/logs/${log.log_date}`}
                          className="block group"
                       >
                          <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm hover:shadow-md cursor-pointer border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm">
                             <CardContent className="py-4 flex items-center justify-between">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                   <p className="font-semibold text-zinc-900 dark:text-zinc-100 w-32 flex-shrink-0">
                                      {formatDateKorean(log.log_date)}
                                   </p>
                                   <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors">
                                      {log.diary || '(일기 내용 없음)'}
                                   </p>
                                </div>
                                <ArrowLeft className="rotate-180 h-4 w-4 text-zinc-300 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors" />
                             </CardContent>
                          </Card>
                       </Link>
                    ))}
                 </div>
              )}
           </section>
        </FadeIn>
      </main>
    </div>
  );
}
