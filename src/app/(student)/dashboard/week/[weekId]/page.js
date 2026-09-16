import { redirect } from 'next/navigation';

export default async function RedirectWeekPage() {
  redirect('/dashboard');
}
