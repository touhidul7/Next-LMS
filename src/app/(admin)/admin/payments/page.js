import { createAdminClient } from '@/lib/supabase/server';
import { requireAdminRole, getCurrentProfile } from '@/lib/auth/server';
import HeaderNav from '@/components/dashboard/HeaderNav';
import Link from 'next/link';
import { CreditCard, CheckCircle2, Clock, XCircle, ArrowRight, Search, ShieldCheck } from 'lucide-react';
import { formatBDT } from '@/lib/utils';

export default async function AdminPaymentsPage({ searchParams }) {
  const profile = await getCurrentProfile();
  await requireAdminRole();

  const supabase = await createAdminClient();
  const filterStatus = (await searchParams)?.status || 'all';

  let query = supabase
    .from('payments')
    .select('*, profiles!payments_user_id_fkey(*)')
    .order('created_at', { ascending: false });

  if (filterStatus !== 'all') {
    query = query.eq('status', filterStatus);
  }

  const { data: payments, error } = await query;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <HeaderNav profile={profile} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#fa8b98] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> Admin Financial Control
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">bKash Payment Verification</h1>
            <p className="text-sm text-slate-400 mt-1">
              Inspect manual bKash transaction IDs and transactionally approve active student course access.
            </p>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 mb-6 border-b border-slate-800/80 pb-4 overflow-x-auto">
          {[
            { id: 'all', label: 'All Payments' },
            { id: 'pending', label: 'Pending Verification' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <Link
              key={tab.id}
              href={`/admin/payments${tab.id === 'all' ? '' : `?status=${tab.id}`}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-[#fa8b98] text-slate-950 shadow-md shadow-[#fa8b98]/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Payments Table Card */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {!payments || payments.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-white">No payment records found</p>
              <p className="text-xs text-slate-500 mt-1">
                {filterStatus === 'all'
                  ? 'No student has submitted checkout payments yet.'
                  : `No payments currently marked as ${filterStatus}.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Student</th>
                    <th className="p-4">Sender bKash Phone</th>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Submitted Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {payments.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{pmt.profiles?.full_name || 'Student'}</div>
                        <div className="text-slate-400 text-[11px]">{pmt.profiles?.email}</div>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-300">
                        {pmt.sender_phone}
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-pink-400 bg-pink-950/50 border border-pink-800/60 px-2 py-1 rounded text-xs">
                          {pmt.transaction_id}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white text-sm">
                        {formatBDT(pmt.amount_bdt)}
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(pmt.created_at).toLocaleDateString('en-BD', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4">
                        {pmt.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fa8b98]/10 text-[#fa8b98] border border-[#fa8b98]/30 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : pmt.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 text-[11px] font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Verification
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/payments/${pmt.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-[#fa8b98] font-bold hover:bg-[#fa8b98] hover:text-slate-950 transition-all text-xs"
                        >
                          Review <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
