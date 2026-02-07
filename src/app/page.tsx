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
      {/* Animated Gradient Orbs Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Orb 1 - Rose */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500/30 dark:bg-rose-500/20 rounded-full blur-3xl animate-float"></div>
        {/* Orb 2 - Orange */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-orange-400/25 dark:bg-orange-400/15 rounded-full blur-3xl animate-float-delayed"></div>
        {/* Orb 3 - Blue */}
        <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-blue-500/20 dark:bg-blue-500/15 rounded-full blur-3xl animate-float-slow"></div>
        {/* Orb 4 - Purple */}
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-500/25 dark:bg-purple-500/15 rounded-full blur-3xl animate-float"></div>
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <header className="fixed top-0 right-0 p-6 z-50">
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-12 py-20">
          
          {/* Hero Section */}
          <section className="space-y-6 max-w-2xl">
            <FadeIn delay={0.1}>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20 text-sm font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30 backdrop-blur-sm shimmer">
                  ✨ 친구와 함께 성장하세요
                </span>
              </div>
              <h1 className="text-6xl sm:text-8xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.05]">
                <span className="block mb-2">Grow Together</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-gradient-animate">
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <Link href="/auth/login" className="w-full sm:w-auto relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full blur-lg opacity-30 animate-pulse-glow"></div>
                  <Button size="lg" className="relative w-full sm:w-auto h-14 px-10 text-base rounded-full shadow-2xl hover:shadow-rose-500/25 transition-all hover:scale-105 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white border-none font-semibold">
                    Google로 시작하기 <ArrowRight className="ml-2 h-5 w-5" />
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
                icon: <Target className="h-7 w-7 text-white" />,
                title: "목표 설정",
                desc: "운동, 공부, 습관 등 다양한 목표를 설정하고 관리하세요.",
                gradient: "from-rose-500 to-rose-600",
                borderGradient: "from-rose-500/50 to-rose-600/50"
              },
              {
                icon: <NotebookPen className="h-7 w-7 text-white" />,
                title: "일기 기록",
                desc: "매일의 기록을 남기고 진행 상황을 한눈에 체크하세요.",
                gradient: "from-orange-500 to-orange-600",
                borderGradient: "from-orange-500/50 to-orange-600/50"
              },
              {
                icon: <Users className="h-7 w-7 text-white" />,
                title: "함께 성장",
                desc: "친구와 서로의 성장을 확인하고 긍정적인 자극을 주고받으세요.",
                gradient: "from-blue-500 to-blue-600",
                borderGradient: "from-blue-500/50 to-blue-600/50"
              }
            ].map((feature, i) => (
              <StaggerItem key={i}>
                <Card className="group h-full relative border-zinc-200/40 dark:border-zinc-800/40 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl hover:bg-white/90 dark:hover:bg-zinc-900/90 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02] overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${feature.borderGradient}`}></div>
                  <CardHeader>
                    <div className={`p-3 w-fit rounded-xl bg-gradient-to-br ${feature.gradient} mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                       {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
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
        <div className="max-w-4xl mx-auto">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent mb-6"></div>
          <p>© 2026 OurLife. Created with AI.</p>
        </div>
      </footer>
    </div>
  );
}
