'use server';

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { GoalType } from "@/types";

interface AddGoalData {
  periodId: string;
  userId: string;
  title: string;
  type: GoalType;
  unit: string;
  targetCount?: number;
  monthlyLimit?: number;
  targetValue?: number;
  subcategories?: string[];
}

export async function addGoal(data: AddGoalData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증되지 않은 사용자입니다." };
  }

  // 본인의 목표만 추가 가능
  if (user.id !== data.userId) {
    return { success: false, error: "본인의 목표만 추가할 수 있습니다." };
  }

  try {
    const adminClient = createAdminClient();

    const goalData: Record<string, unknown> = {
      period_id: data.periodId,
      user_id: data.userId,
      title: data.title,
      type: data.type,
      unit: data.unit,
    };

    if (data.type === 'ROUTINE') {
      goalData.target_count = data.targetCount || 1;
    } else if (data.type === 'LIMIT') {
      goalData.monthly_limit = data.monthlyLimit || 1;
    } else if (data.type === 'OBJECTIVE') {
      goalData.target_value = data.targetValue || null;
      goalData.subcategories = data.subcategories || null;
    }

    const { error } = await adminClient.from('goals').insert(goalData);

    if (error) {
      console.error("Goal insert error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/periods/${data.periodId}/users/${data.userId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Add goal error:", error);
    return { success: false, error: error.message || "알 수 없는 오류" };
  }
}

export async function deleteGoal(goalId: string, periodId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증되지 않은 사용자입니다." };
  }

  try {
    const adminClient = createAdminClient();

    // 목표 삭제 전 goal_logs 삭제
    await adminClient.from('goal_logs').delete().eq('goal_id', goalId);
    
    const { error } = await adminClient.from('goals').delete().eq('id', goalId);

    if (error) {
      console.error("Goal delete error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/periods/${periodId}/users/${userId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete goal error:", error);
    return { success: false, error: error.message || "알 수 없는 오류" };
  }
}
