'use client';

import { useState } from 'react';
import Link from 'next/link';
import { submitCheckoutAction } from '@/app/actions/checkout';
import { Code2, CreditCard, Copy, Check, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const bkashNumber = '01700000000';
  const coursePriceBDT = 12000;

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
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-cyan-500/20">
              <Code2 className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Frontend LMS</span>
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
              <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider block mb-1">
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
                <span className="text-2xl font-black text-cyan-400">৳{coursePriceBDT.toLocaleString()} BDT</span>
              </div>
            </div>

            {/* bKash Payment Instructions Card */}
            <div className="glass-panel p-6 rounded-2xl border border-cyan-900/50 bg-gradient-to-b from-pink-950/20 to-slate-950/80">
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
                <li>Enter recipient number: <code className="text-pink-300 font-mono">{bkashNumber}</code>.</li>
                <li>Enter exact amount: <strong className="text-white">৳12,000 BDT</strong>.</li>
                <li>Enter reference: <strong className="text-white">LMS</strong>.</li>
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
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Step 1: Student Account Information
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
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
                        required
                        placeholder="01712345678"
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Account Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                    />
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
                  className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 mt-4"
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
