import { createAdminClient } from '@/lib/supabase/server';
import { requireAdminRole, getCurrentProfile } from '@/lib/auth/server';
import HeaderNav from '@/components/dashboard/HeaderNav';
import CoursesClientManager from './CoursesClientManager';

export const metadata = {
  title: 'All Courses — Frontend Development LMS',
};

export default async function AdminCoursesPage() {
  const profile = await getCurrentProfile();
  await requireAdminRole();

  const supabase = await createAdminClient();
  const { data: courses } = await supabase
    .from('courses')
    .select('*, modules(count)')
    .order('created_at', { ascending: true });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <HeaderNav profile={profile} />
      <CoursesClientManager initialCourses={courses || []} />
    </div>
  );
}
