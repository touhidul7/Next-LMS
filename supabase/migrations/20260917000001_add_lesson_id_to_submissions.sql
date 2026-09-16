-- Add lesson_id column to submissions table
-- This allows students to submit assignments directly linked to a lesson
-- without requiring a separate assignments table entry.

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE;

-- Make assignment_id optional (was NOT NULL) so lesson-direct submissions work
ALTER TABLE public.submissions
  ALTER COLUMN assignment_id DROP NOT NULL;

-- Index for fast lookups by lesson
CREATE INDEX IF NOT EXISTS idx_submissions_lesson ON public.submissions(lesson_id);

-- Also add text_content if missing (older schemas may not have it)
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS text_content TEXT;

-- Unique constraint so upsert (re-submit) works: one submission per student per lesson
-- Note: ADD CONSTRAINT IF NOT EXISTS is not valid Postgres syntax, use a DO block
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_submissions_lesson_user'
  ) THEN
    ALTER TABLE public.submissions
      ADD CONSTRAINT uq_submissions_lesson_user UNIQUE (lesson_id, user_id);
  END IF;
END $$;
