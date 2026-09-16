import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RedirectWeekLessonPage({ params }) {
  const { lessonId } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, module_id')
    .eq('id', lessonId)
    .single();

  if (lesson?.module_id) {
    redirect(`/dashboard/module/${lesson.module_id}/lesson/${lesson.id}`);
  } else {
    redirect('/dashboard');
  }
}
