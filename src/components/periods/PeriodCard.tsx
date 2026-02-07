'use client';

import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, Users, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface Period {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  participant_ids: string[];
}

interface PeriodCardProps {
  period: Period;
  participantsMap?: Record<string, { id: string; name: string; avatar_url: string | null }>;
}

export function PeriodCard({ period, participantsMap }: PeriodCardProps) {
  const startDate = new Date(period.start_date);
  const endDate = new Date(period.end_date);
  const isExpired = new Date() > endDate;

  return (
    <Link href={`/periods/${period.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="h-full group border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 transition-all shadow-sm hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 overflow-hidden relative">
          <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/0 via-transparent to-orange-50/0 group-hover:from-rose-50/30 group-hover:to-orange-50/30 dark:group-hover:from-rose-950/10 dark:group-hover:to-orange-950/10 transition-all duration-300 pointer-events-none" />
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 relative z-10">
            <div className="space-y-1">
               <CardTitle className="text-lg font-bold leading-tight group-hover:text-rose-600 dark:group-hover:text-rose-500 transition-colors">
                  {period.title}
               </CardTitle>
               <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <CalendarDays className="h-3 w-3" />
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    {format(startDate, 'yyyy.MM.dd')} - {format(endDate, 'yyyy.MM.dd')}
                  </span>
               </div>
            </div>
            {period.is_active ? (
              <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                진행중
              </Badge>
            ) : isExpired ? (
              <Badge variant="secondary" className="bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">종료됨</Badge>
            ) : (
              <Badge variant="outline" className="text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700">대기중</Badge>
            )}
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex -space-x-2">
                   {period.participant_ids.map((pid, i) => {
                      const participant = participantsMap?.[pid];
                      return (
                        <TooltipProvider key={pid} delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Avatar className="h-7 w-7 border-2 border-white dark:border-zinc-900 ring-0 group-hover:ring-2 group-hover:ring-rose-200/50 dark:group-hover:ring-rose-800/30 transition-all">
                                {participant?.avatar_url && (
                                  <AvatarImage src={participant.avatar_url} />
                                )}
                                <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-[10px] text-zinc-500">
                                  {participant?.name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{participant?.name || '알 수 없음'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                   })}
                </div>
                <span className="text-xs font-medium pl-1">
                   {period.participant_ids.length}명 참여
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-rose-50 group-hover:to-orange-50 dark:group-hover:from-rose-950/30 dark:group-hover:to-orange-950/30 transition-all">
                 <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-rose-500 transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
