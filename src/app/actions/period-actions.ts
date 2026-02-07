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

    // 첫 번째 참여자(생성자)만 삭제 가능
    if (period.participant_ids[0] !== user.id) {
      return { success: false, error: "기간 생성자만 삭제할 수 있습니다." };
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

export async function createPeriod(data: {
  title: string;
  startDate: string;
  endDate: string;
  partnerEmail?: string;
}): Promise<{ success: boolean; error?: string; periodId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증되지 않은 사용자입니다." };
  }

  try {
    const adminClient = createAdminClient();
    let participantIds = [user.id];

    // 파트너 이메일로 사용자 찾기 (선택적)
    if (data.partnerEmail?.trim()) {
      const { data: partnerUser } = await adminClient
        .from('users')
        .select('id')
        .eq('email', data.partnerEmail.trim())
        .single();

      if (!partnerUser) {
        return { success: false, error: "파트너를 찾을 수 없습니다. 먼저 파트너가 가입해야 합니다." };
      }
      participantIds.push(partnerUser.id);
    }

    // 새 기간 생성 (다른 사용자의 기간을 비활성화하지 않음)
    const { data: newPeriod, error } = await adminClient
      .from('periods')
      .insert({
        title: data.title || `${new Date().getFullYear()}년 목표`,
        start_date: data.startDate,
        end_date: data.endDate,
        is_active: true,
        participant_ids: participantIds,
      })
      .select()
      .single();

    if (error) {
      console.error("Period create error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath('/app');
    return { success: true, periodId: newPeriod.id };
  } catch (error: any) {
    console.error("Create period error:", error);
    return { success: false, error: error.message || "알 수 없는 오류" };
  }
}

export async function updatePeriod(data: {
  periodId: string;
  title: string;
  startDate: string;
  endDate: string;
  partnerEmail?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증되지 않은 사용자입니다." };
  }

  try {
    const adminClient = createAdminClient();

    // 기간 정보 및 권한 확인
    const { data: period } = await adminClient
      .from('periods')
      .select('participant_ids')
      .eq('id', data.periodId)
      .single();

    if (!period) {
      return { success: false, error: "기간을 찾을 수 없습니다." };
    }

    if (!period.participant_ids.includes(user.id)) {
      return { success: false, error: "이 기간을 수정할 권한이 없습니다." };
    }

    let updatedParticipantIds = [...period.participant_ids];

    // 파트너 추가 로직
    if (data.partnerEmail?.trim()) {
      const { data: partnerUser } = await adminClient
        .from('users')
        .select('id')
        .eq('email', data.partnerEmail.trim())
        .single();

      if (!partnerUser) {
        return { success: false, error: "파트너를 찾을 수 없습니다. (이메일을 확인해주세요)" };
      }

      if (!updatedParticipantIds.includes(partnerUser.id)) {
        updatedParticipantIds.push(partnerUser.id);
      }
    }

    const { error } = await adminClient
      .from('periods')
      .update({
        title: data.title,
        start_date: data.startDate,
        end_date: data.endDate,
        participant_ids: updatedParticipantIds,
      })
      .eq('id', data.periodId);

    if (error) {
      console.error("Period update error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/periods/${data.periodId}`);
    revalidatePath('/app');
    return { success: true };
  } catch (error: any) {
    console.error("Update period error:", error);
    return { success: false, error: error.message || "알 수 없는 오류" };
  }
}
