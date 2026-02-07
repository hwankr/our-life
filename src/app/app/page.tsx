import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreatePeriodModal } from "@/components/periods/CreatePeriodModal";
import { PeriodCard } from "@/components/periods/PeriodCard";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-layout";
import { Plus, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 모든 기간 조회
  const { data: periods } = await supabase
    .from('periods')
    .select('*')
    .contains('participant_ids', [user.id])
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  // Fetch all participants for the periods
  const allParticipantIds = [...new Set(periods?.flatMap(p => p.participant_ids) || [])];
  const { data: allParticipants } = allParticipantIds.length > 0
    ? await supabase
        .from('users')
        .select('id, name, avatar_url')
        .in('id', allParticipantIds)
    : { data: [] };

  const participantsMap: Record<string, { id: string; name: string; avatar_url: string | null }> = {};
  (allParticipants || []).forEach(p => { participantsMap[p.id] = p; });

  // Compute greeting based on server time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후예요' : '좋은 저녁이에요';

  // Compute stats
  const activePeriods = periods?.filter(p => p.is_active).length || 0;
  const totalParticipants = allParticipantIds.length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-rose-500/20 selection:text-rose-600">
      {/* Decorative Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl opacity-50 animate-float pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-50 animate-float-delayed pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
             <div className="h-6 w-6 rounded-md bg-rose-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">O</span>
             </div>
             <span className="text-lg font-bold tracking-tight">OurLife</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </div>
        {/* Gradient line below header */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-5xl py-10">
        {/* Greeting Section */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                👋 {greeting}!
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">친구와 함께하는 성장 여정을 확인하세요</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {periods?.length || 0}개의 여정
                </span>
              </div>
            </div>
            <CreatePeriodModal trigger={
              <Button className="rounded-full shadow-md bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                 <Plus className="mr-2 h-4 w-4" /> 새 기간 시작
              </Button>
            } />
          </div>
        </FadeIn>

        {/* Quick Stats Row */}
        {periods && periods.length > 0 && (
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* Total Periods */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">전체 기간</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{periods.length}</p>
                  </div>
                </div>
              </div>

              {/* Active Periods */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center relative">
                    <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">진행중</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{activePeriods}</p>
                  </div>
                </div>
              </div>

              {/* Total Participants */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">함께한 사람</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{totalParticipants}</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {periods && periods.length > 0 ? (
          <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {periods.map((period) => (
              <StaggerItem key={period.id}>
                <PeriodCard period={period} participantsMap={participantsMap} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <FadeIn delay={0.2}>
            <div className="relative flex flex-col items-center justify-center py-24 text-center border rounded-2xl bg-white dark:bg-zinc-900/50 border-dashed border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-transparent to-orange-50/50 dark:from-rose-950/20 dark:via-transparent dark:to-orange-950/20" />

              <div className="relative z-10">
                <div className="bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-950 dark:to-orange-950 p-6 rounded-2xl mb-6 inline-block">
                  <Plus className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">첫 여정을 시작해보세요</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 max-w-md leading-relaxed">
                  친구와 함께 6개월 간의 목표 달성을 시작해보세요.<br/>
                  서로 응원하며 함께 성장할 수 있습니다.
                </p>
                <CreatePeriodModal />
              </div>
            </div>
          </FadeIn>
        )}
      </main>
    </div>
  );
}
