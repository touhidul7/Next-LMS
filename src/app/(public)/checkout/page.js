'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { submitCheckoutAction } from '@/app/actions/checkout';
import BrandLogo from '@/components/BrandLogo';
import { CreditCard, Copy, Check, ShieldCheck, ArrowLeft, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [bkashNumber, setBkashNumber] = useState('');
  const [coursePriceBDT, setCoursePriceBDT] = useState(8000);

  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);

  useEffect(() => {
    const supabase = createClient();

    // Fetch course data (bkash number + price) alongside user profile
    const loadData = async () => {
      const [{ data: { user } }, { data: course }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('courses')
          .select('bkash_number, price_bdt')
          .eq('is_published', true)
          .maybeSingle(),
      ]);

      if (course) {
        if (course.bkash_number) setBkashNumber(course.bkash_number);
        if (course.price_bdt) setCoursePriceBDT(course.price_bdt);
      }

      if (user) {
        setCurrentUser(user);
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (prof) setCurrentProfile(prof);
      }
    };

    loadData();
  }, []);

  async function handleGoogleLoginForCheckout() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/checkout`,
      },
    });
  }

  function copyBkashNumber() {
    navigator.clipboard.writeText(bkashNumber);
    setCopied(true);
    toast.success('bKash Personal number copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);
    const res = await submitCheckoutAction(formData);

    if (res?.error) {
      setError(res.error);
      toast.error(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo className="h-7 sm:h-8" />
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Course Overview
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Course Summary & bKash Instructions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Course Summary Box */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <span className="text-xs font-medium text-[#fa8b98] uppercase tracking-wider block mb-1">
                Selected Course
              </span>
              <h2 className="text-lg font-semibold text-white leading-tight">
                Frontend Development — 4-Month Flagship Program
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                16-Week Curriculum, Private Drive Video Lessons, 14 Milestone Projects & Mentor Feedback.
              </p>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Course Fee:</span>
                <span className="text-2xl font-black text-[#fa8b98]">৳{coursePriceBDT.toLocaleString()} BDT</span>
              </div>
            </div>

            {/* bKash Payment Instructions Card */}
            <div className="glass-panel p-6 rounded-2xl border border-pink-900/50 bg-gradient-to-b from-pink-950/20 to-slate-950/80">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Manual bKash Payment</h3>
                  <p className="text-xs text-pink-300 font-medium">Send Money to Personal Number</p>
                </div>
              </div>

              {/* Number Display & Copy Button */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-pink-900/50 flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">bKash Personal Number</div>
                  <div className="text-lg font-mono font-bold text-pink-400">{bkashNumber}</div>
                </div>
                <button
                  onClick={copyBkashNumber}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-pink-950 border border-pink-800 text-pink-300 text-xs font-semibold hover:bg-pink-900 transition-all flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <ol className="text-xs text-slate-300 space-y-2.5 list-decimal pl-4 leading-relaxed">
                <li>Open bKash App or dial <code className="text-pink-300 font-mono">*247#</code>.</li>
                <li>Choose <strong className="text-white">Send Money</strong> option.</li>
                <li>Enter recipient number: <code className="text-pink-300 font-mono">{bkashNumber}</code></li>
                <li>Enter exact amount: <strong className="text-white">৳8,000 BDT</strong></li>
                <li>Enter reference: <strong className="text-white">LMS</strong></li>
                <li>Enter your PIN to complete the transaction.</li>
                <li>Copy the <strong className="text-pink-300">Transaction ID (TxnID)</strong> and submit the form.</li>
              </ol>
            </div>
          </div>

          {/* Right Column: Enrollment & Checkout Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Student Account & Payment Verification</h3>
              <p className="text-xs text-slate-400 mb-6">
                Fill in your details and bKash transaction proof below. Your access will be activated upon admin verification.
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="amount" value={coursePriceBDT} />

                {/* Account Details Group */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-[#fa8b98] uppercase tracking-wider">
                      Step 1: Student Google Account & Contact
                    </div>
                    {currentUser && (
                      <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /> Google Verified
                      </span>
                    )}
                  </div>

                  {!currentUser && (
                    <div className="p-3.5 rounded-xl bg-[#1c2f3d]/60 border border-[#175cff]/40 space-y-2">
                      <div className="text-xs text-[#93c5fd] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#fa8b98] shrink-0" />
                        <span>Sign in with Google to link your course enrollment:</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleGoogleLoginForCheckout}
                        className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                        <span>Sign In with Google</span>
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      defaultValue={currentProfile?.full_name || currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || ''}
                      required
                      placeholder="Tanvir Ahmed"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={currentUser?.email || ''}
                        required
                        placeholder="name@example.com"
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Contact Phone *
                      </label>
                      <input
                        type="text"
                        name="phone"
                        defaultValue={currentProfile?.phone || ''}
                        required
                        placeholder="01712345678"
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* bKash Proof Details Group */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                    Step 2: bKash Transaction Details
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Sender bKash Number *
                      </label>
                      <input
                        type="text"
                        name="senderPhone"
                        required
                        placeholder="017XXXXXXXX"
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Transaction ID (TxnID) *
                      </label>
                      <input
                        type="text"
                        name="transactionId"
                        required
                        placeholder="e.g. 9J47K2L8"
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-pink-500 text-sm uppercase"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#175cff] to-[#fa8b98] text-white font-semibold hover:shadow-lg hover:shadow-[#175cff]/25 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {loading ? (
                    <span>Submitting Payment Proof...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" /> Submit & Complete Enrollment
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center mt-3">
                  Your information is kept secure. By submitting, your payment status will be marked as <span className="text-amber-400 font-semibold">Payment Verification Pending</span> until admin approval.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
