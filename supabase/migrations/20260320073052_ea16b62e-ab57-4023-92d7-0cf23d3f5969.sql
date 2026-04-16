ALTER TABLE public.book_concepts
  ADD COLUMN IF NOT EXISTS publish_date TEXT,
  ADD COLUMN IF NOT EXISTS entry_deadline TEXT;