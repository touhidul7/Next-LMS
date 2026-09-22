'use client';

import { useState } from 'react';
import {
  ClipboardList,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  BookOpen,
  RefreshCw,
  Search,
  Award,
  MessageSquare,
  X,
  Send,
  Calendar,
} from 'lucide-react';
import GithubIcon from '@/components/ui/GithubIcon';
import { toast } from 'sonner';
import { reviewSubmissionAction } from '@/app/actions/curriculum';

const STATUS_CONFIG = {
  submitted: {
    label: 'Awaiting Review',
    icon: Clock,
    badgeCls: 'bg-amber-950/70 text-amber-400 border-amber-800/80',
    dotCls: 'bg-amber-400',
  },
  under_review: {
    label: 'Under Review',
    icon: RefreshCw,
    badgeCls: 'bg-blue-950/70 text-blue-400 border-blue-800/80',
    dotCls: 'bg-blue-400',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    badgeCls: 'bg-[#fa8b98]/10/70 text-[#fa8b98] border-[#fa8b98]/30/80',
    dotCls: 'bg-[#fa8b98]',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    badgeCls: 'bg-red-950/70 text-red-400 border-red-800/80',
    dotCls: 'bg-red-400',
  },
};

export default function SubmissionsClient({ initialSubmissions = [] }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Review form state
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  // Open modal and prepopulate latest review values if any
  const handleOpenReview = (sub) => {
    setSelectedSubmission(sub);
    const latestReview = sub.submission_reviews?.[0];
    if (latestReview) {
      setReviewStatus(latestReview.status_assigned || sub.status || 'approved');
      setScore(latestReview.score !== null && latestReview.score !== undefined ? String(latestReview.score) : '');
      setFeedback(latestReview.feedback || '');
    } else {
      setReviewStatus(sub.status === 'submitted' ? 'approved' : sub.status);
      setScore('');
      setFeedback('');
    }
  };

  const handleCloseReview = () => {
    setSelectedSubmission(null);
    setSaving(false);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSaving(true);
    const res = await reviewSubmissionAction(selectedSubmission.id, {
      status: reviewStatus,
      score: score.trim(),
      feedback: feedback.trim(),
    });
    setSaving(false);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success('Assignment review saved successfully!');

    // Update local state
    setSubmissions((prev) =>
      prev.map((item) => {
        if (item.id === selectedSubmission.id) {
          const newReview = {
            id: `temp-${Date.now()}`,
            score: score.trim() !== '' ? parseInt(score, 10) : null,
            feedback: feedback.trim(),
            status_assigned: reviewStatus,
            created_at: new Date().toISOString(),
          };
          return {
            ...item,
            status: reviewStatus,
            submission_reviews: [newReview, ...(item.submission_reviews || [])],
          };
        }
        return item;
      })
    );

    handleCloseReview();
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus !== 'all' && sub.status !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const studentName = sub.profiles?.full_name?.toLowerCase() || '';
      const studentEmail = sub.profiles?.email?.toLowerCase() || '';
      const lessonTitle = sub.lessons?.title?.toLowerCase() || '';
      if (!studentName.includes(q) && !studentEmail.includes(q) && !lessonTitle.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Summary counts
  const total = submissions.length;
  const countPending = submissions.filter((s) => s.status === 'submitted').length;
  const countApproved = submissions.filter((s) => s.status === 'approved').length;
  const countRejected = submissions.filter((s) => s.status === 'rejected').length;
  const countUnderReview = submissions.filter((s) => s.status === 'under_review').length;

  return (
    <div className="space-y-6">
      {/* Summary Badges */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
            filterStatus === 'all'
              ? 'bg-[#fa8b98]/10 text-[#fa8b98] border-[#fa8b98]/30 shadow-sm'
              : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          All Submissions <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono">{total}</span>
        </button>

        <button
          onClick={() => setFilterStatus('submitted')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
            filterStatus === 'submitted'
              ? 'bg-amber-950/70 text-amber-400 border-amber-700'
              : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          Awaiting Review <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-950 text-amber-400 font-mono text-[11px]">{countPending}</span>
        </button>

        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
            filterStatus === 'approved'
              ? 'bg-[#fa8b98]/10/70 text-[#fa8b98] border-[#fa8b98]/40'
              : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          Approved <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#fa8b98]/10 text-[#fa8b98] font-mono text-[11px]">{countApproved}</span>
        </button>

        <button
          onClick={() => setFilterStatus('under_review')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
            filterStatus === 'under_review'
              ? 'bg-blue-950/70 text-blue-400 border-blue-700'
              : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          Under Review <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-blue-950 text-blue-400 font-mono text-[11px]">{countUnderReview}</span>
        </button>

        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
            filterStatus === 'rejected'
              ? 'bg-red-950/70 text-red-400 border-red-700'
              : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          Rejected <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-950 text-red-400 font-mono text-[11px]">{countRejected}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search student, email, or lesson..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#fa8b98] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center">
          <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-normal">
            {submissions.length === 0 ? 'No submissions yet.' : 'No submissions match your filter.'}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {submissions.length === 0
              ? 'Students who submit assignments will appear here.'
              : 'Try changing your status filter or clearing your search term.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => {
            const statusConfig = STATUS_CONFIG[sub.status] || STATUS_CONFIG.submitted;
            const StatusIcon = statusConfig.icon;
            const latestReview = sub.submission_reviews?.[0];
            const maxMarks = sub.lessons?.task_marks || 100;
            const submittedAt = sub.created_at
              ? new Date(sub.created_at).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—';

            return (
              <div
                key={sub.id}
                className="glass-panel rounded-2xl border border-slate-800/80 p-5 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Student & Lesson Header */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                          {sub.profiles?.full_name || 'Unknown Student'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({sub.profiles?.email || '—'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                        <span className="text-[#fa8b98] font-medium flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          {sub.lessons?.title || 'Unknown Lesson'}
                        </span>
                        {sub.lessons?.modules && (
                          <span className="text-slate-500 font-mono">
                            • Module {sub.lessons.modules.month_number}: {sub.lessons.modules.title}
                          </span>
                        )}
                        <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3" /> {submittedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Links, Status & Action */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {/* Repository and Demo buttons */}
                    <div className="flex items-center gap-2">
                      {sub.github_repo_url && (
                        <a
                          href={sub.github_repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition-colors"
                          title="Open GitHub Repository"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                          <span>Code</span>
                        </a>
                      )}
                      {sub.live_deploy_url && (
                        <a
                          href={sub.live_deploy_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-[#f09fa1] font-medium transition-colors"
                          title="Open Live Deployment"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${statusConfig.badgeCls}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>

                    {/* Grade / Review Button */}
                    <button
                      onClick={() => handleOpenReview(sub)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#175cff] to-[#fa8b98] text-white font-semibold text-xs hover:shadow-lg hover:shadow-[#fa8b98]/20 transition-all"
                    >
                      <Award className="w-3.5 h-3.5" />
                      {latestReview ? 'Update Grade' : 'Grade Assignment'}
                    </button>
                  </div>
                </div>

                {/* Score & Feedback Preview if reviewed */}
                {latestReview && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-start gap-3 text-xs bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="px-2.5 py-1 rounded-lg bg-[#fa8b98]/10/80 border border-[#fa8b98]/30/70 text-[#f09fa1] font-mono font-semibold text-xs flex items-center gap-1">
                        <Award className="w-3 h-3 text-[#fa8b98]" />
                        Score:{' '}
                        {latestReview.score !== null && latestReview.score !== undefined
                          ? `${latestReview.score} / ${maxMarks}`
                          : 'Not scored'}
                      </div>
                    </div>

                    {latestReview.feedback ? (
                      <div className="flex-1 text-slate-300 font-normal">
                        <span className="text-slate-500 font-medium mr-1.5">Feedback:</span>
                        {latestReview.feedback}
                      </div>
                    ) : (
                      <div className="text-slate-500 italic">No written feedback provided yet.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review & Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#fa8b98]" />
                <h3 className="text-base font-semibold text-white">Grade Assignment Submission</h3>
              </div>
              <button
                onClick={handleCloseReview}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Student and Lesson Context Box */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Student</div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      {selectedSubmission.profiles?.full_name || 'Unknown Student'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {selectedSubmission.profiles?.email || '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Assignment</div>
                    <div className="text-sm font-semibold text-[#f09fa1] mt-0.5">
                      {selectedSubmission.lessons?.title || 'Unknown Lesson'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Max Marks: {selectedSubmission.lessons?.task_marks || 100}
                    </div>
                  </div>
                </div>

                {/* Submission Links */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-2">
                  {selectedSubmission.github_repo_url && (
                    <a
                      href={selectedSubmission.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition-colors"
                    >
                      <GithubIcon className="w-3.5 h-3.5" /> View Code on GitHub ↗
                    </a>
                  )}
                  {selectedSubmission.live_deploy_url && (
                    <a
                      href={selectedSubmission.live_deploy_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-[#f09fa1] font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Live Deployment ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Grading Form */}
              <form id="review-form" onSubmit={handleSaveReview} className="space-y-5">
                {/* Decision / Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Review Decision *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'approved', label: 'Approve', icon: CheckCircle2, cls: 'text-[#fa8b98] hover:border-[#fa8b98]' },
                      { id: 'under_review', label: 'Under Review', icon: RefreshCw, cls: 'text-blue-400 hover:border-blue-500' },
                      { id: 'rejected', label: 'Request Changes', icon: XCircle, cls: 'text-red-400 hover:border-red-500' },
                      { id: 'submitted', label: 'Submitted', icon: Clock, cls: 'text-amber-400 hover:border-amber-500' },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const active = reviewStatus === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setReviewStatus(opt.id)}
                          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            active
                              ? 'bg-slate-800 border-[#fa8b98] shadow-sm text-white ring-1 ring-[#fa8b98]/50'
                              : `bg-slate-950/80 border-slate-800 ${opt.cls}`
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Score Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Score / Marks
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Out of {selectedSubmission.lessons?.task_marks || 100} marks
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={selectedSubmission.lessons?.task_marks || 100}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder={`e.g. 85`}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-[#fa8b98] transition-colors"
                  />
                </div>

                {/* Feedback Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Mentor Feedback & Notes
                  </label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback, suggestions for improvement, or commend strengths in the code..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#fa8b98] transition-colors resize-none leading-relaxed"
                  />
                </div>
              </form>

              {/* Review History */}
              {selectedSubmission.submission_reviews && selectedSubmission.submission_reviews.length > 0 && (
                <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Previous Review History
                  </div>
                  <div className="space-y-2">
                    {selectedSubmission.submission_reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>Status: <strong className="text-white">{rev.status_assigned}</strong></span>
                          <span>Score: <strong className="text-[#fa8b98]">{rev.score !== null ? rev.score : 'N/A'}</strong></span>
                          <span>
                            {new Date(rev.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {rev.feedback && <p className="text-slate-300 mt-1">{rev.feedback}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseReview}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="review-form"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#175cff] to-[#fa8b98] text-white font-semibold text-xs hover:shadow-lg hover:shadow-[#fa8b98]/20 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Save Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
