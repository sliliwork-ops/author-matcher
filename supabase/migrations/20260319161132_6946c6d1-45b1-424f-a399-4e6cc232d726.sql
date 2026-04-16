CREATE TABLE public.book_concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  audience text,
  problems text,
  suitable_topics text,
  not_suitable_for text,
  promise text,
  short_description text,
  author_type text,
  chapter_type text,
  tone text,
  emotional_triggers text,
  match_keywords text,
  priority_signals text,
  exclude_keywords text,
  cta text,
  sample_output_angle text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.book_concepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "book_concepts_public_read"
  ON public.book_concepts
  FOR SELECT
  USING (true);