'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(11, 'Valid phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Log in student or staff user
 */
export async function loginAction(formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  const parse = loginSchema.safeParse({ email, password });
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check user profile role for proper redirection
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profile?.role === 'admin' || profile?.role === 'super_admin') {
    redirect('/admin');
  } else if (profile?.role === 'mentor') {
    redirect('/mentor');
  } else {
    redirect('/dashboard');
  }
}

/**
 * Register new student account
 */
export async function registerAction(formData) {
  const fullName = formData.get('fullName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const password = formData.get('password');

  const parse = registerSchema.safeParse({ fullName, email, phone, password });
  if (!parse.success) {
    return { error: parse.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Update profile phone number
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ phone: phone, full_name: fullName })
      .eq('id', data.user.id);
  }

  redirect('/checkout');
}

/**
 * Log out user session
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * Request password recovery email
 */
export async function forgotPasswordAction(formData) {
  const email = formData.get('email');
  if (!email) return { error: 'Email is required' };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Password reset instructions have been sent to your email.' };
}
