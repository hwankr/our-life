import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User } from "lucide-react";

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
}

export function PeriodCard({ period }: PeriodCardProps) {
  const startDate = new Date(period.start_date);
  const endDate = new Date(period.end_date);
  const isExpired = new Date() > endDate;

  return (
    <Link href={`/periods/${period.id}`}>
      <Card className="h-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold">{period.title}</CardTitle>
          {period.is_active ? (
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">진행중</Badge>
          ) : isExpired ? (
            <Badge variant="secondary">종료됨</Badge>
          ) : (
            <Badge variant="outline">대기중</Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>
                {format(startDate, 'yyyy.MM.dd')} - {format(endDate, 'yyyy.MM.dd')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>참여자 {period.participant_ids.length}명</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
