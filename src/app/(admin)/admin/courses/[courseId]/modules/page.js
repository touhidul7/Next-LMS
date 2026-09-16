import { createAdminClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/server';
import ModuleClientManager from '@/app/(admin)/admin/course/modules/ModuleClientManager';

export const metadata = {
  title: 'Course Modules — Frontend Development LMS',
};

export default async function CourseModulesPage({ params }) {
  const { courseId } = await params;
  await requireAdminRole();

  const supabase = await createAdminClient();
  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('month_number', { ascending: true });

  return (
    <div className="py-6">
      <ModuleClientManager courseId={courseId} initialModules={modules || []} />
    </div>
  );
}
