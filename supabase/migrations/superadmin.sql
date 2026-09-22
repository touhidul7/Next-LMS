-- Set any user as super_admin
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'touhiduliet@gmail.com';

-- Ensure they are on the admin whitelist
INSERT INTO public.admin_whitelist (email) 
VALUES ('touhiduliet@gmail.com') 
ON CONFLICT (email) DO NOTHING;
