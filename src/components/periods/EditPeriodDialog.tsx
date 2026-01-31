'use client';

import { useState, useEffect } from "react";
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
import { Settings, UserPlus } from "lucide-react";
import { Period } from "@/types";
import { deletePeriod } from "@/app/actions/period-actions";

interface EditPeriodDialogProps {
  period: Period;
  trigger?: React.ReactNode;
}

export function EditPeriodDialog({ period, trigger }: EditPeriodDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [title, setTitle] = useState(period.title);
  const [startDate, setStartDate] = useState(period.start_date);
  const [endDate, setEndDate] = useState(period.end_date);
  const [partnerEmail, setPartnerEmail] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(period.title);
      setStartDate(period.start_date);
      setEndDate(period.end_date);
      setPartnerEmail("");
    }
  }, [open, period]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // 파트너 추가 로직
      let updatedParticipantIds = [...period.participant_ids];
      
      if (partnerEmail.trim()) {
        const { data: partnerUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', partnerEmail.trim())
          .single();

        if (partnerUser) {
          if (!updatedParticipantIds.includes(partnerUser.id)) {
            updatedParticipantIds.push(partnerUser.id);
            toast.success("새로운 파트너가 목록에 추가됩니다.");
          } else {
            toast.info("이미 참여 중인 파트너입니다.");
          }
        } else {
          toast.error("파트너를 찾을 수 없습니다. (이메일을 확인해주세요)");
          setIsLoading(false);
          return;
        }
      }

      // 기간 정보 업데이트
      const { error } = await supabase
        .from('periods')
        .update({
          title,
          start_date: startDate,
          end_date: endDate,
          participant_ids: updatedParticipantIds
        })
        .eq('id', period.id);

      if (error) throw error;

      toast.success("기간 정보가 수정되었습니다.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("기간 수정 오류:", error);
      toast.error("수정에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
     if (!confirm("정말 이 기간을 삭제하시겠습니까?\n\n포함된 모든 목표와 기록이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.")) {
        return;
     }
     
     setIsLoading(true);
     try {
        const result = await deletePeriod(period.id);
        
        if (!result.success) {
           throw new Error(result.error || "삭제에 실패했습니다.");
        }
        
        toast.success("기간과 모든 데이터가 삭제되었습니다.");
        setOpen(false);
        router.push('/app');
     } catch (error: any) {
        console.error("기간 삭제 오류:", error);
        toast.error(`삭제 실패: ${error.message || "알 수 없는 오류"}`);
     } finally {
        setIsLoading(false);
     }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>기간 설정 수정</DialogTitle>
          <DialogDescription>
            기간의 정보를 수정하거나 새로운 파트너를 초대하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="period-title">기간 제목</Label>
            <Input
              id="period-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">시작일</Label>
              <Input
                id="edit-startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endDate">종료일</Label>
              <Input
                id="edit-endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Label htmlFor="add-partner" className="flex items-center gap-2">
               <UserPlus className="h-4 w-4" /> 파트너 추가하기
            </Label>
            <Input
              id="add-partner"
              type="email"
              placeholder="friend@example.com"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
            />
            <p className="text-xs text-zinc-500">
              추가할 친구의 이메일을 입력하세요. (이미 가입된 사용자만 가능)
            </p>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading}>
               삭제하기
            </Button>
            <div className="flex gap-2">
               <Button type="button" variant="outline" onClick={() => setOpen(false)}>취소</Button>
               <Button type="submit" disabled={isLoading}>
                 {isLoading ? "저장 중..." : "저장하기"}
               </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
