import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatDateKorean, formatDDay, getDaysBetween } from "@/lib/date-utils";
import { User, Period, Goal } from "@/types";
import { LogoutButton } from "@/components/logout-button";

interface PeriodPageProps {
  params: Promise<{ periodId: string }>;
}

export default async function PeriodPage({ params }: PeriodPageProps) {
  const { periodId } = await params;
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

  // 참여자 정보 조회
  const { data: participants } = await supabase
    .from('users')
    .select('*')
    .in('id', period.participant_ids);

  // 각 참여자의 목표 조회
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('period_id', periodId);

  // 참여자별 목표 그룹화
  const goalsByUser = (goals || []).reduce((acc, goal) => {
    if (!acc[goal.user_id]) acc[goal.user_id] = [];
    acc[goal.user_id].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  // 전체 진행률 계산
  const totalDays = getDaysBetween(period.start_date, period.end_date);
  const elapsedDays = getDaysBetween(period.start_date, new Date().toISOString().split('T')[0]);
  const periodProgress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{period.title}</h1>
            <p className="text-sm text-zinc-500">
              {formatDateKorean(period.start_date)} ~ {formatDateKorean(period.end_date)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {formatDDay(period.end_date)}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* 기간 진행률 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">기간 진행률</CardTitle>
            <CardDescription>
              {elapsedDays > 0 ? `${elapsedDays}일 경과` : '시작 전'} / 총 {totalDays}일
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={periodProgress} className="h-3" />
            <p className="text-right text-sm text-zinc-500 mt-1">
              {Math.round(periodProgress)}%
            </p>
          </CardContent>
        </Card>

        {/* 참여자 카드 */}
        <div className="grid gap-6 md:grid-cols-2">
          {(participants || []).map((participant: User) => {
            const userGoals = goalsByUser[participant.id] || [];
            const completedGoals = userGoals.filter((g: Goal) => {
              if (g.type === 'ROUTINE') return (g.current_count || 0) >= (g.target_count || 1);
              if (g.type === 'OBJECTIVE') return g.is_achieved;
              return false;
            }).length;

            // 간단한 평균 달성률 계산
            const avgProgress = userGoals.length > 0
              ? userGoals.reduce((sum: number, g: Goal) => {
                  if (g.type === 'ROUTINE') {
                    return sum + Math.min(((g.current_count || 0) / (g.target_count || 1)) * 100, 100);
                  }
                  if (g.type === 'OBJECTIVE') {
                    return sum + (g.is_achieved ? 100 : 0);
                  }
                  return sum + 50; // LIMIT은 임시로 50%
                }, 0) / userGoals.length
              : 0;

            return (
              <Card key={participant.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={participant.avatar_url || undefined} />
                      <AvatarFallback>{participant.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{participant.name}</CardTitle>
                      <CardDescription>
                        목표 {userGoals.length}개 • 완료 {completedGoals}개
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 전체 달성률 */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-600 dark:text-zinc-400">전체 달성률</span>
                      <span className="font-medium">{Math.round(avgProgress)}%</span>
                    </div>
                    <Progress value={avgProgress} className="h-2" />
                  </div>

                  {/* 목표 미리보기 */}
                  {userGoals.slice(0, 3).map((goal: Goal) => (
                    <div key={goal.id} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1">{goal.title}</span>
                      <span className="text-zinc-500 ml-2">
                        {goal.type === 'ROUTINE' && `${goal.current_count || 0}/${goal.target_count}${goal.unit}`}
                        {goal.type === 'LIMIT' && `월 ${goal.monthly_limit}${goal.unit} 이하`}
                        {goal.type === 'OBJECTIVE' && (goal.is_achieved ? '✅ 달성' : '진행 중')}
                      </span>
                    </div>
                  ))}
                  {userGoals.length > 3 && (
                    <p className="text-xs text-zinc-400">+{userGoals.length - 3}개 더보기</p>
                  )}

                  <Link href={`/periods/${periodId}/users/${participant.id}`}>
                    <Button variant="outline" className="w-full mt-2">
                      상세 보기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 새 기간 시작 버튼 */}
        <div className="flex justify-center pt-4">
          <Link href="/periods/new">
            <Button variant="ghost">
              새로운 기간 시작하기
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
