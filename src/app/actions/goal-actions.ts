'use server';

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { GoalType, GoalCycle } from "@/types";

interface AddGoalData {
  periodId: string;
  userId: string;
  title: string;
  type: GoalType;
  unit: string;
  cycle?: GoalCycle;
  targetCount?: number;
  limitValue?: number;
  monthlyLimit?: number; // 레거시 호환
  targetValue?: number;
  studyTarget?: number;
  studyUnit?: string;
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
      cycle: data.cycle || 'TOTAL',
    };

    if (data.type === 'ROUTINE') {
      goalData.target_count = data.targetCount || 1;
      // 주간/월간 루틴의 경우 limit_value 사용
      if (data.cycle && data.cycle !== 'TOTAL') {
        goalData.limit_value = data.limitValue || data.targetCount || 1;
      }
    } else if (data.type === 'LIMIT') {
      // LIMIT은 항상 주기 필요 (WEEKLY 또는 MONTHLY)
      goalData.cycle = data.cycle || 'MONTHLY';
      goalData.limit_value = data.limitValue || data.monthlyLimit || 1;
      goalData.monthly_limit = data.limitValue || data.monthlyLimit || 1; // 레거시 호환
    } else if (data.type === 'OBJECTIVE') {
      goalData.target_value = data.targetValue || null;
      goalData.study_target = data.studyTarget || null;
      goalData.study_unit = data.studyUnit || null;
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

    // 목표 소유권 확인
    const { data: goal } = await adminClient
      .from('goals')
      .select('user_id, period_id')
      .eq('id', goalId)
      .single();

    if (!goal) {
      return { success: false, error: "목표를 찾을 수 없습니다." };
    }

    if (goal.user_id !== user.id) {
      return { success: false, error: "본인의 목표만 삭제할 수 있습니다." };
    }

    if (goal.period_id !== periodId) {
      return { success: false, error: "잘못된 기간 정보입니다." };
    }

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

interface UpdateGoalData {
  goalId: string;
  periodId: string;
  title: string;
  unit: string;
  // ROUTINE
  targetCount?: number;
  cycle?: GoalCycle;
  limitValue?: number;
  // LIMIT
  monthlyLimit?: number;
  // OBJECTIVE
  targetValue?: number | null;
  studyTarget?: number | null;
  studyUnit?: string | null;
  subcategories?: string[];
}

export async function updateGoal(data: UpdateGoalData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증되지 않은 사용자입니다." };
  }

  try {
    const adminClient = createAdminClient();

    // 목표 소유권 확인
    const { data: goal } = await adminClient
      .from('goals')
      .select('user_id, type')
      .eq('id', data.goalId)
      .single();

    if (!goal) {
      return { success: false, error: "목표를 찾을 수 없습니다." };
    }

    if (goal.user_id !== user.id) {
      return { success: false, error: "본인의 목표만 수정할 수 있습니다." };
    }

    const updateData: Record<string, unknown> = {
      title: data.title,
      unit: data.unit,
    };

    if (goal.type === 'ROUTINE') {
      updateData.target_count = data.targetCount;
      updateData.cycle = data.cycle || 'TOTAL';
      if (data.cycle && data.cycle !== 'TOTAL') {
        updateData.limit_value = data.limitValue || data.targetCount || 1;
      }
    } else if (goal.type === 'LIMIT') {
      updateData.cycle = data.cycle || 'MONTHLY';
      updateData.limit_value = data.limitValue || data.monthlyLimit || 1;
      updateData.monthly_limit = data.limitValue || data.monthlyLimit || 1;
    } else if (goal.type === 'OBJECTIVE') {
      updateData.target_value = data.targetValue;
      updateData.study_target = data.studyTarget;
      updateData.study_unit = data.studyUnit;
      updateData.subcategories = data.subcategories || [];
    }

    const { error } = await adminClient
      .from('goals')
      .update(updateData)
      .eq('id', data.goalId);

    if (error) {
      console.error("Goal update error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/periods/${data.periodId}/users/${user.id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update goal error:", error);
    return { success: false, error: error.message || "알 수 없는 오류" };
  }
}
