'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CreatePeriodModalProps {
  onPeriodCreated?: () => void;
  trigger?: React.ReactNode;
}

export function CreatePeriodModal({ onPeriodCreated, trigger }: CreatePeriodModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date.toISOString().split('T')[0];
  });
  const [partnerEmail, setPartnerEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("로그인이 필요합니다");
        return;
      }

      // 파트너 이메일로 사용자 찾기 (선택적)
      let participantIds = [user.id];
      
      if (partnerEmail.trim()) {
        const { data: partnerUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', partnerEmail.trim())
          .single();

        if (partnerUser) {
          participantIds.push(partnerUser.id);
        } else {
          toast.error("파트너를 찾을 수 없습니다. 먼저 파트너가 가입해야 합니다.");
          setIsLoading(false);
          return;
        }
      }

      // 기존 활성 기간 비활성화 (선택 사항: 여러 기간 활성화가 가능하다면 주석 처리)
      // 여기서는 규칙상 '활성 기간' 개념이 있으므로 기존 것들은 비활성화 처리
      await supabase
        .from('periods')
        .update({ is_active: false })
        .contains('participant_ids', [user.id]);

      // 새 기간 생성
      const { data: newPeriod, error } = await supabase
        .from('periods')
        .insert({
          title: title || `${new Date().getFullYear()}년 목표`,
          start_date: startDate,
          end_date: endDate,
          is_active: true,
          participant_ids: participantIds,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("새로운 기간이 생성되었습니다!");
      setOpen(false);
      
      // 상태 초기화
      setTitle("");
      setPartnerEmail("");
      
      if (onPeriodCreated) {
        onPeriodCreated();
      } else {
        router.refresh(); // 기본 동작: 페이지 새로고침
        router.push(`/periods/${newPeriod.id}`);
      }
    } catch (error) {
      console.error("기간 생성 오류:", error);
      toast.error("기간 생성에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 기간 시작
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새로운 기간 시작</DialogTitle>
          <DialogDescription>
            친구와 함께할 목표 달성 기간을 설정하세요
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">기간 제목</Label>
            <Input
              id="title"
              placeholder="예: 2026년 상반기 목표"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">시작일</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">종료일</Label>
              <Input
                id="endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partnerEmail">파트너 이메일 (선택)</Label>
            <Input
              id="partnerEmail"
              type="email"
              placeholder="friend@example.com"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
            />
            <p className="text-xs text-zinc-500">
              파트너가 이미 가입한 경우에만 추가됩니다
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "생성 중..." : "기간 시작하기"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
