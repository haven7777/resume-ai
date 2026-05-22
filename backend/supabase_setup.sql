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

-- ============================================================
-- Row Level Security
-- ============================================================
-- Threat model:
--   * Backend uses SUPABASE_SERVICE_KEY (service_role) which bypasses RLS.
--     All writes happen via the backend after JWT verification.
--   * Frontend uses the anon key only for Supabase Auth; it never reads or
--     writes `analyses` directly. RLS policies below defend against any
--     future client-side direct queries and against direct-to-Supabase
--     traffic from non-backend clients.
--
-- Policy summary:
--   SELECT — public (share-by-UUID is a deliberate product feature: anyone
--            who has a UUID may read that row's result; UUIDv4 is the
--            capability).
--   INSERT — denied for anon/authenticated. Only service_role (the backend)
--            can write rows. The previous "WITH CHECK (true)" policy let
--            anyone insert; this is now removed.
--   UPDATE/DELETE — denied for everyone except service_role.
-- ============================================================

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Drop any old/overly-permissive policies from previous setups
DROP POLICY IF EXISTS "public read" ON public.analyses;
DROP POLICY IF EXISTS "service insert" ON public.analyses;
DROP POLICY IF EXISTS "anon read" ON public.analyses;
DROP POLICY IF EXISTS "authenticated read own" ON public.analyses;

-- Public read — supports share-by-UUID.
CREATE POLICY "public read" ON public.analyses
  FOR SELECT
  USING (true);

-- No INSERT/UPDATE/DELETE policies for anon or authenticated roles.
-- service_role bypasses RLS, so the backend continues to write normally.
-- If you ever want to allow client-side writes, add a policy like:
--   CREATE POLICY "user inserts own" ON public.analyses
--     FOR INSERT TO authenticated
--     WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Quick verification queries (paste into SQL Editor after running):
--   -- Confirm policies on the table:
--   SELECT polname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'analyses';
--   -- Confirm RLS is enabled:
--   SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'analyses';
-- ============================================================
