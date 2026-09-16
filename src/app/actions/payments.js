'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

/**
 * Approve student bKash payment and activate enrollment transactionally
 */
export async function approvePaymentAction(paymentId, adminNote = '') {
  await requireAdminRole();
  const supabase = await createAdminClient();

  // 1. Fetch payment record
  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('*, profiles!payments_user_id_fkey(*)')
    .eq('id', paymentId)
    .single();

  if (fetchError || !payment) {
    return { error: 'Payment record not found' };
  }

  const now = new Date().toISOString();

  // 2. Update payment status to 'approved'
  const { error: paymentUpdateError } = await supabase
    .from('payments')
    .update({
      status: 'approved',
      admin_note: adminNote,
      reviewed_at: now,
    })
    .eq('id', paymentId);

  if (paymentUpdateError) {
    return { error: `Failed to update payment: ${paymentUpdateError.message}` };
  }

  // 3. Update or Insert enrollment status to 'active'
  const { error: enrollmentUpdateError } = await supabase
    .from('enrollments')
    .upsert(
      {
        user_id: payment.user_id,
        course_id: payment.course_id,
        payment_id: paymentId,
        status: 'active',
        activated_at: now,
      },
      { onConflict: 'user_id,course_id' }
    );

  if (enrollmentUpdateError) {
    return { error: `Failed to activate enrollment: ${enrollmentUpdateError.message}` };
  }

  // 4. Create internal notification for student
  await supabase.from('notifications').insert({
    user_id: payment.user_id,
    title: 'Payment Approved! 🎉',
    message: 'Your bKash payment has been verified. Your course access is now ACTIVE!',
    link: '/dashboard',
  });

  revalidatePath('/admin/payments');
  revalidatePath(`/admin/payments/${paymentId}`);
  revalidatePath('/dashboard');

  return { success: 'Payment approved and course enrollment activated!' };
}

/**
 * Reject student bKash payment and cancel enrollment
 */
export async function rejectPaymentAction(paymentId, adminNote = 'Invalid bKash Transaction ID or Amount') {
  await requireAdminRole();
  const supabase = await createAdminClient();

  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (fetchError || !payment) {
    return { error: 'Payment record not found' };
  }

  const now = new Date().toISOString();

  // Update payment status to 'rejected'
  const { error: paymentUpdateError } = await supabase
    .from('payments')
    .update({
      status: 'rejected',
      admin_note: adminNote,
      reviewed_at: now,
    })
    .eq('id', paymentId);

  if (paymentUpdateError) {
    return { error: `Failed to reject payment: ${paymentUpdateError.message}` };
  }

  // Update enrollment status to 'cancelled'
  await supabase
    .from('enrollments')
    .update({ status: 'cancelled' })
    .eq('user_id', payment.user_id)
    .eq('course_id', payment.course_id);

  // Send notification to student
  await supabase.from('notifications').insert({
    user_id: payment.user_id,
    title: 'Payment Verification Update',
    message: `Payment update: ${adminNote || 'Payment was not verified'}. Please contact support or resubmit.`,
    link: '/checkout',
  });

  revalidatePath('/admin/payments');
  revalidatePath(`/admin/payments/${paymentId}`);
  revalidatePath('/dashboard');

  return { success: 'Payment rejected successfully.' };
}
