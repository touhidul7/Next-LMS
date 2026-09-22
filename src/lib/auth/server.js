import { cache } from 'react';
import { createClient } from '../supabase/server.js';
import { redirect } from 'next/navigation';

/**
 * Single cached getUser call — shared across requireAuth and getCurrentProfile
 * so only ONE Supabase auth network round-trip occurs per server request.
 */
const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
});

/**
 * Ensures user is authenticated. Returns user object or redirects to /login.
 * Cached per request to eliminate duplicate network calls.
 */
export const requireAuth = cache(async () => {
  const { user } = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  return user;
});

/**
 * Retrieves the profile record for the authenticated user.
 * Cached per request to eliminate duplicate network calls.
 * Reuses the same getUser() call as requireAuth — no extra round-trip.
 */
export const getCurrentProfile = cache(async () => {
  const { supabase, user } = await getAuthUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !profile) {
    return null;
  }

  return profile;
});

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
