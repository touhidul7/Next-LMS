-- Migration: Add live_class to lesson_type enum & add zoom_link column to lessons

-- 1. Add 'live_class' to lesson_type enum if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'lesson_type' AND e.enumlabel = 'live_class'
  ) THEN
    ALTER TYPE public.lesson_type ADD VALUE 'live_class';
  END IF;
END $$;

-- 2. Add zoom_link column to lessons table
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS zoom_link TEXT;

-- 3. Add live_meeting_date column to lessons table
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS live_meeting_date TIMESTAMPTZ;
