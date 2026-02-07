import { Skeleton } from "@/components/ui/skeleton";

export default function DailyLogLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-5" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>

      {/* Context bar */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="container mx-auto max-w-5xl px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 max-w-5xl py-8">
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Diary card skeleton */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>

          {/* Goals card skeleton */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <Skeleton className="h-5 w-20" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save button skeleton */}
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </main>
    </div>
  );
}
