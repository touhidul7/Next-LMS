'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // If already authenticated, redirect to checkout or dashboard
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
          router.replace('/admin');
        } else {
          router.replace('/checkout');
        }
      } else {
        setCheckingSession(false);
      }
    });
  }, [router]);

  async function handleGoogleSignUp() {
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/api/auth/callback?next=/checkout`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        toast.error(oauthError.message);
        setLoading(false);
      }
    } catch (err) {
      console.error('Google Sign-Up Error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#090d16] text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#090d16] text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      {/* Top back navigation */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-slate-900/60"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          Back to Home
        </Link>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-400">
          <Sparkles className="w-3 h-3 text-cyan-400" /> 1-Click Signup
        </span>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Main Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800/90 shadow-2xl relative overflow-hidden bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-xl">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 mb-4 group">
              <img
                src="/logo.png"
                alt="Next LMS"
                className="w-14 h-14 rounded-2xl shadow-xl shadow-indigo-500/30 group-hover:scale-105 transition-transform"
              />
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Create Student Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-normal leading-relaxed">
              Sign up with your Google account to enroll and start learning.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold shadow-lg hover:shadow-cyan-500/10 transition-all flex items-center justify-center gap-3 text-sm disabled:opacity-60 cursor-pointer active:scale-[0.99] group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="tracking-tight">Sign up with Google</span>
                </>
              )}
            </button>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-normal pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant 1-click verification • No complex passwords</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-6 font-normal">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-cyan-400 font-medium hover:underline hover:text-cyan-300 ml-1"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
