'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const emailSchema = z.string().email('Please provide a valid email address');

/**
 * Fetch all registered users, active admins, and pending admin whitelist entries
 */
export async function getUsersAndAdminsAction() {
  const currentAdmin = await requireAdminRole();
  const adminSupabase = await createAdminClient();

  // 1. Fetch all profiles
  const { data: profiles, error: profilesError } = await adminSupabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      avatar_url,
      role,
      phone,
      created_at,
      enrollments (
        id,
        status,
        course_id
      )
    `)
    .order('created_at', { ascending: false });

  if (profilesError) {
    console.error('Failed to fetch profiles:', profilesError);
    return { error: 'Failed to load users list' };
  }

  // 2. Fetch admin whitelist (pre-authorized emails)
  let whitelist = [];
  try {
    const { data: wlData, error: wlError } = await adminSupabase
      .from('admin_whitelist')
      .select('*')
      .order('created_at', { ascending: false });

    if (!wlError && wlData) {
      whitelist = wlData;
    }
  } catch (err) {
    console.warn('admin_whitelist table not available yet:', err);
  }

  // Map pending whitelist entries (emails that have NOT registered yet in profiles)
  const existingEmails = new Set((profiles || []).map((p) => (p.email || '').toLowerCase()));
  const pendingInvites = whitelist.filter(
    (item) => !existingEmails.has((item.email || '').toLowerCase())
  );

  return {
    success: true,
    currentAdminId: currentAdmin.id,
    profiles: profiles || [],
    pendingInvites: pendingInvites || [],
  };
}

/**
 * Add a new admin by Gmail / email address
 * If the user already has an account, immediately grant 'admin' role.
 * If the user has not signed up yet, add to admin_whitelist so they get 'admin' when signing in with Google.
 */
export async function addAdminByEmailAction(emailInput) {
  const currentAdmin = await requireAdminRole();
  const parse = emailSchema.safeParse(emailInput?.trim());

  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  const email = parse.data.toLowerCase();
  const adminSupabase = await createAdminClient();

  // 1. Add to admin_whitelist table
  try {
    await adminSupabase.from('admin_whitelist').upsert(
      {
        email: email,
        added_by: currentAdmin.id,
      },
      { onConflict: 'email' }
    );
  } catch (err) {
    console.warn('Could not insert to admin_whitelist table:', err);
  }

  // 2. Check if user already has a profile in the system
  const { data: existingProfile } = await adminSupabase
    .from('profiles')
    .select('id, full_name, role')
    .ilike('email', email)
    .maybeSingle();

  if (existingProfile) {
    // Promote user immediately
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', existingProfile.id);

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath('/admin/users');
    return {
      success: true,
      message: `Successfully promoted ${existingProfile.full_name || email} to Admin.`,
    };
  }

  revalidatePath('/admin/users');
  return {
    success: true,
    message: `Pre-authorized ${email}. When they sign in with Google, they will automatically be granted Admin access.`,
  };
}

/**
 * Remove an admin and demote back to standard student role
 */
export async function removeAdminAction({ userId, email }) {
  const currentAdmin = await requireAdminRole();
  const adminSupabase = await createAdminClient();

  const normalizedEmail = (email || '').toLowerCase().trim();

  // Safety checks:
  if (userId && userId === currentAdmin.id) {
    return { error: 'You cannot remove your own admin access.' };
  }

  if (userId) {
    const { data: targetProfile } = await adminSupabase
      .from('profiles')
      .select('id, role, full_name, email')
      .eq('id', userId)
      .maybeSingle();

    if (targetProfile?.role === 'super_admin') {
      return { error: 'The Primary Super Admin cannot be removed or demoted.' };
    }

    // Demote profile to 'student'
    const { error: demoteError } = await adminSupabase
      .from('profiles')
      .update({ role: 'student' })
      .eq('id', userId);

    if (demoteError) {
      return { error: demoteError.message };
    }
  }

  // Also remove from admin_whitelist table
  if (normalizedEmail) {
    try {
      await adminSupabase
        .from('admin_whitelist')
        .delete()
        .ilike('email', normalizedEmail);
    } catch (err) {
      console.warn('Error deleting from admin_whitelist:', err);
    }
  }

  revalidatePath('/admin/users');
  return {
    success: true,
    message: `Admin access removed for ${normalizedEmail}. Role changed to Student.`,
  };
}

/**
 * Revoke a pending whitelist invitation before the user registers
 */
export async function revokeAdminInviteAction(email) {
  await requireAdminRole();
  const adminSupabase = await createAdminClient();

  const normalizedEmail = (email || '').toLowerCase().trim();
  try {
    await adminSupabase
      .from('admin_whitelist')
      .delete()
      .ilike('email', normalizedEmail);
  } catch (err) {
    return { error: 'Failed to revoke invite' };
  }

  revalidatePath('/admin/users');
  return { success: true, message: `Revoked admin invite for ${normalizedEmail}` };
}
