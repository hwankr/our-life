'use server';

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

interface GoalLogData {
  goal_id: string;
  count: number;
  subcategory_data?: Record<string, boolean> | null;
  memo?: string | null;
}

interface SaveDailyLogData {
  periodId: string;
  userId: string;
  date: string;
  diary: string;
  goalLogs: GoalLogData[];
  existingLogId?: string;
}

export async function saveDailyLog(data: SaveDailyLogData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증되지 않은 사용자입니다." };
  }

  // 본인의 기록만 작성/수정 가능
  if (user.id !== data.userId) {
    return { success: false, error: "본인의 기록만 작성할 수 있습니다." };
  }

  try {
    const adminClient = createAdminClient();

    // 1. DailyLog 생성 또는 업데이트
    let dailyLogId = data.existingLogId;

    if (data.existingLogId) {
      // 기존 기록 소유권 확인
      const { data: existingLog } = await adminClient
        .from('daily_logs')
        .select('user_id')
        .eq('id', data.existingLogId)
        .single();

      if (!existingLog || existingLog.user_id !== user.id) {
        return { success: false, error: "기록을 수정할 권한이 없습니다." };
      }

      const { error } = await adminClient
        .from('daily_logs')
        .update({ diary: data.diary, updated_at: new Date().toISOString() })
        .eq('id', data.existingLogId);

      if (error) throw error;
    } else {
      const { data: newLog, error } = await adminClient
        .from('daily_logs')
        .insert({
          period_id: data.periodId,
          user_id: data.userId,
          log_date: data.date,
          diary: data.diary,
        })
        .select()
        .single();

      if (error) throw error;
      dailyLogId = newLog.id;
    }

    // 2. 기존 goal_logs 삭제 (있는 경우)
    if (data.existingLogId) {
      await adminClient
        .from('goal_logs')
        .delete()
        .eq('daily_log_id', data.existingLogId);
    }

    // 3. 체크된 목표들의 goal_logs 생성
    if (data.goalLogs.length > 0) {
      const goalLogInserts = data.goalLogs.map((gl) => ({
        daily_log_id: dailyLogId,
        goal_id: gl.goal_id,
        count: gl.count,
        subcategory_data: gl.subcategory_data || null,
        memo: gl.memo || null,
      }));

      const { error } = await adminClient
        .from('goal_logs')
        .insert(goalLogInserts);

      if (error) throw error;
    }

    revalidatePath(`/periods/${data.periodId}/users/${data.userId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Save daily log error:", error);
    return { success: false, error: error.message || "저장에 실패했습니다." };
  }
}
