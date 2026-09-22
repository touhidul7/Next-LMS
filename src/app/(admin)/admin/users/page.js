import { requireAdminRole } from '@/lib/auth/server';
import HeaderNav from '@/components/dashboard/HeaderNav';
import UsersClientManager from './UsersClientManager';
import { getUsersAndAdminsAction } from '@/app/actions/users';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';

export default async function AdminUsersPage() {
  const profile = await requireAdminRole();
  const data = await getUsersAndAdminsAction();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <HeaderNav profile={profile} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" /> User & Role Management
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Users & Admin Access
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Grant and revoke Admin access by Gmail. When a pre-authorized Gmail user signs in with Google,
            they automatically receive Admin privileges. Removing an admin immediately demotes them back to a standard Student.
          </p>
        </div>

        {/* Client Interactive Manager */}
        <UsersClientManager
          initialProfiles={data.profiles || []}
          initialPendingInvites={data.pendingInvites || []}
          currentAdminId={data.currentAdminId}
        />
      </main>
    </div>
  );
}
