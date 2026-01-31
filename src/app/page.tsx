import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 로그인된 사용자는 앱으로 리다이렉트
  if (user) {
    redirect('/app');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 p-4">
      <main className="flex flex-col items-center gap-8 text-center max-w-lg">
        {/* 로고/타이틀 */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            OurLife
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            친구와 함께하는 6개월 목표 달성
          </p>
        </div>

        {/* 소개 카드 */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">함께 성장하세요</CardTitle>
            <CardDescription>
              서로의 하루를 기록하고, 목표 달성을 응원하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-left text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-start gap-3">
                <span className="text-lg">🎯</span>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">목표 설정</p>
                  <p>운동, 공부, 습관 등 다양한 목표를 설정하세요</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📝</span>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">일기 기록</p>
                  <p>매일의 기록을 남기고 진행 상황을 체크하세요</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">👥</span>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">친구와 공유</p>
                  <p>서로의 성장을 확인하고 응원하세요</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 로그인 버튼 */}
        <div className="flex flex-col gap-3 w-full">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full" size="lg">
              시작하기
            </Button>
          </Link>
        </div>

        {/* 푸터 */}
        <p className="text-xs text-zinc-500">
          로그인하면 서비스 이용약관에 동의하게 됩니다
        </p>
      </main>
    </div>
  );
}
