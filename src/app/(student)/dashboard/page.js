import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentProfile } from '@/lib/auth/server';
import HeaderNav from '@/components/dashboard/HeaderNav';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PlayCircle,
  FileCode,
  Bell,
  CreditCard,
  Award,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { formatBDT, slugify } from '@/lib/utils';

export default async function StudentDashboardPage() {
  const profile = await getCurrentProfile();
  const user = await requireAuth();
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Fetch enrollment status for flagship course
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', 'frontend-development')
    .single();

  const courseId = course?.id || 'a1b2c3d4-e5f6-7890-abcd-111111111111';

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*, payments(*)')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single();

  const { data: latestPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const isActive = enrollment?.status === 'active';
  const isPending = enrollment?.status === 'pending' || latestPayment?.status === 'pending' || latestPayment?.status === 'under_review';

  // Fetch modules for the course via admin client to accurately count all published lessons
  const { data: modules } = await adminSupabase
    .from('modules')
    .select('*, lessons(count)')
    .eq('course_id', courseId)
    .order('month_number', { ascending: true });

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  // Fetch student's assignment submissions & reviews
  const { data: studentSubmissions, error: subErr } = await adminSupabase
    .from('submissions')
    .select(`
      id,
      lesson_id,
      status,
      created_at,
      lessons:lesson_id (
        id,
        title,
        task_marks,
        module_id,
        modules (
          id,
          title,
          month_number
        )
      ),
      submission_reviews (
        id,
        score,
        feedback,
        status_assigned,
        created_at,
        profiles:reviewer_id (full_name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (subErr) {
    console.error('Error fetching studentSubmissions on dashboard:', subErr);
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      <HeaderNav profile={profile} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Welcome Header */}
        <div className="mb-8 pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-cyan-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Student Learning Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Welcome back, {profile?.full_name || 'Student'}!
          </h1>
        </div>

        {/* CONDITION 1: PENDING PAYMENT EXPERIENCE (Section 21 of Spec) */}
        {isPending && !isActive && (
          <div className="mb-10 glass-panel p-8 rounded-3xl border border-amber-800/80 bg-gradient-to-b from-amber-950/20 to-slate-950/80 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-xs font-medium">
                  <Clock className="w-4 h-4 animate-pulse" /> Payment Verification Pending
                </span>

                <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Frontend Development Course
                </h2>

                <p className="text-sm text-amber-200/90 leading-relaxed font-normal">
                  We received your payment information. Your access will be activated after payment verification by our admin team.
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300">
                  {latestPayment && (
                    <>
                      <div>
                        <span className="text-slate-400">Sender bKash:</span>{' '}
                        <span className="font-mono text-slate-200 font-medium">{latestPayment.sender_phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Transaction ID:</span>{' '}
                        <span className="font-mono text-pink-400 font-medium">{latestPayment.transaction_id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Amount:</span>{' '}
                        <span className="text-white font-medium">{formatBDT(latestPayment.amount_bdt)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/90 border border-amber-900/40 text-center shrink-0 w-full md:w-auto">
                <div className="text-xs text-slate-400 font-normal">Status Check</div>
                <div className="text-sm font-semibold text-amber-400 mt-1">Under Review</div>
                <div className="text-[11px] text-slate-400 mt-2 max-w-[200px] mx-auto font-normal">
                  Verification usually completes within 1-6 hours.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONDITION 2: ACTIVE ENROLLED EXPERIENCE */}
        {isActive && (
          <div className="space-y-10">
            {/* Active Course Banner */}
            <div className="glass-panel p-8 rounded-3xl border border-cyan-800/60 bg-gradient-to-b from-cyan-950/20 to-slate-950/80">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-medium mb-3">
                    <CheckCircle2 className="w-4 h-4" /> Active Student Access
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                    Frontend Development — 4-Month Flagship Program
                  </h2>
                  <p className="text-sm text-slate-400 mt-2 font-normal">
                    Access 16 weeks of private video lessons, practice exercises, assignments, and 14 milestone projects.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/90 border border-cyan-900/50 text-center shrink-0 w-full md:w-auto">
                  <div className="text-xs text-slate-400 font-normal">Current Progress</div>
                  <div className="text-2xl font-semibold text-cyan-400 mt-1">Week 1</div>
                  <div className="w-36 h-1.5 rounded-full bg-slate-800 mt-3 mx-auto overflow-hidden">
                    <div className="h-full bg-cyan-400 w-[6%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Curriculum Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" /> Course Modules
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {modules && modules.length > 0 ? (
                  modules.map((m) => {
                    const modSlug = m.slug || slugify(m.title) || `module-${m.month_number}`;
                    return (
                      <Link
                        key={m.id}
                        href={`/dashboard/module/${modSlug}`}
                        className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group"
                      >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                            Module {m.month_number}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-white mb-1.5 line-clamp-1 group-hover:text-cyan-400 transition-colors">{m.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">{m.description || 'Module curriculum contents.'}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono font-normal">
                          <PlayCircle className="w-3.5 h-3.5 text-cyan-400" /> {m.lessons?.[0]?.count || 0} Lessons
                        </span>
                        <span className="text-xs font-medium text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Open <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })
                ) : (
                  <div className="col-span-full p-8 text-center text-slate-400 glass-panel rounded-2xl font-normal">
                    Loading course modules...
                  </div>
                )}
              </div>
            </div>

            {/* Assignments & Grades Overview */}
            {studentSubmissions && studentSubmissions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" /> Assignment Marks & Feedback
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {studentSubmissions.filter((s) => s.status === 'approved').length} of {studentSubmissions.length} approved
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentSubmissions.map((sub) => {
                    const latestReview = sub.submission_reviews?.[0];
                    const lesson = sub.lessons;
                    const mod = lesson?.modules;
                    const maxMarks = lesson?.task_marks || 100;
                    const modSlug = mod?.slug || (mod?.title ? slugify(mod.title) : `module-${mod?.month_number || 1}`);
                    const lessonSlug = lesson?.slug || (lesson?.title ? slugify(lesson.title) : lesson?.id);

                    const statusCfg = {
                      submitted: { label: 'Awaiting Review', cls: 'bg-amber-950/70 text-amber-400 border-amber-800', icon: Clock },
                      under_review: { label: 'Under Review', cls: 'bg-blue-950/70 text-blue-400 border-blue-800', icon: RefreshCw },
                      approved: { label: 'Approved & Graded', cls: 'bg-emerald-950/70 text-emerald-400 border-emerald-800', icon: CheckCircle2 },
                      rejected: { label: 'Revision Needed', cls: 'bg-red-950/70 text-red-400 border-red-800', icon: XCircle },
                    }[sub.status] || { label: 'Submitted', cls: 'bg-amber-950 text-amber-400 border-amber-800', icon: Clock };
                    const StatusIcon = statusCfg.icon;

                    return (
                      <div
                        key={sub.id}
                        className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {mod ? `Module ${mod.month_number}` : 'Assignment'}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-medium ${statusCfg.cls}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusCfg.label}
                            </span>
                          </div>

                          <h4 className="text-sm font-semibold text-white mb-1">
                            {lesson?.title || 'Assignment'}
                          </h4>

                          {latestReview?.score !== null && latestReview?.score !== undefined && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-yellow-950/60 border border-yellow-800/60 text-yellow-400 font-mono text-xs font-bold">
                              <Award className="w-3.5 h-3.5" />
                              Marks: {latestReview.score} / {maxMarks}
                            </div>
                          )}

                          {latestReview?.feedback && (
                            <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                              <span className="text-slate-500 font-medium">Feedback: </span>
                              {latestReview.feedback}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(sub.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          {lesson && (
                            <Link
                              href={`/dashboard/module/${modSlug}/lesson/${lessonSlug}`}
                              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
                            >
                              View Lesson & Feedback <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Announcements Section */}
            {announcements && announcements.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-base font-medium text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-400" /> Course Announcements
                </h3>
                <div className="space-y-3">
                  {announcements.map((anc) => (
                    <div key={anc.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-sm font-medium text-white mb-1">{anc.title}</div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">{anc.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONDITION 3: UNENROLLED VISITOR */}
        {!isPending && !isActive && (
          <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center max-w-2xl mx-auto space-y-6">
            <CreditCard className="w-12 h-12 text-cyan-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Enrollment Required</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              You are currently signed in, but you haven&apos;t completed checkout for the Frontend Development flagship program yet.
            </p>
            <Link
              href="/checkout"
              className="inline-flex px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all gap-2 text-sm"
            >
              Proceed to bKash Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
