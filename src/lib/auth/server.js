import { createClient } from '../supabase/server.js';
import { redirect } from 'next/navigation';

/**
 * Ensures user is authenticated. Returns user object or redirects to /login.
 */
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return user;
}

/**
 * Retrieves the profile record for the authenticated user.
 */
export async function getCurrentProfile() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile;
}

/**
 * Requires user to have an active enrollment for the given course.
 * @param {string} courseId 
 */
export async function requireActiveEnrollment(courseId) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: enrollment, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single();

  if (error || !enrollment || enrollment.status !== 'active') {
    redirect('/dashboard?error=enrollment_required');
  }

  return enrollment;
}

/**
 * Requires user to possess 'admin' or 'super_admin' role.
 */
export async function requireAdminRole() {
  const profile = await getCurrentProfile();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/dashboard?error=unauthorized');
  }

  return profile;
}

/**
 * Requires user to possess 'mentor', 'admin', or 'super_admin' role.
 */
export async function requireStaffRole() {
  const profile = await getCurrentProfile();

  if (!profile || (profile.role !== 'mentor' && profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/dashboard?error=unauthorized');
  }

  return profile;
}
