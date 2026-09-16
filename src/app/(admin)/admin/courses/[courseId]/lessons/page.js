import { createAdminClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/server';
import Link from 'next/link';
import { BookOpen, Plus, Edit, Video, FileText, ShieldCheck } from 'lucide-react';
import LessonDeleteButton from '@/app/(admin)/admin/course/lessons/LessonDeleteButton';

export const metadata = {
  title: 'Course Lessons — Frontend Development LMS',
};

export default async function CourseLessonsPage({ params, searchParams }) {
  const { courseId } = await params;
  const { moduleId: selectedModuleId } = await searchParams;
  await requireAdminRole();

  const supabase = await createAdminClient();

  // Fetch modules for filter dropdown
  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, month_number')
    .eq('course_id', courseId)
    .order('month_number', { ascending: true });

  const moduleIds = modules?.map((m) => m.id) || [];

  // Fetch lessons belonging to these modules
  let query = supabase
    .from('lessons')
    .select('*, modules!lessons_module_id_fkey(id, title, month_number), weeks(id, title, week_number)')
    .order('position', { ascending: true });

  if (selectedModuleId) {
    query = query.eq('module_id', selectedModuleId);
  } else if (moduleIds.length > 0) {
    query = query.in('module_id', moduleIds);
  }

  const { data: lessons } = await query;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Curriculum CMS
          </div>
          <h1 className="text-3xl font-extrabold text-white">Course Lessons & Videos</h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, edit, and organize Google Drive video lessons for this course.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href={`/admin/courses/${courseId}/lessons/new/edit`}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold hover:shadow-lg hover:shadow-cyan-500/20 text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Lesson
          </Link>
        </div>
      </div>

      {/* Module Filter Header */}
      {modules && modules.length > 0 && (
        <div className="flex items-center gap-3 mb-6 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter by Module:</span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/courses/${courseId}/lessons`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !selectedModuleId
                  ? 'bg-cyan-500 text-slate-950 font-extrabold'
                  : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              All Modules
            </Link>
            {modules.map((m) => (
              <Link
                key={m.id}
                href={`/admin/courses/${courseId}/lessons?moduleId=${m.id}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedModuleId === m.id
                    ? 'bg-cyan-500 text-slate-950 font-extrabold'
                    : 'bg-slate-900 text-slate-300 hover:text-white'
                }`}
              >
                Module {m.month_number} — {m.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lessons Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {!lessons || lessons.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">No lessons created yet</p>
            <p className="text-xs text-slate-500 mt-1">Click &quot;Add New Lesson&quot; to create your first video or reading lesson.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Lesson Title</th>
                  <th className="p-4">Parent Module</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Google Drive ID</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lessons.map((lsn) => (
                  <tr key={lsn.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-bold text-white text-sm">{lsn.title}</td>
                    <td className="p-4 text-slate-300 text-xs">
                      {lsn.modules
                        ? `Module ${lsn.modules.month_number} — ${lsn.modules.title}`
                        : lsn.weeks
                        ? `Week ${lsn.weeks.week_number}`
                        : 'Unassigned'}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-semibold text-[11px] capitalize">
                        {lsn.lesson_type === 'video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        {lsn.lesson_type}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-pink-400">
                      {lsn.video_external_id || 'N/A'}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/courses/${courseId}/lessons/${lsn.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-400 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-all text-xs"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <LessonDeleteButton lessonId={lsn.id} lessonTitle={lsn.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
