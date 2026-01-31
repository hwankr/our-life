import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // 활성 기간(Active Period) 찾기
  const { data: activePeriod } = await supabase
    .from('periods')
    .select('id')
    .eq('is_active', true)
    .contains('participant_ids', [user.id])
    .single();

  if (activePeriod) {
    // 활성 기간이 있으면 해당 페이지로 이동
    redirect(`/periods/${activePeriod.id}`);
  } else {
    // 없으면 새 기간 생성 페이지로 이동
    redirect('/periods/new');
  }
}
