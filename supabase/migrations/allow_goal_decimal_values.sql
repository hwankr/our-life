-- Allow decimal values for OBJECTIVE goal scores
-- Run in Supabase SQL Editor

ALTER TABLE public.goals
  ALTER COLUMN target_value TYPE NUMERIC USING target_value::numeric;

ALTER TABLE public.goals
  ALTER COLUMN achieved_value TYPE NUMERIC USING achieved_value::numeric;
