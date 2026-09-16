-- ====================================================================
-- Frontend Development LMS — Database Schema, Trigger & RLS Policies
-- ====================================================================

-- 1. CUSTOM ENUM TYPES
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('student', 'mentor', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.enrollment_status AS ENUM ('pending', 'active', 'suspended', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.lesson_type AS ENUM ('video', 'reading', 'practice', 'quiz', 'assignment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.submission_type AS ENUM ('github_and_live', 'text', 'file_upload', 'hybrid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.submission_status AS ENUM ('draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.video_provider AS ENUM ('google_drive', 'bunny_stream', 'cloudflare_stream', 'custom_hls');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- 2. TABLES DEFINITIONS

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role public.user_role NOT NULL DEFAULT 'student',
  github_username TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_bdt NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  bkash_number TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MODULES TABLE (Months 1-4)
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WEEKS TABLE (Weeks 1-16)
CREATE TABLE IF NOT EXISTS public.weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 16),
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  week_id UUID REFERENCES public.weeks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content_markdown TEXT,
  lesson_type public.lesson_type NOT NULL DEFAULT 'video',
  video_provider public.video_provider NOT NULL DEFAULT 'google_drive',
  video_external_id TEXT,
  video_duration_seconds INTEGER DEFAULT 0,
  position INTEGER NOT NULL,
  is_preview BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  task_title TEXT,
  task_instructions TEXT,
  task_marks INTEGER DEFAULT 100,
  task_due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PAYMENTS TABLE (bKash Manual Checkout)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sender_phone TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  amount_bdt NUMERIC(10, 2) NOT NULL,
  screenshot_url TEXT,
  status public.payment_status NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  status public.enrollment_status NOT NULL DEFAULT 'pending',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- LESSON PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  watched_seconds INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  submission_type public.submission_type NOT NULL DEFAULT 'github_and_live',
  max_score INTEGER NOT NULL DEFAULT 100,
  due_date TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  github_repo_url TEXT,
  live_deploy_url TEXT,
  text_content TEXT,
  file_attachment_url TEXT,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status public.submission_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUBMISSION REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.submission_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0),
  feedback TEXT NOT NULL,
  status_assigned public.submission_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROJECTS TABLE (14 Milestones & Capstone)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  week_id UUID REFERENCES public.weeks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  milestone_number INTEGER NOT NULL,
  is_capstone BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROJECT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  github_repo_url TEXT NOT NULL,
  live_deploy_url TEXT NOT NULL,
  notes TEXT,
  status public.submission_status NOT NULL DEFAULT 'submitted',
  score INTEGER CHECK (score >= 0),
  feedback TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL DEFAULT 'link',
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GOOGLE DRIVE TOKENS TABLE (Server-only OAuth storage)
CREATE TABLE IF NOT EXISTS public.google_drive_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_modules_course ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_weeks_module ON public.weeks(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_week ON public.lessons(week_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON public.enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_assignment ON public.submissions(user_id, assignment_id);

-- 4. AUTOMATIC PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_drive_tokens ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view profiles; User can edit own profile
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Courses: Anyone can read published courses; Admins full access
CREATE POLICY "Public courses read" ON public.courses FOR SELECT USING (is_published = true OR auth.role() = 'service_role');
CREATE POLICY "Admin courses manage" ON public.courses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Modules & Weeks: Anyone can view; Admins manage
CREATE POLICY "Public modules read" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Public weeks read" ON public.weeks FOR SELECT USING (true);

-- Lessons: Anyone can view preview lessons; Active enrolled students can view all
DROP POLICY IF EXISTS "Lessons preview read" ON public.lessons;
CREATE POLICY "Lessons preview read" ON public.lessons FOR SELECT USING (
  is_preview = true OR 
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.enrollments e ON e.course_id = m.course_id
    WHERE m.id = lessons.module_id AND e.user_id = auth.uid() AND e.status = 'active'
  ) OR
  EXISTS (
    SELECT 1 FROM public.weeks w
    JOIN public.modules m ON m.id = w.module_id
    JOIN public.enrollments e ON e.course_id = m.course_id
    WHERE w.id = lessons.week_id AND e.user_id = auth.uid() AND e.status = 'active'
  ) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'mentor'))
);

-- Resources: All authenticated/preview can read; Staff manage
DROP POLICY IF EXISTS "Public resources read" ON public.resources;
CREATE POLICY "Public resources read" ON public.resources FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff resources manage" ON public.resources;
CREATE POLICY "Staff resources manage" ON public.resources FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'mentor'))
);

-- Payments: User reads/inserts own payments; Admins full access
CREATE POLICY "User payments read" ON public.payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User payments insert" ON public.payments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin payments manage" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Enrollments: User reads own enrollment; Admins manage
CREATE POLICY "User enrollments read" ON public.enrollments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin enrollments manage" ON public.enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Lesson Progress: User manages own progress
CREATE POLICY "User lesson_progress manage" ON public.lesson_progress FOR ALL USING (user_id = auth.uid());

-- Submissions: User manages own submissions; Mentors/Admins view all
CREATE POLICY "User submissions manage" ON public.submissions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Staff submissions read" ON public.submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('mentor', 'admin', 'super_admin'))
);

-- Submission Reviews: Staff manage reviews; Student views own submission reviews
CREATE POLICY "Staff reviews manage" ON public.submission_reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('mentor', 'admin', 'super_admin'))
);
CREATE POLICY "Student reviews read" ON public.submission_reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.user_id = auth.uid())
);

-- Google Drive Tokens: SERVICE ROLE & ADMINS ONLY
CREATE POLICY "Service role drive tokens" ON public.google_drive_tokens FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin drive tokens manage" ON public.google_drive_tokens FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- HIERARCHY & TASK MIGRATION
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE;
ALTER TABLE public.lessons ALTER COLUMN week_id DROP NOT NULL;
ALTER TABLE public.modules DROP CONSTRAINT IF EXISTS modules_month_number_check;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS task_title TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS task_instructions TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS task_marks INTEGER DEFAULT 100;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS task_due_date TIMESTAMPTZ;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS description TEXT;
UPDATE public.lessons SET module_id = public.weeks.module_id FROM public.weeks WHERE public.lessons.week_id = public.weeks.id AND public.lessons.module_id IS NULL;
NOTIFY pgrst, 'reload schema';

