import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion-layout";
import { Target, NotebookPen, Users, ArrowRight } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/app');
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative selection:bg-rose-500/20 selection:text-rose-600">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-zinc-50 dark:bg-zinc-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <header className="fixed top-0 right-0 p-6 z-50">
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-12 py-20">
          
          {/* Hero Section */}
          <section className="space-y-6 max-w-2xl">
            <FadeIn delay={0.1}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  v1.0 Now Available
                </span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]">
                <span className="block">Grow Together</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
                  With Your Friend
                </span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2} className="relative z-10">
              <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                서로의 하루를 기록하고 목표 달성을 함께하세요.
                <br className="hidden sm:block" />
                작은 성취가 모여 큰 변화를 만듭니다.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href="/auth/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 border-none">
                    Google로 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-zinc-400 mt-4">
                로그인 시 서비스 이용약관에 동의하게 됩니다
              </p>
            </FadeIn>
          </section>

          {/* Features Grid */}
          <StaggerContainer delay={0.4} className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
            {[
              {
                icon: <Target className="h-6 w-6 text-rose-500" />,
                title: "목표 설정",
                desc: "운동, 공부, 습관 등 다양한 목표를 설정하고 관리하세요."
              },
              {
                icon: <NotebookPen className="h-6 w-6 text-orange-500" />,
                title: "일기 기록",
                desc: "매일의 기록을 남기고 진행 상황을 한눈에 체크하세요."
              },
              {
                icon: <Users className="h-6 w-6 text-blue-500" />,
                title: "함께 성장",
                desc: "친구와 서로의 성장을 확인하고 긍정적인 자극을 주고받으세요."
              }
            ].map((feature, i) => (
              <StaggerItem key={i}>
                <Card className="h-full border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm hover:shadow-md">
                  <CardHeader>
                    <div className="p-2 w-fit rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-2">
                       {feature.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
          
        </div>
      </main>
      
      <footer className="py-8 text-center text-sm text-zinc-500">
        <p>© 2026 OurLife. Created with AI.</p>
      </footer>
    </div>
  );
}
