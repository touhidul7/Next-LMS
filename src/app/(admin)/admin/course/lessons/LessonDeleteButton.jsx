'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, RefreshCw } from 'lucide-react';
import { deleteLessonAction } from '@/app/actions/curriculum';

export default function LessonDeleteButton({ lessonId, lessonTitle }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete lesson "${lessonTitle}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteLessonAction(lessonId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Lesson deleted successfully!');
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-red-400 font-bold hover:bg-red-950 hover:border-red-800 transition-all text-xs disabled:opacity-50 ml-2"
      title="Delete Lesson"
    >
      {isPending ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
      Delete
    </button>
  );
}
