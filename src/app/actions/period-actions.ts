'use server';

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deletePeriod(periodId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증되지 않은 사용자입니다." };
  }

  try {
    // 권한 확인은 일반 클라이언트로
    const { data: period } = await supabase
      .from('periods')
      .select('participant_ids')
      .eq('id', periodId)
      .single();

    if (!period) {
      return { success: false, error: "기간을 찾을 수 없습니다." };
    }

    if (!period.participant_ids.includes(user.id)) {
      return { success: false, error: "이 기간을 삭제할 권한이 없습니다." };
    }

    // 삭제는 Admin 클라이언트로 (RLS 우회)
    const adminClient = createAdminClient();

    // 연관 데이터 조회
    const { data: goals } = await adminClient.from('goals').select('id').eq('period_id', periodId);
    const { data: logs } = await adminClient.from('daily_logs').select('id').eq('period_id', periodId);

    const goalIds = goals?.map((g: { id: string }) => g.id) || [];
    const logIds = logs?.map((l: { id: string }) => l.id) || [];

    // goal_logs 삭제
    if (goalIds.length > 0) {
      await adminClient.from('goal_logs').delete().in('goal_id', goalIds);
    }
    if (logIds.length > 0) {
      await adminClient.from('goal_logs').delete().in('daily_log_id', logIds);
    }

    // goals 삭제
    await adminClient.from('goals').delete().eq('period_id', periodId);

    // daily_logs 삭제
    await adminClient.from('daily_logs').delete().eq('period_id', periodId);

    // period 삭제
    const { error } = await adminClient.from('periods').delete().eq('id', periodId);

    if (error) {
      console.error("Period delete error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath('/app');
    return { success: true };
  } catch (error: any) {
    console.error("Delete period error:", error);
    return { success: false, error: error.message || "알 수 없는 오류" };
  }
}
