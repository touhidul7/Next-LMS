'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { getLessonViewerDataAction, getStudentSubmissionForLessonAction } from '@/app/actions/curriculum';
import { slugify } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  BookOpen,
  AlertCircle,
  RefreshCw,
  FileText,
  FileCode,
  Volume2,
  VolumeX,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Search,
  Circle,
  Award,
  Clock,
  XCircle,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import GithubIcon from '@/components/ui/GithubIcon';

const PROGRESS_SAVE_INTERVAL_MS = 15000;
const isUuid = (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val || '');

export default function StudentLessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { moduleId, lessonId } = params;

  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const progressTimerRef = useRef(null);

  const [lesson, setLesson] = useState(null);
  const [moduleData, setModuleData] = useState(null);
  const [courseModulesList, setCourseModulesList] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [user, setUser] = useState(null);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Mouse dragging states for progress bar & volume slider
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  // Tabs & Task state
  const [activeTab, setActiveTab] = useState('overview');
  const [references, setReferences] = useState([]);
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [showResubmitForm, setShowResubmitForm] = useState(false);

  useEffect(() => {
    async function loadLessonData() {
      const supabase = createClient();

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (!currentUser) {
        router.push('/login');
        return;
      }

      // Fetch lesson, modules, and references via server action (bypasses RLS issues)
      const data = await getLessonViewerDataAction(lessonId, moduleId);
      if (data?.error || !data?.lesson) {
        setError(data?.error || 'Lesson not found.');
        setLoading(false);
        return;
      }

      setLesson(data.lesson);
      setModuleData(data.moduleData);
      setReferences(data.references || []);

      // Fetch student's assignment submission & marks if any
      const subData = await getStudentSubmissionForLessonAction(data.lesson.id);
      if (subData?.submission) {
        setSubmission(subData.submission);
        setGithubUrl(subData.submission.github_repo_url || '');
        setLiveUrl(subData.submission.live_deploy_url || '');
      }

      // Fetch lesson progress for currentUser
      const { data: allProgress } = await supabase
        .from('lesson_progress')
        .select('lesson_id, is_completed, watched_seconds')
        .eq('user_id', currentUser.id);

      const progressMap = new Map((allProgress || []).map((p) => [p.lesson_id, p]));

      // Update courseModulesList with isCompleted
      const populatedModules = (data.courseModulesList || []).map((mod) => ({
        ...mod,
        lessons: (mod.lessons || []).map((l) => ({
          ...l,
          isCompleted: !!progressMap.get(l.id)?.is_completed,
        })),
      }));

      setCourseModulesList(populatedModules);
      if (data.moduleData?.id) {
        setExpandedModules((prev) => ({
          ...prev,
          [data.moduleData.id]: true,
        }));
      }

      const currentProgress = progressMap.get(data.lesson.id);
      if (currentProgress) {
        setIsCompleted(currentProgress.is_completed);
        if (currentProgress.watched_seconds > 0 && videoRef.current) {
          videoRef.current.currentTime = currentProgress.watched_seconds;
        }
      }

      setLoading(false);
    }

    loadLessonData();

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [lessonId, moduleId, router]);

  // Save watch progress to database
  const saveProgress = useCallback(async (completed = false) => {
    if (!user || !lesson?.id || !videoRef.current) return;

    const watchedSeconds = Math.floor(videoRef.current.currentTime);
    const supabase = createClient();

    await supabase.from('lesson_progress').upsert(
      {
        user_id: user.id,
        lesson_id: lesson.id,
        watched_seconds: watchedSeconds,
        is_completed: completed || isCompleted,
        completed_at: completed ? new Date().toISOString() : null,
        last_accessed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    );
  }, [user, lesson, isCompleted]);

  const handleMarkComplete = async () => {
    if (!user || !lesson?.id || isCompleted) return;
    setMarkingComplete(true);
    const supabase = createClient();
    await supabase.from('lesson_progress').upsert(
      {
        user_id: user.id,
        lesson_id: lesson.id,
        watched_seconds: Math.floor(videoRef.current?.currentTime || 0),
        is_completed: true,
        completed_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    );
    setIsCompleted(true);
    setMarkingComplete(false);
  };

  async function handleTaskSubmit(e) {
    e.preventDefault();
    if (!githubUrl) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }
    if (!lesson?.id) return;
    setSubmittingTask(true);
    const { submitTaskAction, getStudentSubmissionForLessonAction } = await import('@/app/actions/curriculum');
    const res = await submitTaskAction(lesson.id, githubUrl, liveUrl);
    setSubmittingTask(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success('Assignment submitted successfully!');
      setShowResubmitForm(false);
      const updated = await getStudentSubmissionForLessonAction(lesson.id);
      if (updated?.submission) {
        setSubmission(updated.submission);
      }
    }
  }

  // Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) videoRef.current.play();
          else videoRef.current.pause();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 10);
        }
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        const container = document.getElementById('video-container');
        if (!document.fullscreenElement) {
          container?.requestFullscreen();
          setIsFullscreen(true);
        } else {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Video event handlers
  function handleVideoPlay() {
    setIsPlaying(true);
    setIsBuffering(false);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      saveProgress(false);
    }, PROGRESS_SAVE_INTERVAL_MS);
  }

  function handleVideoPause() {
    setIsPlaying(false);
    setIsBuffering(false);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    saveProgress(false);
  }

  function handleVideoEnded() {
    setIsPlaying(false);
    setIsBuffering(false);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (!isCompleted) {
      setIsCompleted(true);
      saveProgress(true);
    }
  }

  function handleTimeUpdate() {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }

  function handleLoadedMetadata() {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }

  function togglePlay() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }

  function seek(seconds) {
    if (!videoRef.current) return;
    const targetTime = Math.max(0, Math.min(duration || 0, (videoRef.current.currentTime || 0) + seconds));
    let isAlreadyBuffered = false;
    const buffered = videoRef.current.buffered;
    if (buffered && buffered.length > 0) {
      for (let i = 0; i < buffered.length; i++) {
        if (targetTime >= buffered.start(i) && targetTime <= buffered.end(i)) {
          isAlreadyBuffered = true;
          break;
        }
      }
    }
    if (!isAlreadyBuffered) {
      setIsBuffering(true);
    }
    videoRef.current.currentTime = targetTime;
  }

  // --- MOUSE DRAGGABLE TIMELINE PROGRESS BAR ---
  const handleProgressSeek = useCallback(
    (e) => {
      if (!progressBarRef.current || !duration) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (videoRef.current) {
        videoRef.current.currentTime = ratio * duration;
      }
    },
    [duration]
  );

  const handleProgressMouseDown = (e) => {
    setIsDraggingProgress(true);
    handleProgressSeek(e);
  };

  useEffect(() => {
    if (!isDraggingProgress) return;
    const handleMouseMove = (e) => handleProgressSeek(e);
    const handleMouseUp = () => setIsDraggingProgress(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingProgress, handleProgressSeek]);

  // --- MOUSE DRAGGABLE VOLUME SLIDER ---
  const handleVolumeSeek = useCallback((e) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(v);
    setIsMuted(v === 0);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
  }, []);

  const handleVolumeMouseDown = (e) => {
    setIsDraggingVolume(true);
    handleVolumeSeek(e);
  };

  useEffect(() => {
    if (!isDraggingVolume) return;
    const handleMouseMove = (e) => handleVolumeSeek(e);
    const handleMouseUp = () => setIsDraggingVolume(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingVolume, handleVolumeSeek]);

  function toggleMute() {
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  }

  function handleSpeedChange(rate) {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  }

  function handleFullscreen() {
    const container = document.getElementById('video-container');
    if (!document.fullscreenElement) {
      container?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatDurationMinutes = (seconds) => {
    if (!seconds) return '0 min';
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

  const toggleModuleAccordion = (mId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [mId]: !prev[mId],
    }));
  };

  // Flat lesson list for prev/next navigation
  const currentModule = courseModulesList.find((m) => m.id === (moduleData?.id || lesson?.module_id));
  const currentModuleLessons = currentModule?.lessons || [];
  const currentLessonIndex = currentModuleLessons.findIndex((l) => l.id === lesson?.id);
  const prevLesson = currentModuleLessons[currentLessonIndex - 1];
  const nextLesson = currentModuleLessons[currentLessonIndex + 1];

  const activeModuleSlug = moduleData
    ? moduleData.slug || slugify(moduleData.title) || `module-${moduleData.month_number}`
    : moduleId;
  const currentModSlug = currentModule
    ? currentModule.slug || slugify(currentModule.title) || `module-${currentModule.month_number}`
    : activeModuleSlug;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">{error || 'Lesson Not Found'}</h2>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col h-screen overflow-hidden">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur z-50 h-14 flex items-center shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Link
              href={`/dashboard/module/${activeModuleSlug}`}
              className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                Module {moduleData?.month_number} — {moduleData?.title}
              </span>
              <span className="sm:hidden">Back</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
              {lesson.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
            ) : (
              <button
                onClick={handleMarkComplete}
                disabled={markingComplete}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold hover:bg-emerald-900 transition-all disabled:opacity-50"
              >
                {markingComplete ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* LEFT EXPANDABLE MODULES SIDEBAR (Matching reference screenshot) */}
        <aside className="w-80 md:w-80 border-r border-slate-800/80 bg-[#090d16] flex flex-col shrink-0 overflow-hidden">
          {/* Back to Dashboard & Search */}
          <div className="p-3 border-b border-slate-800/80 space-y-2 bg-[#090d16]">
            <Link
              href="/dashboard"
              className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              ← BACK TO DASHBOARD
            </Link>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH LESSONS..."
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800/80 text-white font-mono text-[11px] uppercase placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          {/* Accordion Module List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {courseModulesList && courseModulesList.length > 0 ? (
              courseModulesList.map((mod) => {
                const isExpanded = Boolean(expandedModules[mod.id] || searchQuery.trim());
                const filteredLessons = searchQuery.trim()
                  ? mod.lessons.filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  : mod.lessons;

                const total = mod.lessons.length;
                const completed = mod.lessons.filter((l) => l.isCompleted).length;
                const totalSecs = mod.lessons.reduce((sum, l) => sum + (l.video_duration_seconds || 0), 0);
                const hrs = Math.floor(totalSecs / 3600);
                const mins = Math.floor((totalSecs % 3600) / 60);
                const durationText = hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;
                const progressRatio = total > 0 ? (completed / total) * 100 : 0;

                return (
                  <div
                    key={mod.id}
                    className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40"
                  >
                    {/* Module Accordion Header */}
                    <button
                      onClick={() => toggleModuleAccordion(mod.id)}
                      className="w-full p-3 text-left hover:bg-slate-900/60 transition-colors flex flex-col justify-between gap-1 group"
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="min-w-0">
                          <h4 className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-2">
                            Module {mod.month_number} - {mod.title}
                          </h4>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            {durationText}
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-[11px] font-mono font-medium text-slate-400">
                            {completed}/{total}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500 mt-1" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500 mt-1" />
                          )}
                        </div>
                      </div>

                      {/* Thin Progress Line under module header */}
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${progressRatio}%` }}
                        />
                      </div>
                    </button>

                    {/* Module Lessons List when expanded */}
                    {isExpanded && (
                      <div className="border-t border-slate-800/60 bg-slate-950/80 divide-y divide-slate-800/40">
                        {filteredLessons && filteredLessons.length > 0 ? (
                          filteredLessons.map((l, idx) => {
                            const isCurrent = l.id === lesson?.id;
                            const modSlug = mod.slug || slugify(mod.title) || `module-${mod.month_number}`;
                            const lSlug = l.slug || slugify(l.title) || l.id;
                            return (
                              <Link
                                key={l.id}
                                href={`/dashboard/module/${modSlug}/lesson/${lSlug}`}
                                className={`p-3 flex items-start gap-3 transition-colors ${
                                  isCurrent
                                    ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-white'
                                    : 'text-slate-300 hover:bg-slate-900/60 hover:text-white'
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {l.isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-600" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className={`text-xs font-medium line-clamp-2 ${isCurrent ? 'text-cyan-300' : 'text-slate-200'}`}>
                                    {l.position || idx + 1}. {l.title}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    {formatDurationMinutes(l.video_duration_seconds)}
                                  </div>
                                </div>
                              </Link>
                            );
                          })
                        ) : (
                          <div className="p-3 text-[11px] text-slate-500 text-center font-mono">
                            No matching lessons
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-xs text-slate-400 text-center">Loading modules...</div>
            )}
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto">
          {/* Video Player */}
          {lesson.lesson_type === 'video' && lesson.video_external_id && (
            <div
              id="video-container"
              className="relative bg-black w-full aspect-video group"
            >
              <video
                ref={videoRef}
                src={`/api/video/${lesson.id}`}
                className="w-full h-full object-contain cursor-pointer"
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoEnded}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => {
                  setIsPlaying(true);
                  setIsBuffering(false);
                }}
                onSeeking={() => setIsBuffering(true)}
                onSeeked={() => setIsBuffering(false)}
                onCanPlay={() => setIsBuffering(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onError={() => setVideoError('Failed to load video. Please check your connection or contact support.')}
                onClick={togglePlay}
                preload="auto"
                playsInline
              />

              {/* Video Buffering / Loading Overlay */}
              {isBuffering && !videoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] z-20 pointer-events-none transition-all">
                  <div className="relative flex items-center justify-center mb-3">
                    <div className="w-14 h-14 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                    <PlayCircle className="w-6 h-6 text-cyan-400 absolute opacity-80" />
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-cyan-900/60 text-xs font-bold text-cyan-300 flex items-center gap-2 shadow-2xl">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Loading video stream...</span>
                  </div>
                </div>
              )}

              {/* Video Error Overlay */}
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-30">
                  <div className="text-center space-y-3 p-6">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                    <p className="text-sm text-red-300 font-semibold">{videoError}</p>
                    <button
                      onClick={() => {
                        setVideoError(null);
                        setIsBuffering(true);
                        videoRef.current?.load();
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Video Controls with Draggable Timeline & Volume Slider */}
              {!videoError && (
                <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-30 flex flex-col select-none">
                  {/* Full-width Emerald Progress Bar across top of control bar (Mouse Draggable!) */}
                  <div
                    ref={progressBarRef}
                    onMouseDown={handleProgressMouseDown}
                    className="w-full h-1.5 bg-slate-700/80 cursor-pointer hover:h-2.5 transition-all relative overflow-hidden group/bar"
                  >
                    {isBuffering && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-emerald-400/60 to-emerald-500/30 animate-pulse" />
                    )}
                    <div
                      className="h-full bg-emerald-500 transition-all relative"
                      style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                    </div>
                  </div>

                  {/* Main Control Bar */}
                  <div className="bg-[#090d16]/95 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between text-slate-200">
                    {/* Left Controls */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Rewind 10s */}
                      <button
                        onClick={() => seek(-10)}
                        className="hover:text-white transition-colors p-1"
                        title="Rewind 10 seconds"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {/* Play / Pause Toggle */}
                      <button
                        onClick={togglePlay}
                        className="hover:text-white transition-colors p-1"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Forward 10s */}
                      <button
                        onClick={() => seek(10)}
                        className="hover:text-white transition-colors p-1"
                        title="Forward 10 seconds"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      {/* Volume Icon + Draggable Horizontal Emerald Volume Slider */}
                      <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="hover:text-white transition-colors p-1">
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4 text-slate-400" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>

                        <div
                          ref={volumeBarRef}
                          onMouseDown={handleVolumeMouseDown}
                          className="w-14 sm:w-16 h-3 rounded-full border border-emerald-500/60 bg-slate-900/90 p-[2px] cursor-pointer flex items-center relative overflow-hidden"
                        >
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Timestamp */}
                      <span className="text-xs font-mono text-slate-300 font-medium">
                        {formatTime(currentTime)}/{formatTime(duration)}
                      </span>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* HD Badge */}
                      <span className="px-1 py-0.2 border border-slate-300/80 text-[10px] font-black tracking-tight text-white rounded">
                        HD
                      </span>

                      {/* Playback Speed Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="text-xs font-bold hover:text-white transition-colors px-1 py-0.5"
                        >
                          {playbackRate}x
                        </button>
                        {showSpeedMenu && (
                          <div className="absolute bottom-full right-0 mb-2 w-20 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs font-semibold">
                            {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                              <button
                                key={rate}
                                onClick={() => handleSpeedChange(rate)}
                                className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 transition-colors ${
                                  playbackRate === rate ? 'text-emerald-400 font-bold' : 'text-slate-300'
                                }`}
                              >
                                {rate}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Fullscreen Toggle */}
                      <button
                        onClick={handleFullscreen}
                        className="hover:text-white transition-colors p-1"
                        title="Fullscreen"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lesson Content Area */}
          <div className="p-6 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
              <div className="text-xs font-mono font-medium text-red-400 uppercase tracking-wider mb-1">
                {moduleData?.title ? `${moduleData.title.toUpperCase()} / LESSON ${lesson.position}` : `LESSON ${lesson.position}`}
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{lesson.title}</h1>
            </div>

            {/* Dynamic Tabs */}
            {(() => {
              const hasTask = Boolean(lesson.task_title || lesson.task_instructions);
              const hasRefs = references && references.length > 0;
              const isDeadlinePassed = lesson.task_due_date ? new Date() > new Date(lesson.task_due_date) : false;

              return (
                <div>
                  <div className="flex items-center space-x-6 border-b border-slate-800 mb-6 font-medium text-xs uppercase tracking-wider">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`pb-3 border-b-2 transition-all ${
                        activeTab === 'overview'
                          ? 'border-yellow-400 text-yellow-400'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      OVERVIEW
                    </button>

                    {hasTask && (
                      <button
                        onClick={() => setActiveTab('assignment')}
                        className={`pb-3 border-b-2 transition-all ${
                          activeTab === 'assignment'
                            ? 'border-yellow-400 text-yellow-400'
                            : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        ASSIGNMENT
                      </button>
                    )}

                    {hasRefs && (
                      <button
                        onClick={() => setActiveTab('references')}
                        className={`pb-3 border-b-2 transition-all ${
                          activeTab === 'references'
                            ? 'border-yellow-400 text-yellow-400'
                            : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        REFERENCES
                      </button>
                    )}
                  </div>

                  {/* Tab Panels */}
                  {activeTab === 'overview' && (
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                      <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                        {lesson.summary || 'No overview provided for this lesson.'}
                      </div>
                      {lesson.content_markdown && (
                        <div className="pt-4 border-t border-slate-800 font-mono text-xs whitespace-pre-wrap text-slate-300">
                          {lesson.content_markdown}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'assignment' && hasTask && (
                    <div className="glass-panel p-8 rounded-2xl border border-slate-800 bg-slate-950/60 relative overflow-hidden space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-medium text-yellow-400 tracking-wider">ASSIGNMENT</div>
                        </div>
                        <div className="px-3 py-1 bg-yellow-950/80 border border-yellow-800/80 text-yellow-400 text-xs font-mono font-semibold rounded">
                          {lesson.task_marks || 100} MARKS
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-1">{lesson.task_title || lesson.title}</h3>

                      {lesson.task_due_date && (
                        <div className="text-xs text-slate-400 font-mono mb-4 uppercase tracking-wider">
                          DEADLINE {new Date(lesson.task_due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}

                      {/* Submission Status & Marks Card or Submission Form */}
                      {submission && !showResubmitForm ? (
                        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Your Submission:
                              </span>
                              {(() => {
                                const cfg = {
                                  submitted: {
                                    label: 'Submitted (Awaiting Review)',
                                    icon: Clock,
                                    cls: 'bg-amber-950/70 text-amber-400 border-amber-800',
                                  },
                                  under_review: {
                                    label: 'Under Review',
                                    icon: RefreshCw,
                                    cls: 'bg-blue-950/70 text-blue-400 border-blue-800',
                                  },
                                  approved: {
                                    label: 'Approved & Graded',
                                    icon: CheckCircle2,
                                    cls: 'bg-emerald-950/70 text-emerald-400 border-emerald-800',
                                  },
                                  rejected: {
                                    label: 'Revision Requested',
                                    icon: XCircle,
                                    cls: 'bg-red-950/70 text-red-400 border-red-800',
                                  },
                                }[submission.status] || {
                                  label: 'Submitted',
                                  icon: Clock,
                                  cls: 'bg-amber-950 text-amber-400 border-amber-800',
                                };
                                const Icon = cfg.icon;
                                return (
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.cls}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {cfg.label}
                                  </span>
                                );
                              })()}
                            </div>

                            <div className="text-[11px] text-slate-400 font-mono">
                              Submitted on {new Date(submission.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>

                          {/* Marks / Score & Feedback Card if reviewed */}
                          {submission.submission_reviews && submission.submission_reviews.length > 0 && (() => {
                            const latestReview = submission.submission_reviews[0];
                            return (
                              <div className="p-5 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900/90 border border-slate-800 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                                    <Award className="w-5 h-5 text-yellow-400" />
                                    <span>Mentor Evaluation & Marks</span>
                                  </div>
                                  {latestReview.score !== null && latestReview.score !== undefined && (
                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-950/70 border border-yellow-800/80 text-yellow-400 font-mono font-bold text-sm">
                                      <span>Score:</span>
                                      <span className="text-base text-yellow-300">
                                        {latestReview.score} / {lesson.task_marks || 100}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {latestReview.feedback ? (
                                  <div className="space-y-1.5">
                                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                                      <span>Feedback & Guidance:</span>
                                      {latestReview.profiles?.full_name && (
                                        <span className="text-slate-500 font-mono">
                                          By {latestReview.profiles.full_name}
                                        </span>
                                      )}
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                                      {latestReview.feedback}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-500 italic">No written feedback provided.</div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Submitted Links */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="flex flex-wrap items-center gap-2.5">
                              {submission.github_repo_url && (
                                <a
                                  href={submission.github_repo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition-colors"
                                >
                                  <GithubIcon className="w-4 h-4" /> Submitted Code ↗
                                </a>
                              )}
                              {submission.live_deploy_url && (
                                <a
                                  href={submission.live_deploy_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/70 text-xs text-cyan-300 font-medium transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" /> Live Deployment ↗
                                </a>
                              )}
                            </div>

                            {!isDeadlinePassed && (
                              <button
                                type="button"
                                onClick={() => setShowResubmitForm(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white font-medium transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Resubmit / Update Links
                              </button>
                            )}
                          </div>
                        </div>
                      ) : isDeadlinePassed ? (
                        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium">
                          <div className="font-semibold uppercase tracking-wider mb-1 text-red-400">DEADLINE PASSED</div>
                          Submissions closed on {new Date(lesson.task_due_date).toLocaleString()}. You can no longer submit this assignment.
                        </div>
                      ) : (
                        <form onSubmit={handleTaskSubmit} className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-white flex items-center gap-2">
                              <FileCode className="w-4 h-4 text-cyan-400" /> {submission ? 'Update Your Assignment Submission' : 'Submit Assignment Requirements'}
                            </div>
                            {submission && (
                              <button
                                type="button"
                                onClick={() => setShowResubmitForm(false)}
                                className="text-xs text-slate-400 hover:text-white transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Repository URL *</label>
                              <input
                                type="url"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                required
                                placeholder="https://github.com/username/repository"
                                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1">Live Deployment URL (Optional)</label>
                              <input
                                type="url"
                                value={liveUrl}
                                onChange={(e) => setLiveUrl(e.target.value)}
                                placeholder="https://my-app.vercel.app"
                                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-3">
                            {submission && (
                              <button
                                type="button"
                                onClick={() => setShowResubmitForm(false)}
                                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              type="submit"
                              disabled={submittingTask}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold text-xs hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50"
                            >
                              {submittingTask ? 'Submitting...' : submission ? 'Update Submission' : 'Submit Assignment'}
                            </button>
                          </div>
                        </form>
                      )}

                      {lesson.task_instructions && (
                        <div className="pt-6 border-t border-slate-800 space-y-3">
                          <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider">Instructions & Guidelines</h4>
                          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                            {lesson.task_instructions}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'references' && hasRefs && (
                    <div className="space-y-4">
                      {references.map((ref, idx) => (
                        <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-start justify-between gap-4 hover:border-purple-500/40 transition-all">
                          <div>
                            <h4 className="text-sm font-medium text-white">{ref.title}</h4>
                            {ref.description && <p className="text-xs text-slate-400 mt-1">{ref.description}</p>}
                            <div className="text-[11px] text-purple-400 font-mono mt-2 truncate max-w-md">{ref.url}</div>
                          </div>
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-purple-950 border border-purple-800 text-purple-300 font-medium text-xs hover:bg-purple-900 transition-all shrink-0 flex items-center gap-1.5"
                          >
                            Open Link ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
              {prevLesson ? (
                <Link
                  href={`/dashboard/module/${currentModSlug}/lesson/${prevLesson.slug || slugify(prevLesson.title) || prevLesson.id}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-all text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev:</span>
                  <span className="truncate max-w-[150px]">{prevLesson.title}</span>
                </Link>
              ) : (
                <Link
                  href={`/dashboard/module/${activeModuleSlug}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-all text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Module Overview
                </Link>
              )}

              {nextLesson ? (
                <Link
                  href={`/dashboard/module/${currentModSlug}/lesson/${nextLesson.slug || slugify(nextLesson.title) || nextLesson.id}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all text-sm"
                >
                  <span className="truncate max-w-[150px]">{nextLesson.title}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>
              ) : (
                <Link
                  href={`/dashboard/module/${activeModuleSlug}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Finish Module
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
