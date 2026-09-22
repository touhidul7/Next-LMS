import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentProfile } from '@/lib/auth/server';
import HeaderNav from '@/components/dashboard/HeaderNav';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, PlayCircle, FileText, CheckCircle2, ChevronRight, BookOpen, Clock, Award, Radio } from 'lucide-react';
import { slugify } from '@/lib/utils';

export default async function ModuleDetailPage({ params }) {
  const { moduleId } = await params;
  const profile = await getCurrentProfile();
  const user = await requireAuth();

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Fetch all modules to resolve by ID or slug
  const { data: allModules } = await supabase
    .from('modules')
    .select('*, courses(*)');

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(moduleId);

  const moduleData = (allModules || []).find((m) => {
    if (isUuid) return m.id === moduleId;
    return (
      m.slug === moduleId ||
      slugify(m.title) === moduleId ||
      `module-${m.month_number}` === moduleId
    );
  });

  if (!moduleData) {
    redirect('/dashboard');
  }

  const moduleSlug = moduleData.slug || slugify(moduleData.title) || `module-${moduleData.month_number}`;

  // Fetch lessons for this module using admin client so unmigrated/direct-module lessons show correctly
  const { data: lessons } = await adminSupabase
    .from('lessons')
    .select('id, module_id, title, summary, lesson_type, video_duration_seconds, position, is_preview, is_published')
    .eq('is_published', true)
    .eq('module_id', moduleData.id)
    .order('position', { ascending: true });

  // Fetch this user's progress separately so RLS never interferes with the lesson list
  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('lesson_id, is_completed')
    .eq('user_id', user.id);

  // Fetch student submissions for these lessons
  const { data: moduleSubmissions } = await adminSupabase
    .from('submissions')
    .select(`
      id,
      lesson_id,
      status,
      submission_reviews (
        score,
        status_assigned
      )
    `)
    .eq('user_id', user.id);

  const submissionMap = new Map((moduleSubmissions || []).map((s) => [s.lesson_id, s]));

  const completedSet = new Set((progressRows || []).filter((p) => p.is_completed).map((p) => p.lesson_id));

  const lessonsWithProgress = (lessons || []).map((lsn) => ({
    ...lsn,
    isCompleted: completedSet.has(lsn.id),
    submission: submissionMap.get(lsn.id) || null,
  }));

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const m = Math.floor(seconds / 60);
    return `${m} mins`;
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <HeaderNav profile={profile} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-800 space-y-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div>
            <span className="text-xs font-mono font-medium text-[#fa8b98] uppercase tracking-wider">
              MODULE {moduleData.month_number}
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">{moduleData.title}</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              {moduleData.description}
            </p>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#175cff]" /> Module Lessons ({lessonsWithProgress?.length || 0})
          </h3>

          {!lessonsWithProgress || lessonsWithProgress.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 border border-slate-800">
              No lessons published for this module yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {lessonsWithProgress.map((lsn, idx) => {
                const isCompleted = lsn.isCompleted;
                const lessonSlug = slugify(lsn.title) || lsn.id;

                return (
                  <Link
                    key={lsn.id}
                    href={`/dashboard/module/${moduleSlug}/lesson/${lessonSlug}`}
                    className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-[#fa8b98]/60 transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-medium text-xs shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-900 text-[#fa8b98] border border-slate-800'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : idx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white group-hover:text-[#fa8b98] transition-colors truncate">
                            {lsn.title}
                          </h4>
                          {lsn.lesson_type === 'live_class' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1 shrink-0">
                              <Radio className="w-3 h-3 text-purple-400 animate-pulse" /> Live Class
                            </span>
                          )}
                        </div>
                        {lsn.summary && (
                          <p className="text-xs text-slate-400 truncate mt-0.5 max-w-xl">{lsn.summary}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {lsn.submission && (() => {
                        const sub = lsn.submission;
                        const latestReview = sub.submission_reviews?.[0];
                        if (sub.status === 'approved') {
                          return (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-mono text-[11px] font-semibold flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-yellow-400" />
                              {latestReview?.score !== null && latestReview?.score !== undefined
                                ? `${latestReview.score} Marks`
                                : 'Approved'}
                            </span>
                          );
                        }
                        if (sub.status === 'under_review') {
                          return (
                            <span className="px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-800/80 text-blue-400 font-mono text-[11px] font-medium">
                              Under Review
                            </span>
                          );
                        }
                        if (sub.status === 'rejected') {
                          return (
                            <span className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-800/80 text-red-400 font-mono text-[11px] font-medium">
                              Revision Needed
                            </span>
                          );
                        }
                        return (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-400 font-mono text-[11px] font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Submitted
                          </span>
                        );
                      })()}

                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {formatDuration(lsn.video_duration_seconds)}
                      </span>

                      <span className="px-3 py-1.5 rounded-lg bg-slate-900 group-hover:bg-[#175cff] group-hover:text-white text-[#fa8b98] font-medium text-xs transition-all flex items-center gap-1">
                        {isCompleted ? 'Review' : 'Start'} <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
