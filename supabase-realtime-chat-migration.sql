-- Run this in Supabase SQL Editor.
-- 1) Add columns for app user (Taakra uses its own auth, not Supabase Auth)
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS app_user_id text,
  ADD COLUMN IF NOT EXISTS author_display_name text;

-- 2) RLS: allow read/insert for competition chat (anon key used from Next.js)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read rooms" ON public.rooms;
CREATE POLICY "Allow anon read rooms" ON public.rooms FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert rooms" ON public.rooms;
CREATE POLICY "Allow anon insert rooms" ON public.rooms FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon read messages" ON public.messages;
CREATE POLICY "Allow anon read messages" ON public.messages FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert messages" ON public.messages;
CREATE POLICY "Allow anon insert messages" ON public.messages FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 3) Realtime: ensure messages are in the publication (if not already)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
