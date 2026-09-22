'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveLessonAction, getLessonResourcesAction } from '@/app/actions/curriculum';
import { verifyVideoAction } from '@/app/actions/google-drive';
import { ArrowLeft, Save, Video, CheckCircle2, AlertCircle, RefreshCw, FileText, Plus, Trash2, FileCode, BookMarked, Radio, ExternalLink, Calendar, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import RichTextEditor from '@/components/ui/RichTextEditor';

export default function EditCourseLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId;
  const lessonId = params.lessonId;

  const [lesson, setLesson] = useState(null);
  const [modules, setModules] = useState([]);
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const [videoInput, setVideoInput] = useState('');
  const [lessonType, setLessonType] = useState('video');
  const [zoomLink, setZoomLink] = useState('');
  const [liveMeetingDate, setLiveMeetingDate] = useState('');
  const [summaryMarkdown, setSummaryMarkdown] = useState('');
  const [taskInstructionsMarkdown, setTaskInstructionsMarkdown] = useState('');

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('month_number', { ascending: true });
      setModules(modulesData || []);

      if (lessonId && lessonId !== 'new') {
        const { data: lessonData } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
        if (lessonData) {
          setLesson(lessonData);
          setLessonType(lessonData.lesson_type || 'video');
          setZoomLink(lessonData.zoom_link || '');
          setLiveMeetingDate(lessonData.live_meeting_date ? new Date(lessonData.live_meeting_date).toISOString().slice(0, 16) : '');
          setVideoInput(lessonData.video_external_id || '');
          setSummaryMarkdown(lessonData.summary || '');
          setTaskInstructionsMarkdown(lessonData.task_instructions || '');
        }

        const resData = await getLessonResourcesAction(lessonId);
        if (resData && resData.length > 0) {
          setReferences(resData.map((r) => ({ title: r.title, description: r.description || '', url: r.url })));
        }
      }
      setLoading(false);
    }
    loadData();
  }, [courseId, lessonId]);

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
    formData.set('summary', summaryMarkdown);
    formData.set('taskInstructions', taskInstructionsMarkdown);

    const res = await saveLessonAction(formData);

    setSaving(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success || 'Lesson saved!');
      router.push(`/admin/courses/${courseId}/lessons`);
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#fa8b98] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 sm:p-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/courses/${courseId}/lessons`}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="text-xs font-bold text-[#fa8b98] uppercase tracking-wider">Lesson Editor</div>
            <h1 className="text-2xl font-extrabold text-white">
              {lesson ? `Edit Lesson: ${lesson.title}` : 'Create New Lesson'}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {lesson?.id && <input type="hidden" name="id" value={lesson.id} />}
        <input type="hidden" name="referencesJson" value={JSON.stringify(references)} />

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white mb-2">Lesson Basic Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Parent Module *</label>
              <select
                name="moduleId"
                defaultValue={lesson?.module_id || ''}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98]"
              >
                <option value="">Select Parent Module...</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    Module {m.month_number} — {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Lesson Type *</label>
              <select
                name="lessonType"
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98]"
              >
                <option value="video">Recorded Video Lesson (Google Drive)</option>
                <option value="live_class">Live Class (Zoom + Drive Recording)</option>
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
              placeholder="e.g. Setting up HTML5 Project & Head Tags"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Position Serial</label>
              <input
                type="number"
                name="position"
                defaultValue={lesson?.position || 1}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-[#fa8b98]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Duration (Seconds)</label>
              <input
                type="number"
                name="durationSeconds"
                defaultValue={lesson?.video_duration_seconds || 0}
                placeholder="e.g. 1347 for 22m 27s"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-[#fa8b98]"
              />
            </div>
          </div>
        </div>

        {/* Live Class Configuration (Shown if Live Class is selected) */}
        {lessonType === 'live_class' && (
          <div className="glass-panel p-6 rounded-2xl border border-purple-800/80 bg-gradient-to-r from-purple-950/20 to-slate-950/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-400 animate-pulse" /> Live Class & Zoom Configuration
              </h3>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300">
                Interactive Session
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Zoom Meeting Link *
                </label>
                <input
                  type="url"
                  name="zoomLink"
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  required={lessonType === 'live_class'}
                  placeholder="https://zoom.us/j/1234567890?pwd=..."
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Students will see a &quot;Join Live Class on Zoom&quot; button with this link.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Scheduled Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="liveMeetingDate"
                  value={liveMeetingDate}
                  onChange={(e) => setLiveMeetingDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  When the live session will take place.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Video Source (Always available for recorded videos, or for uploading live class recording from Drive) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-[#fa8b98]" />
              {lessonType === 'live_class'
                ? 'Live Class Recording (Google Drive) — Optional'
                : 'Google Drive Video Source'}
            </h3>
            {lessonType === 'live_class' && (
              <span className="text-[11px] text-slate-400">
                {videoInput ? 'Recording Available' : 'Upload when session finishes'}
              </span>
            )}
          </div>

          {lessonType === 'live_class' && (
            <p className="text-xs text-slate-400 leading-relaxed">
              Once the live session has concluded, enter the Google Drive video link or File ID here. The lesson player will automatically play the recorded video for students!
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Google Drive File ID or Share URL {lessonType === 'live_class' ? '(Optional)' : '*'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="videoExternalId"
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                required={lessonType === 'video'}
                placeholder="https://drive.google.com/file/d/1A2B3C4D.../view or 1A2B3C4D..."
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-[#fa8b98]"
              />
              <button
                type="button"
                onClick={handleVerifyVideo}
                disabled={verifying}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#fa8b98] font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Verify Video
              </button>
            </div>
          </div>

          {verificationResult && (
            <div
              className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                verificationResult.valid
                  ? 'bg-[#fa8b98]/10/60 border-[#fa8b98]/30 text-[#f09fa1]'
                  : 'bg-red-950/60 border-red-800 text-red-300'
              }`}
            >
              {verificationResult.valid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#fa8b98] shrink-0" />
                  <div>
                    <div className="font-bold">Verified File: {verificationResult.filename}</div>
                    <div className="text-[11px] text-[#fa8b98]/80">
                      ID: {verificationResult.fileId} | Size: {Math.round((verificationResult.size || 0) / 1024 / 1024)} MB
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Verification Failed: {verificationResult.error}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Overview / Summary Rich Text */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#fa8b98]" /> Lesson Summary (Overview Tab)
          </h3>
          <RichTextEditor
            value={summaryMarkdown}
            onChange={setSummaryMarkdown}
            placeholder="Write a comprehensive lesson overview with headings, code blocks, lists, and formatting..."
          />
        </div>

        {/* Optional Task / Assignment */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-yellow-400" /> Lesson Task / Assignment (Optional)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Task Title</label>
              <input
                type="text"
                name="taskTitle"
                defaultValue={lesson?.task_title || ''}
                placeholder="e.g. Build semantic HTML layout for intro website"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Total Marks</label>
              <input
                type="number"
                name="taskMarks"
                defaultValue={lesson?.task_marks || 100}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-[#fa8b98]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Task Instructions (Rich Text)</label>
            <RichTextEditor
              value={taskInstructionsMarkdown}
              onChange={setTaskInstructionsMarkdown}
              placeholder="Detail assignment instructions, required GitHub repo format, live demo requirements..."
            />
          </div>
        </div>

        {/* References */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-purple-400" /> Lesson References & Links
            </h3>
            <button
              type="button"
              onClick={addReference}
              className="px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 font-bold text-xs hover:bg-purple-900 transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Reference
            </button>
          </div>

          {references.map((ref, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeReference(idx)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-300 p-1"
                title="Remove Reference"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Reference Title *</label>
                  <input
                    type="text"
                    value={ref.title}
                    onChange={(e) => updateReference(idx, 'title', e.target.value)}
                    required
                    placeholder="e.g. MDN Web Docs — HTML5 Guide"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resource URL *</label>
                  <input
                    type="url"
                    value={ref.url}
                    onChange={(e) => updateReference(idx, 'url', e.target.value)}
                    required
                    placeholder="https://developer.mozilla.org/..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
          <Link
            href={`/admin/courses/${courseId}/lessons`}
            className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all text-xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#175cff] to-[#fa8b98] text-white font-extrabold text-xs hover:shadow-lg hover:shadow-[#fa8b98]/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Lesson
          </button>
        </div>
      </form>
    </div>
  );
}
