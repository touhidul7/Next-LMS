-- ====================================================================
-- Pre-authorized Admin Whitelist Table & Trigger Support
-- ====================================================================

-- 1. Create table for pre-authorized admin emails
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;

-- 2. Policies
DROP POLICY IF EXISTS "Admins full access to admin_whitelist" ON public.admin_whitelist;
CREATE POLICY "Admins full access to admin_whitelist"
  ON public.admin_whitelist
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    ) OR auth.role() = 'service_role'
  );

-- 3. Enhance handle_new_user trigger to check whitelist automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role public.user_role := 'student';
BEGIN
  -- Check if user's email was pre-authorized as admin
  IF EXISTS (
    SELECT 1 FROM public.admin_whitelist
    WHERE LOWER(email) = LOWER(NEW.email)
  ) THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    ),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    role = CASE 
      WHEN assigned_role = 'admin' THEN 'admin'
      ELSE public.profiles.role 
    END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
