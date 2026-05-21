-- Run this in Supabase Dashboard → SQL Editor
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allow public read (for shareable links)
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.analyses FOR SELECT USING (true);
CREATE POLICY "service insert" ON public.analyses FOR INSERT WITH CHECK (true);
