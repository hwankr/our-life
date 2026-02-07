import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { FadeIn } from "@/components/ui/motion-layout";
import { formatDateKorean } from "@/lib/date-utils";
import { NavigationBlockerProvider, SafeLink } from "@/components/navigation-blocker";
import { DailyLogForm } from "@/components/daily-log-form";
import { Breadcrumb } from "@/components/breadcrumb";

interface DailyLogPageProps {
  params: Promise<{ periodId: string; userId: string; date: string }>;
}

export default async function DailyLogPage({ params }: DailyLogPageProps) {
  const { periodId, userId, date } = await params;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/');
  }

  // 자신의 기록만 수정 가능
  if (authUser.id !== userId) {
    redirect(`/periods/${periodId}/users/${userId}`);
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
    .select('name')
    .eq('id', userId)
    .single();

  // 사용자의 목표 목록 조회
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('period_id', periodId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  // 해당 날짜의 기록 조회
  const { data: dailyLog } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('period_id', periodId)
    .eq('user_id', userId)
    .eq('log_date', date)
    .single();

  // 기존 goal_logs 조회 (있는 경우)
  let goalLogs: { goal_id: string; count: number; subcategory_data: Record<string, boolean> | null; memo: string | null }[] = [];
  if (dailyLog) {
    const { data: logs } = await supabase
      .from('goal_logs')
      .select('*')
      .eq('daily_log_id', dailyLog.id);
    goalLogs = logs || [];
  }

  return (
    <NavigationBlockerProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-rose-500/20 selection:text-rose-600">
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <SafeLink href={`/periods/${periodId}/users/${userId}`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors p-2 -ml-2">
                <ArrowLeft className="h-5 w-5" />
              </SafeLink>
              <div>
                <h1 className="font-bold text-sm sm:text-base">{formatDateKorean(date)}</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{period.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu user={authUser} />
            </div>
          </div>
        </header>

        {/* 컨텍스트 바 */}
        <div className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="container mx-auto max-w-5xl px-4 py-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{period.title}</span>
              <span className="text-zinc-300 dark:text-zinc-600">|</span>
              <span>Day {Math.max(0, Math.ceil((new Date(date).getTime() - new Date(period.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1)} / {Math.ceil((new Date(period.end_date).getTime() - new Date(period.start_date).getTime()) / (1000 * 60 * 60 * 24))}</span>
            </div>
            {dailyLog && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">수정 모드</span>
            )}
          </div>
        </div>

        <main className="container mx-auto px-4 max-w-5xl py-8">
          <Breadcrumb items={[
            { label: '대시보드', href: '/app' },
            { label: period.title, href: `/periods/${periodId}` },
            { label: targetUser?.name || '사용자', href: `/periods/${periodId}/users/${userId}` },
            { label: formatDateKorean(date), href: `/periods/${periodId}/users/${userId}/logs/${date}` },
          ]} />

          <FadeIn>
            <DailyLogForm
              periodId={periodId}
              userId={userId}
              date={date}
              goals={goals || []}
              existingLog={dailyLog}
              existingGoalLogs={goalLogs}
            />
          </FadeIn>
        </main>
      </div>
    </NavigationBlockerProvider>
  );
}
