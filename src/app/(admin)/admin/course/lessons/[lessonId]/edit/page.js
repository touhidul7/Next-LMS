'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveLessonAction, getLessonResourcesAction } from '@/app/actions/curriculum';
import { verifyVideoAction } from '@/app/actions/google-drive';
import { ArrowLeft, Save, Video, CheckCircle2, AlertCircle, RefreshCw, FileText, Plus, Trash2, FileCode, BookMarked } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import RichTextEditor from '@/components/ui/RichTextEditor';

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId;

  const [lesson, setLesson] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const [videoInput, setVideoInput] = useState('');

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: weeksData } = await supabase.from('weeks').select('*').order('week_number', { ascending: true });
      setWeeks(weeksData || []);

      if (lessonId && lessonId !== 'new') {
        const { data: lessonData } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
        if (lessonData) {
          setLesson(lessonData);
          setVideoInput(lessonData.video_external_id || '');
        }

        const resData = await getLessonResourcesAction(lessonId);
        if (resData && resData.length > 0) {
          setReferences(resData.map((r) => ({ title: r.title, description: r.description || '', url: r.url })));
        }
      }
      setLoading(false);
    }
    loadData();
  }, [lessonId]);

  function addReference() {
    setReferences([...references, { title: '', description: '', url: '' }]);
  }

  function removeReference(index) {
    setReferences(references.filter((_, i) => i !== index));
  }

  function updateReference(index, field, value) {
    const updated = [...references];
    updated[index][field] = value;
    setReferences(updated);
  }

  async function handleVerifyVideo() {
    if (!videoInput) {
      toast.error('Please enter a Google Drive URL or File ID');
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    const res = await verifyVideoAction(videoInput);
    setVerifying(false);

    if (res?.error) {
      toast.error(res.error);
      setVerificationResult({ valid: false, error: res.error });
    } else {
      toast.success(`Video verified: ${res.filename}`);
      setVerificationResult(res);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.target);
    const res = await saveLessonAction(formData);

    setSaving(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success || 'Lesson saved!');
      router.push('/admin/course/lessons');
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-[#fa8b98] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <Link href="/admin/course/lessons" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Lessons List
            </Link>
            <h1 className="text-2xl font-extrabold text-white">
              {lesson ? `Edit Lesson: ${lesson.title}` : 'Create New Lesson'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {lesson?.id && <input type="hidden" name="id" value={lesson.id} />}
          <input type="hidden" name="referencesJson" value={JSON.stringify(references)} />

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white mb-2">Lesson Basic Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Curriculum Week *</label>
                <select
                  name="weekId"
                  defaultValue={lesson?.week_id || ''}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98]"
                >
                  <option value="">Select Week...</option>
                  {weeks.map((w) => (
                    <option key={w.id} value={w.id}>
                      Week {w.week_number} — {w.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Lesson Type</label>
                <select
                  name="lessonType"
                  defaultValue={lesson?.lesson_type || 'video'}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98]"
                >
                  <option value="video">Video Lesson</option>
                  <option value="live_class">Live Class (Zoom Meeting)</option>
                  <option value="reading">Reading / Article</option>
                  <option value="practice">Guided Practice</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Lesson Title *</label>
              <input
                type="text"
                name="title"
                defaultValue={lesson?.title || ''}
                required
                placeholder="e.g. Assignment 6 Requirements - Batch 4 - CoderFlix"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Overview / Summary (Rich Text)
              </label>
              <RichTextEditor
                name="summary"
                defaultValue={lesson?.summary || ''}
                placeholder="Enter lesson overview, learning objectives, and summary..."
                rows={5}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  value="true"
                  defaultChecked={lesson ? lesson.is_published : true}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#fa8b98] focus:ring-[#fa8b98]"
                />
                <div>
                  <div className="text-xs font-bold text-white">Publish Lesson to Students</div>
                  <div className="text-[11px] text-slate-400">Make this lesson visible in student learning portal</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPreview"
                  value="true"
                  defaultChecked={lesson ? lesson.is_preview : false}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#fa8b98] focus:ring-[#fa8b98]"
                />
                <div>
                  <div className="text-xs font-bold text-white">Free Preview Lesson</div>
                  <div className="text-[11px] text-slate-400">Allow non-enrolled students to preview before buying</div>
                </div>
              </label>
            </div>
          </div>

          {/* Lesson Task / Assignment Section */}
          <div className="glass-panel p-6 rounded-2xl border border-amber-900/40 bg-gradient-to-b from-amber-950/10 to-slate-950/80 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <FileCode className="w-4 h-4" /> Lesson Task / Assignment Details (Optional)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Task Title</label>
                <input
                  type="text"
                  name="taskTitle"
                  defaultValue={lesson?.task_title || ''}
                  placeholder="e.g. Reactive Accelerator - Batch 4 - Assignment 6 - CoderFlix"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Total Marks</label>
                <input
                  type="number"
                  name="taskMarks"
                  defaultValue={lesson?.task_marks || 100}
                  placeholder="100"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Task Deadline / Due Date</label>
              <input
                type="datetime-local"
                name="taskDueDate"
                defaultValue={lesson?.task_due_date ? new Date(lesson.task_due_date).toISOString().slice(0, 16) : ''}
                className="w-full sm:w-72 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Task Requirements & Instructions (Rich Text)
              </label>
              <RichTextEditor
                name="taskInstructions"
                defaultValue={lesson?.task_instructions || ''}
                placeholder="Detail the task instructions, requirements, deliverables, and submission guidelines..."
                rows={6}
              />
            </div>
          </div>

          {/* Lesson References Section */}
          <div className="glass-panel p-6 rounded-2xl border border-purple-900/40 bg-gradient-to-b from-purple-950/10 to-slate-950/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <BookMarked className="w-4 h-4" /> Lesson References & Resource Links (Optional)
              </div>
              <button
                type="button"
                onClick={addReference}
                className="px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 font-bold text-xs hover:bg-purple-900 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Reference
              </button>
            </div>

            {references.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No reference links added yet. Click &quot;Add Reference&quot; to add external links.</p>
            ) : (
              <div className="space-y-3">
                {references.map((ref, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300">Reference #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeReference(idx)}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950 transition-colors"
                        title="Delete Reference"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Title</label>
                        <input
                          type="text"
                          value={ref.title}
                          onChange={(e) => updateReference(idx, 'title', e.target.value)}
                          placeholder="e.g. Next.js Routing Documentation"
                          className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">URL / Link</label>
                        <input
                          type="url"
                          value={ref.url}
                          onChange={(e) => updateReference(idx, 'url', e.target.value)}
                          placeholder="https://nextjs.org/docs/app"
                          className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Short Description</label>
                      <input
                        type="text"
                        value={ref.description}
                        onChange={(e) => updateReference(idx, 'description', e.target.value)}
                        placeholder="Brief explanation of this reference"
                        className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Provider & Verification Section (Section 28 & 29 of Spec) */}
          <div className="glass-panel p-6 rounded-2xl border border-[#fa8b98]/30 bg-gradient-to-b from-[#fa8b98]/5 to-slate-950/80 space-y-4">
            <div className="flex items-center gap-2 text-[#fa8b98] font-bold text-xs uppercase tracking-wider">
              <Video className="w-4 h-4" /> Google Drive Private Video Integration
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Video Provider</label>
                <select
                  name="videoProvider"
                  defaultValue={lesson?.video_provider || 'google_drive'}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98]"
                >
                  <option value="google_drive">Google Drive</option>
                  <option value="bunny_stream">Bunny Stream (CDN)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Google Drive File URL or File ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="videoExternalId"
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                    placeholder="e.g. https://drive.google.com/file/d/1A2B3C4D5E6F/view"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-[#fa8b98]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyVideo}
                    disabled={verifying}
                    className="px-4 py-2.5 rounded-lg bg-[#fa8b98]/10 border border-[#fa8b98]/30 text-[#f09fa1] font-bold text-xs hover:bg-[#fa8b98]/20 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {verifying ? 'Verifying...' : 'Verify Video'}
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Result Feedback */}
            {verificationResult && (
              <div className={`p-4 rounded-xl text-xs border ${verificationResult.valid ? 'bg-[#fa8b98]/10/60 border-[#fa8b98]/30 text-[#f09fa1]' : 'bg-red-950/60 border-red-800 text-red-300'}`}>
                {verificationResult.valid ? (
                  <div className="space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#fa8b98]" /> Video Verified Successfully!
                    </div>
                    <div>Filename: <strong className="text-white">{verificationResult.filename}</strong></div>
                    <div>Normalized Drive ID: <code className="font-mono text-[#f09fa1]">{verificationResult.fileId}</code></div>
                    <div>Account: <span className="text-slate-300">{verificationResult.connectedAccount}</span></div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{verificationResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
            <Link href="/admin/course/lessons" className="px-5 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#175cff] to-[#fa8b98] text-white font-extrabold hover:shadow-lg hover:shadow-[#fa8b98]/20 text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving Lesson...' : 'Save Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
