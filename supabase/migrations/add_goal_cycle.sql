-- 목표 주기(Cycle) 기능 추가 마이그레이션
-- Supabase SQL Editor에서 실행하세요

-- 1. goals 테이블에 cycle 컬럼 추가 (TOTAL/WEEKLY/MONTHLY)
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS cycle TEXT DEFAULT 'TOTAL' 
CHECK (cycle IN ('TOTAL', 'WEEKLY', 'MONTHLY'));

-- 2. limit_value 컬럼 추가 (주간/월간 제한값 통합)
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS limit_value INTEGER;

-- 3. 기존 monthly_limit 데이터를 limit_value로 마이그레이션
UPDATE public.goals 
SET limit_value = monthly_limit, cycle = 'MONTHLY'
WHERE type = 'LIMIT' AND monthly_limit IS NOT NULL;

-- 4. 기존 ROUTINE 목표는 TOTAL 주기로 설정 (이미 기본값이지만 명시적으로)
UPDATE public.goals 
SET cycle = 'TOTAL'
WHERE type = 'ROUTINE' AND cycle IS NULL;

-- 완료 메시지
SELECT 'Migration completed: cycle and limit_value columns added to goals table' as status;
