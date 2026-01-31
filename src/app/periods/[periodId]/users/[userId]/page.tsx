import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDateKorean, getTodayString, getMonthsBetween } from "@/lib/date-utils";
import { Goal, DailyLog } from "@/types";
import { GoalCard } from "@/components/goal-card";
import { AddGoalDialog } from "@/components/add-goal-dialog";

interface UserDetailPageProps {
  params: Promise<{ periodId: string; userId: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { periodId, userId } = await params;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/');
  }

  // 기간 정보 조회
  const { data: period } = await supabase
    .from('periods')
    .select('*')
    .eq('id', periodId)
    .single();

  if (!period) {
    notFound();
  }

  // 사용자 정보 조회
  const { data: targetUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!targetUser) {
    notFound();
  }

  // 목표 목록 조회
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('period_id', periodId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  // 최근 일일 기록 조회
  const { data: recentLogs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('period_id', periodId)
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(5);

  // 오늘 기록이 있는지 확인
  const today = getTodayString();
  const todayLog = (recentLogs || []).find(log => log.log_date === today);

  // 자신의 페이지인지 확인
  const isOwnPage = authUser.id === userId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/periods/${periodId}`} className="text-zinc-500 hover:text-zinc-700">
              ← 돌아가기
            </Link>
            <div className="flex-1" />
            <Avatar className="h-10 w-10">
              <AvatarImage src={targetUser.avatar_url || undefined} />
              <AvatarFallback>{targetUser.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-bold">{targetUser.name}</h1>
              <p className="text-xs text-zinc-500">{period.title}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* 오늘의 기록 버튼 */}
        {isOwnPage && (
          <Link href={`/periods/${periodId}/users/${userId}/logs/${today}`}>
            <Card className="bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer">
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">오늘의 기록</p>
                  <p className="text-sm opacity-80">
                    {todayLog ? '수정하기' : '작성하기'}
                  </p>
                </div>
                <span className="text-2xl">→</span>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* 목표 목록 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">목표 ({(goals || []).length}개)</h2>
            {isOwnPage && (
              <AddGoalDialog periodId={periodId} userId={userId} />
            )}
          </div>

          {(!goals || goals.length === 0) ? (
            <Card>
              <CardContent className="py-8 text-center text-zinc-500">
                <p>아직 등록된 목표가 없습니다.</p>
                {isOwnPage && (
                  <p className="text-sm mt-2">위의 버튼을 눌러 첫 번째 목표를 추가하세요!</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {goals.map((goal: Goal) => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  period={period}
                  isEditable={isOwnPage} 
                />
              ))}
            </div>
          )}
        </section>

        {/* 최근 기록 */}
        <section>
          <h2 className="text-lg font-semibold mb-4">최근 기록</h2>
          
          {(!recentLogs || recentLogs.length === 0) ? (
            <Card>
              <CardContent className="py-8 text-center text-zinc-500">
                <p>아직 작성된 기록이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log: DailyLog) => (
                <Link 
                  key={log.id} 
                  href={`/periods/${periodId}/users/${userId}/logs/${log.log_date}`}
                >
                  <Card className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                    <CardContent className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formatDateKorean(log.log_date)}</p>
                        <p className="text-sm text-zinc-500 truncate max-w-xs">
                          {log.diary ? log.diary.slice(0, 50) + (log.diary.length > 50 ? '...' : '') : '(일기 없음)'}
                        </p>
                      </div>
                      <span className="text-zinc-400">→</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
