import { createAdminClient } from '@/lib/supabase/server';
import { requireAdminRole, getCurrentProfile } from '@/lib/auth/server';
import HeaderNav from '@/components/dashboard/HeaderNav';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Users,
  BookOpen,
  Video,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Settings,
  Layers,
  Bell,
  ClipboardList,
} from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard — Frontend Development LMS',
};

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();
  await requireAdminRole();

  const supabase = await createAdminClient();

  // Fetch key metrics in parallel
  const [
    { count: totalStudents },
    { count: activeEnrollments },
    { count: pendingPayments },
    { count: approvedPayments },
    { count: totalLessons },
    { count: totalWeeks },
    { count: pendingSubmissions },
    { count: totalSubmissions },
    { data: recentPayments },
    { data: driveToken },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase.from('weeks').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
    supabase
      .from('payments')
      .select('*, profiles!payments_user_id_fkey(full_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('google_drive_tokens')
      .select('account_email, token_expiry, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single(),
  ]);

  const isDriveConnected = Boolean(driveToken?.account_email);

  const statCards = [
    {
      label: 'Total Students',
      value: totalStudents ?? 0,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-950/50',
      border: 'border-blue-900/50',
      href: null,
    },
    {
      label: 'Active Enrollments',
      value: activeEnrollments ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/50',
      border: 'border-emerald-900/50',
      href: null,
    },
    {
      label: 'Pending Payments',
      value: pendingPayments ?? 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-950/50',
      border: 'border-amber-900/50',
      href: '/admin/payments?status=pending',
      alert: pendingPayments > 0,
    },
    {
      label: 'Approved Payments',
      value: approvedPayments ?? 0,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/50',
      border: 'border-cyan-900/50',
      href: '/admin/payments?status=approved',
    },
    {
      label: 'Published Lessons',
      value: totalLessons ?? 0,
      icon: Video,
      color: 'text-purple-400',
      bg: 'bg-purple-950/50',
      border: 'border-purple-900/50',
      href: '/admin/course/lessons',
    },
    {
      label: 'Pending Submissions',
      value: pendingSubmissions ?? 0,
      icon: ClipboardList,
      color: 'text-rose-400',
      bg: 'bg-rose-950/50',
      border: 'border-rose-900/50',
      href: '/admin/submissions',
      alert: (pendingSubmissions ?? 0) > 0,
    },
  ];

  const quickLinks = [
    {
      label: 'Assignment Submissions & Grading',
      description: 'Review student code, test live deployments, and assign marks/feedback',
      href: '/admin/submissions',
      icon: ClipboardList,
      badge: (pendingSubmissions ?? 0) > 0 ? `${pendingSubmissions} awaiting review` : null,
      badgeColor: 'bg-rose-950 text-rose-400 border-rose-800',
    },
    {
      label: 'bKash Payment Verification',
      description: 'Review and approve/reject pending student payments',
      href: '/admin/payments',
      icon: CreditCard,
      badge: pendingPayments > 0 ? `${pendingPayments} pending` : null,
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-800',
    },
    {
      label: 'Courses & Curriculum Manager',
      description: 'Manage courses, modules, and Google Drive video lessons',
      href: '/admin/courses',
      icon: BookOpen,
      badge: null,
    },
    {
      label: 'Google Drive Integration',
      description: isDriveConnected
        ? `Connected: ${driveToken?.account_email}`
        : 'Not connected — Click to configure OAuth',
      href: '/admin/settings/integrations/google',
      icon: Settings,
      badge: isDriveConnected ? 'Connected' : 'Setup Required',
      badgeColor: isDriveConnected
        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
        : 'bg-red-950 text-red-400 border-red-800',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <HeaderNav profile={profile} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Page Header */}
        <div className="mb-10 pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> Admin Control Center
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            LMS Admin Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Manage student payments, course curriculum, video lessons, and Google Drive integration from one central hub.
          </p>
        </div>

        {/* Pending Payments Alert Banner */}
        {(pendingPayments ?? 0) > 0 && (
          <Link href="/admin/payments?status=pending">
            <div className="mb-8 glass-panel p-5 rounded-2xl border border-amber-800/60 bg-gradient-to-r from-amber-950/20 to-slate-950/80 flex items-center justify-between hover:border-amber-600/80 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {pendingPayments} bKash Payment{pendingPayments > 1 ? 's' : ''} Awaiting Verification
                  </div>
                  <div className="text-xs text-amber-300/80 mt-0.5">
                    Students are waiting for enrollment activation — review now
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </Link>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const content = (
              <div
                className={`glass-panel p-5 rounded-2xl border ${stat.border} ${stat.bg} flex flex-col gap-3 transition-all ${stat.href ? 'hover:scale-105 cursor-pointer' : ''} ${stat.alert ? 'ring-1 ring-amber-500/30' : ''}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.bg} border ${stat.border}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">{stat.label}</div>
                </div>
              </div>
            );

            return stat.href ? (
              <Link key={stat.label} href={stat.href}>{content}</Link>
            ) : (
              <div key={stat.label}>{content}</div>
            );
          })}
        </div>

        {/* Quick Action Links + Recent Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Links */}
          <div className="lg:col-span-5">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Admin Quick Actions
            </h2>
            <div className="space-y-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center gap-4 hover:border-cyan-500/50 hover:bg-slate-900/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-cyan-950 transition-colors">
                      <Icon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{link.label}</span>
                        {link.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${link.badgeColor}`}>
                            {link.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{link.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Pending Payments Queue */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-pink-400" /> Recent Pending Payments
              </h2>
              <Link
                href="/admin/payments"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              {!recentPayments || recentPayments.length === 0 ? (
                <div className="p-10 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">All Caught Up!</p>
                  <p className="text-xs text-slate-400 mt-1">No pending bKash payments require review.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="p-3">Student</th>
                      <th className="p-3">Transaction ID</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentPayments.map((pmt) => (
                      <tr key={pmt.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-white text-xs">{pmt.profiles?.full_name}</div>
                          <div className="text-slate-400 text-[10px]">{pmt.profiles?.email}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-pink-400 text-xs">{pmt.transaction_id}</span>
                        </td>
                        <td className="p-3 font-bold text-white text-xs">৳{pmt.amount_bdt}</td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/admin/payments/${pmt.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 font-bold hover:bg-amber-900 transition-all text-[11px]"
                          >
                            Review <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
