import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { DailyLogForm } from "@/components/daily-log-form";

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
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href={`/periods/${periodId}/users/${userId}`} 
              className="text-zinc-500 hover:text-zinc-700"
            >
              ← 돌아가기
            </Link>
            <div className="flex-1" />
            <h1 className="font-bold">{date}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <DailyLogForm
          periodId={periodId}
          userId={userId}
          date={date}
          goals={goals || []}
          existingLog={dailyLog}
          existingGoalLogs={goalLogs}
        />
      </main>
    </div>
  );
}
