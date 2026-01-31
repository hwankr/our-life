'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function NewPeriodPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
        router.push("/");
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

      // 기존 활성 기간 비활성화
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
      router.push(`/periods/${newPeriod.id}`);
    } catch (error) {
      console.error("기간 생성 오류:", error);
      toast.error("기간 생성에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">새로운 기간 시작</CardTitle>
          <CardDescription>
            친구와 함께할 목표 달성 기간을 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                파트너가 이미 가입한 경우에만 추가됩니다. 나중에 추가할 수도 있습니다.
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "생성 중..." : "기간 시작하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
