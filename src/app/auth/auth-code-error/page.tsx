import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">로그인 오류</CardTitle>
          <CardDescription>
            로그인 중 문제가 발생했습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            다시 시도해 주세요. 문제가 계속되면 관리자에게 문의하세요.
          </p>
          <Link href="/auth/login" className="block">
            <Button className="w-full" size="lg">
              다시 로그인하기
            </Button>
          </Link>
          <div className="text-center">
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
