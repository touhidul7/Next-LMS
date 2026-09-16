import { redirect } from 'next/navigation';

export default async function RedirectWeeksPage() {
  redirect('/admin/courses');
}
