import { createAdminClient } from '@/lib/supabase/server';
import { requireAdminRole, getCurrentProfile } from '@/lib/auth/server';
import HeaderNav from '@/components/dashboard/HeaderNav';
import Link from 'next/link';
import { ClipboardList, ArrowLeft } from 'lucide-react';
import SubmissionsClient from './SubmissionsClient';

export const metadata = {
  title: 'Assignment Submissions & Grading — LMS Admin',
};

export default async function AdminSubmissionsPage() {
  await requireAdminRole();
  const profile = await getCurrentProfile();
  const supabase = await createAdminClient();

  // Fetch all submissions joined with user profile, lesson info, and review history
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles:user_id (full_name, email),
      lessons:lesson_id (id, title, module_id, task_marks, modules(title, month_number)),
      submission_reviews (
        id,
        score,
        feedback,
        status_assigned,
        created_at,
        profiles:reviewer_id (full_name)
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <HeaderNav profile={profile} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-800">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin
          </Link>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#fa8b98] uppercase tracking-wider mb-2">
            <ClipboardList className="w-3.5 h-3.5" /> Assignment Submissions & Grading
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Student Submissions
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-normal">
            Review student GitHub code, test live deployments, assign marks, and leave feedback notes.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-900 text-red-300 text-sm mb-6">
            Failed to load submissions: {error.message}
          </div>
        )}

        <SubmissionsClient initialSubmissions={submissions || []} />
      </main>
    </div>
  );
}
