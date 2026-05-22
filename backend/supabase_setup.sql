-- Run this in Supabase Dashboard → SQL Editor.
-- Idempotent: safe to re-run.
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  job_title TEXT,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- For older deployments missing the columns added in the audit branch.
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS job_title TEXT;

CREATE INDEX IF NOT EXISTS analyses_user_id_created_at_idx
  ON public.analyses (user_id, created_at DESC);

-- Row Level Security:
--   Public read so results/{id} share links work for anonymous viewers.
--   Service-role writes (backend uses SUPABASE_SERVICE_KEY which bypasses RLS,
--   but the policy is here for completeness if anon writes are ever enabled).
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read" ON public.analyses;
CREATE POLICY "public read" ON public.analyses FOR SELECT USING (true);

DROP POLICY IF EXISTS "service insert" ON public.analyses;
CREATE POLICY "service insert" ON public.analyses FOR INSERT WITH CHECK (true);
