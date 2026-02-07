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
import { createPeriod } from "@/app/actions/period-actions";
import { addMonthsToDateString, getTodayString } from "@/lib/date-utils";
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
  const [startDate, setStartDate] = useState(() => getTodayString());
  const [endDate, setEndDate] = useState(() => addMonthsToDateString(getTodayString(), 6));
  const [partnerEmail, setPartnerEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createPeriod({
        title,
        startDate,
        endDate,
        partnerEmail: partnerEmail.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.error || "기간 생성에 실패했습니다");
        setIsLoading(false);
        return;
      }

      toast.success("새로운 기간이 생성되었습니다!");
      setOpen(false);

      // 상태 초기화
      setTitle("");
      setPartnerEmail("");

      if (onPeriodCreated) {
        onPeriodCreated();
      } else {
        router.refresh();
        if (result.periodId) {
          router.push(`/periods/${result.periodId}`);
        }
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
