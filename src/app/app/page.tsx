import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreatePeriodModal } from "@/components/periods/CreatePeriodModal";
import { PeriodCard } from "@/components/periods/PeriodCard";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-layout";
import { Plus } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-rose-500/20 selection:text-rose-600">
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-5xl py-10">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">내 대시보드</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">친구와 함께하는 성장 여정을 확인하세요</p>
            </div>
            <CreatePeriodModal trigger={
              <Button className="rounded-full shadow-md bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                 <Plus className="mr-2 h-4 w-4" /> 새 기간 시작
              </Button>
            } />
          </div>
        </FadeIn>

        {periods && periods.length > 0 ? (
          <StaggerContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {periods.map((period) => (
              <StaggerItem key={period.id}>
                <PeriodCard period={period} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <FadeIn delay={0.2}>
            <div className="flex flex-col items-center justify-center py-24 text-center border rounded-2xl bg-white dark:bg-zinc-900/50 border-dashed border-zinc-200 dark:border-zinc-800">
              <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
                 <Plus className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-100">시작된 기간이 없습니다</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm leading-relaxed">
                친구와 함께 6개월 간의 목표 달성을 시작해보세요.<br/>
                서로 응원하며 성장할 수 있습니다.
              </p>
              <CreatePeriodModal />
            </div>
          </FadeIn>
        )}
      </main>
    </div>
  );
}
