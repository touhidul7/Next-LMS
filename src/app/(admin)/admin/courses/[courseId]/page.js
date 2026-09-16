import { redirect } from 'next/navigation';

export default async function CourseRootPage({ params }) {
  const { courseId } = await params;
  redirect(`/admin/courses/${courseId}/modules`);
}
