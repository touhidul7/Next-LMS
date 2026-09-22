'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { normalizeBkashPhone } from '@/lib/utils';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(11, 'Valid phone number is required'),
  password: z.string().optional(),
  senderPhone: z.string().min(11, 'Valid sender bKash phone number is required'),
  transactionId: z.string().min(6, 'Transaction ID must be at least 6 characters'),
  amount: z.number().min(100, 'Invalid amount'),
});

/**
 * Handle manual bKash checkout & account creation
 */
export async function submitCheckoutAction(formData) {
  const fullName = formData.get('fullName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const password = formData.get('password');
  const senderPhone = formData.get('senderPhone');
  const transactionId = formData.get('transactionId');
  const amountStr = formData.get('amount') || '12000';
  const screenshotUrl = formData.get('screenshotUrl') || null;

  const amount = parseFloat(amountStr);

  const parse = checkoutSchema.safeParse({
    fullName,
    email,
    phone,
    password,
    senderPhone,
    transactionId,
    amount,
  });

  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // 1. Check if user already exists or sign in
  let userId = null;
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    userId = user.id;
    // Update phone/name if provided
    await adminSupabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq('id', user.id);
  } else {
    // Look up existing user by email
    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('id')
      .ilike('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      return {
        error: 'Please click "Continue with Google" above to sign in before submitting your enrollment.',
      };
    }
  }

  // 2. Fetch Flagship Course ID
  const { data: course, error: courseError } = await adminSupabase
    .from('courses')
    .select('id')
    .eq('slug', 'frontend-development')
    .single();

  const courseId = course?.id || 'a1b2c3d4-e5f6-7890-abcd-111111111111';

  // 3. Insert Payment Record (Status = 'pending')
  const { data: payment, error: paymentError } = await adminSupabase
    .from('payments')
    .insert({
      user_id: userId,
      course_id: courseId,
      sender_phone: normalizeBkashPhone(senderPhone),
      transaction_id: transactionId.trim().toUpperCase(),
      amount_bdt: amount,
      screenshot_url: screenshotUrl,
      status: 'pending',
    })
    .select()
    .single();

  if (paymentError) {
    return { error: `Failed to create payment record: ${paymentError.message}` };
  }

  // 4. Upsert Enrollment Record (Status = 'pending')
  const { error: enrollmentError } = await adminSupabase
    .from('enrollments')
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        payment_id: payment.id,
        status: 'pending',
      },
      { onConflict: 'user_id,course_id' }
    );

  if (enrollmentError) {
    return { error: `Failed to create pending enrollment: ${enrollmentError.message}` };
  }

  redirect('/dashboard');
}
