-- Add study day count for OBJECTIVE goals
-- Run in Supabase SQL Editor

ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS study_day_count INTEGER DEFAULT 0;

UPDATE public.goals g
SET study_day_count = sub.cnt
FROM (
  SELECT goal_id, COUNT(*) AS cnt
  FROM public.goal_logs
  GROUP BY goal_id
) sub
WHERE g.id = sub.goal_id
  AND g.type = 'OBJECTIVE';

CREATE OR REPLACE FUNCTION update_goal_current_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.goals
    SET current_count = (
      SELECT COALESCE(SUM(gl.count), 0)
      FROM public.goal_logs gl
      WHERE gl.goal_id = NEW.goal_id
    ),
    study_day_count = CASE
      WHEN type = 'OBJECTIVE' THEN (
        SELECT COALESCE(COUNT(*), 0)
        FROM public.goal_logs gl
        WHERE gl.goal_id = NEW.goal_id
      )
      ELSE study_day_count
    END
    WHERE id = NEW.goal_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.goals
    SET current_count = (
      SELECT COALESCE(SUM(gl.count), 0)
      FROM public.goal_logs gl
      WHERE gl.goal_id = OLD.goal_id
    ),
    study_day_count = CASE
      WHEN type = 'OBJECTIVE' THEN (
        SELECT COALESCE(COUNT(*), 0)
        FROM public.goal_logs gl
        WHERE gl.goal_id = OLD.goal_id
      )
      ELSE study_day_count
    END
    WHERE id = OLD.goal_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;
