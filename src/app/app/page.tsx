import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreatePeriodModal } from "@/components/periods/CreatePeriodModal";
import { PeriodCard } from "@/components/periods/PeriodCard";

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
    <div className="container mx-auto p-4 max-w-5xl py-8">
       <div className="flex items-center justify-between mb-8">
         <div>
           <h1 className="text-3xl font-bold tracking-tight">내 대시보드</h1>
           <p className="text-zinc-500 mt-2">함께 성장하는 여정을 기록하세요</p>
         </div>
         <CreatePeriodModal />
       </div>

       {periods && periods.length > 0 ? (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           {periods.map((period) => (
             <PeriodCard key={period.id} period={period} />
           ))}
         </div>
       ) : (
         <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 border-dashed">
            <h3 className="text-lg font-medium mb-2">시작된 기간이 없습니다</h3>
            <p className="text-zinc-500 mb-6 max-w-sm">
              친구와 함께 목표를 달성할 새로운 기간을 시작해보세요.
            </p>
            <CreatePeriodModal />
         </div>
       )}
    </div>
  );
}
