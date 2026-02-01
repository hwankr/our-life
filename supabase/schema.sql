-- OurLife 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. Users 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users RLS 정책
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Periods 테이블 (기간)
CREATE TABLE IF NOT EXISTS public.periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  participant_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Periods RLS 정책
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their periods" ON public.periods
  FOR SELECT USING (auth.uid() = ANY(participant_ids));

CREATE POLICY "Participants can insert periods" ON public.periods
  FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));

CREATE POLICY "Participants can update their periods" ON public.periods
  FOR UPDATE USING (auth.uid() = ANY(participant_ids));

-- 3. Goals 테이블 (목표)
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES public.periods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ROUTINE', 'LIMIT', 'OBJECTIVE')),
  
  -- ROUTINE 전용
  target_count INTEGER,
  current_count INTEGER DEFAULT 0,
  
  -- LIMIT 전용
  monthly_limit INTEGER,
  
  -- OBJECTIVE 전용
  subcategories JSONB,
  is_achieved BOOLEAN DEFAULT false,
  achieved_value NUMERIC,
  target_value NUMERIC,
  
  -- 공통
  unit TEXT DEFAULT '회',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals RLS 정책
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view goals in their periods" ON public.goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.periods
      WHERE periods.id = goals.period_id
      AND auth.uid() = ANY(periods.participant_ids)
    )
  );

CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Daily Logs 테이블 (일일 기록)
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES public.periods(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  diary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, period_id, log_date)
);

-- Daily Logs RLS 정책
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs in their periods" ON public.daily_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.periods
      WHERE periods.id = daily_logs.period_id
      AND auth.uid() = ANY(periods.participant_ids)
    )
  );

CREATE POLICY "Users can insert own logs" ON public.daily_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs" ON public.daily_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Goal Logs 테이블 (목표 체크 기록)
CREATE TABLE IF NOT EXISTS public.goal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 1,
  subcategory_data JSONB,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal Logs RLS 정책
ALTER TABLE public.goal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view goal logs in their periods" ON public.goal_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.daily_logs
      JOIN public.periods ON periods.id = daily_logs.period_id
      WHERE daily_logs.id = goal_logs.daily_log_id
      AND auth.uid() = ANY(periods.participant_ids)
    )
  );

CREATE POLICY "Users can insert own goal logs" ON public.goal_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.daily_logs
      WHERE daily_logs.id = goal_logs.daily_log_id
      AND daily_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own goal logs" ON public.goal_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.daily_logs
      WHERE daily_logs.id = goal_logs.daily_log_id
      AND daily_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own goal logs" ON public.goal_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.daily_logs
      WHERE daily_logs.id = goal_logs.daily_log_id
      AND daily_logs.user_id = auth.uid()
    )
  );

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_goals_period_user ON public.goals(period_id, user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_period_date ON public.daily_logs(user_id, period_id, log_date);
CREATE INDEX IF NOT EXISTS idx_goal_logs_daily_log ON public.goal_logs(daily_log_id);
CREATE INDEX IF NOT EXISTS idx_goal_logs_goal ON public.goal_logs(goal_id);

-- Goal 카운트 자동 업데이트 트리거 (ROUTINE용)
CREATE OR REPLACE FUNCTION update_goal_current_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.goals
    SET current_count = (
      SELECT COALESCE(SUM(gl.count), 0)
      FROM public.goal_logs gl
      WHERE gl.goal_id = NEW.goal_id
    )
    WHERE id = NEW.goal_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.goals
    SET current_count = (
      SELECT COALESCE(SUM(gl.count), 0)
      FROM public.goal_logs gl
      WHERE gl.goal_id = OLD.goal_id
    )
    WHERE id = OLD.goal_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_goal_count ON public.goal_logs;
CREATE TRIGGER trigger_update_goal_count
AFTER INSERT OR UPDATE OR DELETE ON public.goal_logs
FOR EACH ROW EXECUTE FUNCTION update_goal_current_count();
