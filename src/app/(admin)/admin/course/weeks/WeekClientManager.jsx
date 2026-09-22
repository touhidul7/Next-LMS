'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BookOpen, ShieldCheck, Pencil, Trash2, Plus, X, RefreshCw } from 'lucide-react';
import { saveWeekAction, deleteWeekAction } from '@/app/actions/curriculum';

export default function WeekClientManager({ initialModules = [], initialWeeks = [] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [editingWeek, setEditingWeek] = useState(null);
  const [moduleId, setModuleId] = useState('');
  const [weekNumber, setWeekNumber] = useState(1);
  const [position, setPosition] = useState(1);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const startEdit = (w) => {
    setEditingWeek(w);
    setModuleId(w.module_id || '');
    setWeekNumber(w.week_number || 1);
    setPosition(w.position || 1);
    setTitle(w.title || '');
    setSummary(w.summary || '');
  };

  const cancelEdit = () => {
    setEditingWeek(null);
    setModuleId('');
    setWeekNumber(initialWeeks.length ? initialWeeks.length + 1 : 1);
    setPosition(initialWeeks.length ? initialWeeks.length + 1 : 1);
    setTitle('');
    setSummary('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !moduleId) {
      toast.error('Week title and Module selection are required');
      return;
    }

    const formData = new FormData();
    if (editingWeek?.id) {
      formData.append('id', editingWeek.id);
    }
    formData.append('moduleId', moduleId);
    formData.append('weekNumber', weekNumber);
    formData.append('position', position);
    formData.append('title', title);
    formData.append('summary', summary);

    startTransition(async () => {
      const res = await saveWeekAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(editingWeek ? 'Week updated successfully!' : 'Week created successfully!');
        cancelEdit();
        router.refresh();
      }
    });
  };

  const handleDelete = async (id, weekTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${weekTitle}"? Associated lessons will be affected.`)) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteWeekAction(id);
      setDeletingId(null);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Week deleted successfully!');
        if (editingWeek?.id === id) {
          cancelEdit();
        }
        router.refresh();
      }
    });
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8 pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#fa8b98] uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" /> Curriculum CMS
        </div>
        <h1 className="text-3xl font-extrabold text-white">Curriculum Weeks Manager</h1>
        <p className="text-sm text-slate-400 mt-1">Manage week titles, summaries, module assignments, edit, or delete weeks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create / Edit Form */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#fa8b98]" />
                {editingWeek ? `Edit Week #${editingWeek.week_number}` : 'Create New Week'}
              </h3>
              {editingWeek && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Parent Module *</label>
                <select
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98]"
                >
                  <option value="">Select Parent Module...</option>
                  {initialModules?.map((m) => (
                    <option key={m.id} value={m.id}>
                      Module {m.month_number} — {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Week # *</label>
                  <input
                    type="number"
                    min="1"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(parseInt(e.target.value || '1', 10))}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Position</label>
                  <input
                    type="number"
                    value={position}
                    onChange={(e) => setPosition(parseInt(e.target.value || '1', 10))}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Week Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Week 1 — Introduction to the Web"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  placeholder="Brief description of week contents"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#fa8b98]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#175cff] to-[#fa8b98] text-white font-bold hover:shadow-lg hover:shadow-[#fa8b98]/20 text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : editingWeek ? (
                    <>
                      <Pencil className="w-4 h-4" /> Update Week
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Week
                    </>
                  )}
                </button>

                {editingWeek && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-xs transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Week List */}
        <div className="lg:col-span-7">
          <div className="space-y-3">
            {initialWeeks && initialWeeks.length > 0 ? (
              initialWeeks.map((w) => {
                const isCurrentEdit = editingWeek?.id === w.id;
                const isCurrentDelete = deletingId === w.id;
                return (
                  <div
                    key={w.id}
                    className={`glass-panel p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                      isCurrentEdit
                        ? 'border-[#fa8b98] bg-[#fa8b98]/10/20 shadow-lg shadow-[#fa8b98]/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-[#fa8b98] font-mono">
                          Week {w.week_number}
                        </span>
                        {w.modules && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Module {w.modules.month_number}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{w.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{w.summary}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(w)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[#f09fa1] font-bold hover:bg-[#fa8b98] hover:text-slate-950 transition-all text-xs flex items-center gap-1"
                        title="Edit Week"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(w.id, w.title)}
                        disabled={isCurrentDelete}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-red-400 font-bold hover:bg-red-950 hover:border-red-800 transition-all text-xs flex items-center gap-1 disabled:opacity-50"
                        title="Delete Week"
                      >
                        {isCurrentDelete ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400">
                No weeks defined yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
