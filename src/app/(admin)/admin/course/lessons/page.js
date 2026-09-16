import { redirect } from 'next/navigation';

export default async function RedirectLessonsPage() {
  redirect('/admin/courses/a1b2c3d4-e5f6-7890-abcd-111111111111/lessons');
}
