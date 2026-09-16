'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { approvePaymentAction, rejectPaymentAction } from '@/app/actions/payments';
import { ArrowLeft, CheckCircle2, XCircle, Clock, CreditCard, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatBDT } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function AdminPaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.paymentId;

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    async function loadPaymentDetail() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('payments')
        .select('*, profiles!payments_user_id_fkey(*), courses(*)')
        .eq('id', paymentId)
        .single();

      if (!error && data) {
        setPayment(data);
        setAdminNote(data.admin_note || '');
      }
      setLoading(false);
    }

    if (paymentId) {
      loadPaymentDetail();
    }
  }, [paymentId]);

  async function handleApprove() {
    setActionLoading(true);
    const res = await approvePaymentAction(paymentId, adminNote);

    if (res?.error) {
      toast.error(res.error);
      setActionLoading(false);
    } else {
      toast.success('Payment approved and course access activated!');
      router.push('/admin/payments');
      router.refresh();
    }
  }

  async function handleReject() {
    setActionLoading(true);
    const res = await rejectPaymentAction(paymentId, adminNote);

    if (res?.error) {
      toast.error(res.error);
      setActionLoading(false);
    } else {
      toast.error('Payment rejected.');
      router.push('/admin/payments');
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading payment transaction details...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Payment Record Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">The requested payment verification record does not exist.</p>
        <Link href="/admin/payments" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold">
          Back to Payments List
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <Link
              href="/admin/payments"
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Payments Queue
            </Link>
            <h1 className="text-2xl font-extrabold text-white">Payment Verification Detail</h1>
          </div>

          <div>
            {payment.status === 'approved' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" /> Approved
              </span>
            ) : payment.status === 'rejected' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 text-xs font-bold">
                <XCircle className="w-4 h-4" /> Rejected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold">
                <Clock className="w-4 h-4 animate-pulse" /> Pending Verification
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Info Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <User className="w-4 h-4" /> Student Profile Info
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Full Name</label>
              <div className="text-base font-bold text-white">{payment.profiles?.full_name || 'N/A'}</div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
              <div className="text-sm text-slate-200 font-mono">{payment.profiles?.email}</div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Contact Phone</label>
              <div className="text-sm text-slate-200 font-mono">{payment.profiles?.phone || 'N/A'}</div>
            </div>
          </div>

          {/* Transaction Proof Card */}
          <div className="glass-panel p-6 rounded-2xl border border-pink-900/40 bg-gradient-to-b from-pink-950/10 to-slate-950/80 space-y-4">
            <div className="flex items-center gap-3 text-pink-400 font-bold text-xs uppercase tracking-wider">
              <CreditCard className="w-4 h-4" /> bKash Transaction Details
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Sender bKash Phone</label>
              <div className="text-lg font-mono font-bold text-slate-200">{payment.sender_phone}</div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Transaction ID (TxnID)</label>
              <div className="text-xl font-mono font-black text-pink-400 tracking-wider">
                {payment.transaction_id}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Amount Sent</label>
                <div className="text-xl font-black text-white">{formatBDT(payment.amount_bdt)}</div>
              </div>
              <div className="text-right">
                <label className="text-[10px] uppercase font-bold text-slate-400">Submitted Date</label>
                <div className="text-xs text-slate-300">
                  {new Date(payment.created_at).toLocaleString('en-BD')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action & Admin Note Controls */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 mt-8 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" /> Admin Action & Transactional Verification
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Admin Note / Rejection Reason (Optional)
            </label>
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. bKash TxnID verified on Personal account app"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={handleReject}
              disabled={actionLoading || payment.status === 'rejected'}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-950 border border-red-800 text-red-300 font-bold hover:bg-red-900 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> Reject Payment
            </button>

            <button
              onClick={handleApprove}
              disabled={actionLoading || payment.status === 'approved'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" /> Approve & Activate Course Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
