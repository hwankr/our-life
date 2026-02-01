-- Add study target/unit for OBJECTIVE goals
-- Run in Supabase SQL Editor

ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS study_target INTEGER;

ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS study_unit TEXT DEFAULT '분';

UPDATE public.goals
SET study_unit = COALESCE(study_unit, '분')
WHERE type = 'OBJECTIVE';
