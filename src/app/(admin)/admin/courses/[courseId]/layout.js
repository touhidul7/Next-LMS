import { createAdminClient } from '@/lib/supabase/server';
import { requireAdminRole, getCurrentProfile } from '@/lib/auth/server';
import HeaderNav from '@/components/dashboard/HeaderNav';
import Link from 'next/link';
import CourseNavTabs from './CourseNavTabs';
import { ArrowLeft, BookOpen, Layers, Video, Settings, ShieldCheck } from 'lucide-react';

export default async function CourseLayout({ children, params }) {
  const { courseId } = await params;
  const profile = await getCurrentProfile();
  await requireAdminRole();

  const supabase = await createAdminClient();
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <HeaderNav profile={profile} />

      {/* Course Sub-Header & Navigation Bar */}
      <div className="border-b border-slate-800 bg-[#090d16]/95 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 font-semibold">
                <Link href="/admin/courses" className="hover:text-[#fa8b98] flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> All Courses
                </Link>
                <span>/</span>
                <span className="text-[#fa8b98] font-mono">{course?.title || 'Course Workspace'}</span>
              </div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#fa8b98]" />
                {course?.title || 'Manage Course'}
              </h2>
            </div>

            {/* Nav Tabs */}
            <CourseNavTabs courseId={courseId} />
          </div>
        </div>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}
