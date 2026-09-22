'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Layers, ShieldCheck, Pencil, Trash2, Plus, X, RefreshCw } from 'lucide-react';
import { saveModuleAction, deleteModuleAction } from '@/app/actions/curriculum';

export default function ModuleClientManager({ courseId, initialModules = [] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [editingModule, setEditingModule] = useState(null);
  const [monthNumber, setMonthNumber] = useState(initialModules?.length ? initialModules.length + 1 : 1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const startEdit = (mod) => {
    setEditingModule(mod);
    setMonthNumber(mod.month_number || 1);
    setTitle(mod.title || '');
    setDescription(mod.description || '');
  };

  const cancelEdit = () => {
    setEditingModule(null);
    setMonthNumber(initialModules?.length ? initialModules.length + 1 : 1);
    setTitle('');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Module title is required');
      return;
    }

    const finalMonthNumber = parseInt(monthNumber, 10) || 1;

    const formData = new FormData();
    if (editingModule?.id) {
      formData.append('id', editingModule.id);
    }
    if (courseId) {
      formData.append('courseId', courseId);
    }
    formData.append('monthNumber', finalMonthNumber);
    formData.append('position', finalMonthNumber);
    formData.append('title', title);
    formData.append('description', description);

    startTransition(async () => {
      const res = await saveModuleAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(editingModule ? 'Module updated successfully!' : 'Module created successfully!');
        cancelEdit();
        router.refresh();
      }
    });
  };

  const handleDelete = async (id, modTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${modTitle}"? Associated weeks and lessons may be affected.`)) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteModuleAction(id);
      setDeletingId(null);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Module deleted successfully!');
        if (editingModule?.id === id) {
          cancelEdit();
        }
        router.refresh();
      }
    });
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" /> Curriculum CMS
        </div>
        <h1 className="text-3xl font-extrabold text-white">Modules Manager</h1>
        <p className="text-sm text-slate-400 mt-1">
          Create, edit, and organize curriculum modules for your LMS program.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create / Edit Module Form */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                {editingModule ? `Edit Module #${editingModule.month_number}` : 'Create New Module'}
              </h3>
              {editingModule && (
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Module Number *</label>
                <input
                  type="number"
                  min="1"
                  value={monthNumber}
                  onChange={(e) => setMonthNumber(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                  placeholder="e.g. 2"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Module Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Module 1 — Web Fundamentals"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Overview of module learning objectives"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:shadow-lg hover:shadow-cyan-500/20 text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : editingModule ? (
                    <>
                      <Pencil className="w-4 h-4" /> Update Module
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Module
                    </>
                  )}
                </button>

                {editingModule && (
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

        {/* Modules List */}
        <div className="lg:col-span-7">
          <div className="space-y-4">
            {initialModules && initialModules.length > 0 ? (
              initialModules.map((m) => {
                const isCurrentEdit = editingModule?.id === m.id;
                const isCurrentDelete = deletingId === m.id;
                return (
                  <div
                    key={m.id}
                    className={`glass-panel p-6 rounded-2xl border transition-all ${
                      isCurrentEdit
                        ? 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase font-mono">
                          Module {m.month_number}
                        </span>
                        <h4 className="text-lg font-bold text-white mt-2">{m.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.description || 'No description provided.'}</p>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => startEdit(m)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-300 font-bold hover:bg-cyan-500 hover:text-slate-950 transition-all text-xs flex items-center gap-1.5"
                          title="Edit Module"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.title)}
                          disabled={isCurrentDelete}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-red-400 font-bold hover:bg-red-950 hover:border-red-800 transition-all text-xs flex items-center gap-1.5 disabled:opacity-50"
                          title="Delete Module"
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
                  </div>
                );
              })
            ) : (
              <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-400">
                <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-base font-semibold text-white">No modules defined yet</p>
                <p className="text-xs text-slate-500 mt-1">Use the form on the left to create your first module.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
