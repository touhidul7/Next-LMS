'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { BookOpen, ShieldCheck, Plus, Pencil, Trash2, ArrowRight, Layers, Video, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { saveCourseAction, deleteCourseAction } from '@/app/actions/curriculum';

export default function CoursesClientManager({ initialCourses = [] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [priceBdt, setPriceBdt] = useState('8000');
  const [bkashNumber, setBkashNumber] = useState('01700000000');
  const [isPublished, setIsPublished] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const openCreate = () => {
    setEditingCourse(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setPriceBdt('8000');
    setBkashNumber('01700000000');
    setIsPublished(true);
    setShowModal(true);
  };

  const openEdit = (crs) => {
    setEditingCourse(crs);
    setTitle(crs.title || '');
    setSlug(crs.slug || '');
    setDescription(crs.description || '');
    setPriceBdt(String(crs.price_bdt || 0));
    setBkashNumber(crs.bkash_number || '01700000000');
    setIsPublished(crs.is_published ?? true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Course title is required');
      return;
    }

    const formData = new FormData();
    if (editingCourse?.id) {
      formData.append('id', editingCourse.id);
    }
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('priceBdt', priceBdt);
    formData.append('bkashNumber', bkashNumber);
    formData.append('isPublished', isPublished ? 'true' : 'false');

    startTransition(async () => {
      const res = await saveCourseAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(editingCourse ? 'Course updated successfully!' : 'Course created successfully!');
        closeModal();
        router.refresh();
      }
    });
  };

  const handleDelete = async (id, crsTitle) => {
    if (!window.confirm(`Are you sure you want to delete course "${crsTitle}"? This will remove all associated modules, lessons, and enrollments!`)) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteCourseAction(id);
      setDeletingId(null);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Course deleted successfully!');
        router.refresh();
      }
    });
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Multi-Course Platform CMS
          </div>
          <h1 className="text-3xl font-extrabold text-white">All Courses</h1>
          <p className="text-sm text-slate-400 mt-1">
            Select a course to manage its modules and video lessons, or add a new course.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold hover:shadow-lg hover:shadow-cyan-500/20 text-xs flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Course
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialCourses && initialCourses.length > 0 ? (
          initialCourses.map((crs) => {
            const isDeleting = deletingId === crs.id;
            return (
              <div
                key={crs.id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${
                        crs.is_published
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {crs.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      ৳{parseFloat(crs.price_bdt || 0).toLocaleString()} BDT
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {crs.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {crs.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 font-mono mt-4 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{crs.modules?.[0]?.count || 0} Modules</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(crs)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:text-white hover:bg-slate-800 transition-all text-xs flex items-center gap-1"
                      title="Edit Course Details"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(crs.id, crs.title)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-red-400 font-bold hover:bg-red-950 hover:border-red-800 transition-all text-xs disabled:opacity-50"
                      title="Delete Course"
                    >
                      {isDeleting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <Link
                    href={`/admin/courses/${crs.id}/modules`}
                    className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs hover:bg-cyan-500 hover:text-slate-950 transition-all flex items-center gap-1.5"
                  >
                    Manage Course <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-400">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">No courses created yet</p>
            <p className="text-xs text-slate-500 mt-1">Click &quot;Add New Course&quot; to create your first course.</p>
          </div>
        )}
      </div>

      {/* Modal for Create / Edit Course */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-800 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                {editingCourse ? 'Edit Course Details' : 'Create New Course'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Course Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Frontend Development — Flagship Program"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="frontend-development"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detailed course overview..."
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Price (BDT)</label>
                  <input
                    type="number"
                    value={priceBdt}
                    onChange={(e) => setPriceBdt(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">bKash Number</label>
                  <input
                    type="text"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
                <label htmlFor="isPublished" className="text-xs font-semibold text-slate-200 cursor-pointer">
                  Publish Course (visible to students)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
