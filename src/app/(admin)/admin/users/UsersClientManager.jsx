'use client';

import { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
  Search,
  Mail,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  X,
  Loader2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
  addAdminByEmailAction,
  removeAdminAction,
  revokeAdminInviteAction,
} from '@/app/actions/users';

export default function UsersClientManager({
  initialProfiles = [],
  initialPendingInvites = [],
  currentAdminId,
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [pendingInvites, setPendingInvites] = useState(initialPendingInvites);
  const [activeTab, setActiveTab] = useState('admins'); // 'admins' | 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Add Admin Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Remove Confirmation Modal
  const [confirmRemoveTarget, setConfirmRemoveTarget] = useState(null); // { id, email, name }
  const [removing, setRemoving] = useState(false);

  // Filter lists based on search
  const query = searchQuery.trim().toLowerCase();

  const adminsList = profiles.filter(
    (p) => p.role === 'admin' || p.role === 'super_admin'
  );

  const filteredAdmins = adminsList.filter(
    (p) =>
      !query ||
      p.email?.toLowerCase().includes(query) ||
      p.full_name?.toLowerCase().includes(query)
  );

  const filteredPending = pendingInvites.filter(
    (inv) => !query || inv.email?.toLowerCase().includes(query)
  );

  const filteredAllUsers = profiles.filter(
    (p) =>
      !query ||
      p.email?.toLowerCase().includes(query) ||
      p.full_name?.toLowerCase().includes(query)
  );

  // Handle Add Admin
  async function handleAddAdminSubmit(e) {
    e.preventDefault();
    if (!adminEmailInput.trim()) return;

    setSubmittingAdd(true);
    try {
      const res = await addAdminByEmailAction(adminEmailInput);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setShowAddModal(false);
        const lowerInput = adminEmailInput.trim().toLowerCase();

        // Update local state
        const existingIdx = profiles.findIndex((p) => p.email.toLowerCase() === lowerInput);
        if (existingIdx !== -1) {
          const updated = [...profiles];
          updated[existingIdx] = { ...updated[existingIdx], role: 'admin' };
          setProfiles(updated);
        } else {
          setPendingInvites([
            { id: `temp-${Date.now()}`, email: lowerInput, created_at: new Date().toISOString() },
            ...pendingInvites,
          ]);
        }
        setAdminEmailInput('');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmittingAdd(false);
    }
  }

  // Handle Remove Admin / Demote to Student
  async function handleConfirmRemove() {
    if (!confirmRemoveTarget) return;

    setRemoving(true);
    try {
      const res = await removeAdminAction({
        userId: confirmRemoveTarget.id,
        email: confirmRemoveTarget.email,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        // Demote in local state
        if (confirmRemoveTarget.id) {
          setProfiles((prev) =>
            prev.map((p) =>
              p.id === confirmRemoveTarget.id ? { ...p, role: 'student' } : p
            )
          );
        }
        setConfirmRemoveTarget(null);
      }
    } catch (err) {
      toast.error('Failed to remove admin access');
    } finally {
      setRemoving(false);
    }
  }

  // Handle Revoke Pending Whitelist Invite
  async function handleRevokeInvite(email) {
    try {
      const res = await revokeAdminInviteAction(email);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setPendingInvites((prev) =>
          prev.filter((inv) => inv.email.toLowerCase() !== email.toLowerCase())
        );
      }
    } catch (err) {
      toast.error('Failed to revoke invite');
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {profiles.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Google Authenticated Students & Staff
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-900/40 bg-gradient-to-br from-cyan-950/20 to-slate-950/80">
          <div className="flex items-center justify-between text-cyan-400 text-xs font-semibold uppercase">
            <span>Active Admins</span>
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {adminsList.length}
          </div>
          <div className="text-[11px] text-cyan-300/70 mt-1">
            Users with administrative privileges
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-900/40 bg-gradient-to-br from-amber-950/20 to-slate-950/80">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold uppercase">
            <span>Pre-authorized Admins</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {pendingInvites.length}
          </div>
          <div className="text-[11px] text-amber-300/70 mt-1">
            Awaiting first Google Sign-In
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/20 to-slate-950/80">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold uppercase">
            <span>Enrolled Students</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {
              profiles.filter((p) =>
                p.enrollments?.some((e) => e.status === 'active')
              ).length
            }
          </div>
          <div className="text-[11px] text-emerald-300/70 mt-1">
            Active course access granted
          </div>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'admins'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Admins & Team ({adminsList.length + pendingInvites.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            All Registered Users ({profiles.length})
          </button>
        </div>

        {/* Search & Add Admin Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Add Admin by Gmail
          </button>
        </div>
      </div>

      {/* TAB CONTENT: Admins & Staff */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          {/* Active Admins Section */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> Active Administrators
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Users who have active full admin privileges over the LMS
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                {filteredAdmins.length} Admins
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase bg-slate-950/60">
                    <th className="p-4">User</th>
                    <th className="p-4">Email (Google Account)</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                        No administrators found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((user) => {
                      const isSuperAdmin = user.role === 'super_admin';
                      const isSelf = user.id === currentAdminId;

                      return (
                        <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.full_name || 'User'}
                                  className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-slate-950 text-xs">
                                  {(user.full_name || user.email || 'A')[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-white flex items-center gap-1.5">
                                  {user.full_name || 'Unnamed Admin'}
                                  {isSelf && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  ID: {user.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              {user.email}
                            </div>
                          </td>

                          <td className="p-4">
                            {isSuperAdmin ? (
                              <span className="px-2.5 py-1 rounded-full bg-purple-950 border border-purple-800 text-purple-300 font-semibold text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-purple-400" /> Super Admin
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-cyan-400" /> Admin
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-slate-400 font-mono text-[11px]">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>

                          <td className="p-4 text-right">
                            {isSuperAdmin ? (
                              <span className="text-[11px] text-slate-500 italic">
                                Primary Admin
                              </span>
                            ) : isSelf ? (
                              <span className="text-[11px] text-slate-500 italic">
                                Current Session
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmRemoveTarget({
                                    id: user.id,
                                    email: user.email,
                                    name: user.full_name || user.email,
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove Admin
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Pre-authorized Whitelist */}
          {filteredPending.length > 0 && (
            <div className="glass-panel rounded-2xl border border-amber-900/40 bg-gradient-to-b from-amber-950/10 to-slate-950/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-900/30 bg-amber-950/20 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" /> Pre-Authorized Admin Invites (Pending Google Sign-In)
                  </h3>
                  <p className="text-xs text-amber-200/70 mt-0.5">
                    These Gmail addresses were added by an admin. The moment they sign in with Google, they will automatically become an Admin.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  {filteredPending.length} Pending
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-amber-900/30 text-amber-200/60 font-semibold uppercase bg-slate-950/60">
                      <th className="p-4">Pre-authorized Gmail</th>
                      <th className="p-4">Added Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/20">
                    {filteredPending.map((inv) => (
                      <tr key={inv.id || inv.email} className="hover:bg-amber-950/10 transition-colors">
                        <td className="p-4 font-mono font-semibold text-white flex items-center gap-2">
                          <Mail className="w-4 h-4 text-amber-400" />
                          {inv.email}
                        </td>
                        <td className="p-4 text-slate-400 font-mono text-[11px]">
                          {new Date(inv.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800/80">
                            Waiting for Google Auth
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRevokeInvite(inv.email)}
                            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-red-950 border border-slate-800 hover:border-red-800 text-slate-400 hover:text-red-300 text-xs transition-colors cursor-pointer"
                          >
                            Revoke Invite
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: All Registered Users */}
      {activeTab === 'all' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> All Registered Course Users
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every student and staff member signed in with Google
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300">
              {filteredAllUsers.length} Users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase bg-slate-950/60">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Enrollment</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Privilege Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAllUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredAllUsers.map((user) => {
                    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
                    const isSelf = user.id === currentAdminId;
                    const hasActiveEnrollment = user.enrollments?.some(
                      (e) => e.status === 'active'
                    );

                    return (
                      <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.full_name || 'User'}
                                className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
                                {(user.full_name || user.email || 'U')[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-white">
                                {user.full_name || 'Google User'}
                              </div>
                              {user.phone && (
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-slate-300">{user.email}</td>

                        <td className="p-4">
                          {user.role === 'super_admin' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-purple-950 border border-purple-800 text-purple-300">
                              Super Admin
                            </span>
                          ) : user.role === 'admin' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-cyan-950 border border-cyan-800 text-cyan-300">
                              Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-950 border border-emerald-800 text-emerald-300">
                              Student
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          {hasActiveEnrollment ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled Active
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">Not Enrolled</span>
                          )}
                        </td>

                        <td className="p-4 text-slate-400 font-mono text-[11px]">
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        <td className="p-4 text-right">
                          {isSelf ? (
                            <span className="text-[11px] text-slate-500 italic">You</span>
                          ) : user.role === 'super_admin' ? (
                            <span className="text-[11px] text-slate-500 italic">Protected</span>
                          ) : isAdmin ? (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmRemoveTarget({
                                  id: user.id,
                                  email: user.email,
                                  name: user.full_name || user.email,
                                })
                              }
                              className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Demote to Student
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                const res = await addAdminByEmailAction(user.email);
                                if (res?.error) {
                                  toast.error(res.error);
                                } else {
                                  toast.success(res.message);
                                  setProfiles((prev) =>
                                    prev.map((p) =>
                                      p.id === user.id ? { ...p, role: 'admin' } : p
                                    )
                                  );
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <ShieldAlert className="w-3 h-3" /> Make Admin
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD ADMIN BY GMAIL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700 bg-[#090d16] shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Add Admin by Gmail</h3>
                <p className="text-xs text-slate-400">Pre-authorize or promote an administrator</p>
              </div>
            </div>

            <form onSubmit={handleAddAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Gmail / Google Account Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    required
                    placeholder="example@gmail.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 space-y-1 leading-relaxed">
                <div className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> How this works:
                </div>
                <div>
                  • If this Gmail already has an account, they are promoted to <strong>Admin</strong> immediately.
                </div>
                <div>
                  • If they have not signed up yet, this email is saved. When they click <strong>Sign In with Google</strong>, they will automatically be granted Admin access!
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd || !adminEmailInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submittingAdd ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Grant Admin Access
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM REMOVE ADMIN */}
      {confirmRemoveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-red-900/60 bg-[#090d16] shadow-2xl relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Remove Admin Access?</h3>
                <p className="text-xs text-slate-400">Demote user to normal student</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove administrator privileges from{' '}
              <strong className="text-white">{confirmRemoveTarget.name}</strong> ({confirmRemoveTarget.email})?
              They will immediately lose access to the Admin Dashboard, course manager, payments, and submissions, and become a standard student.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRemoveTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={removing}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-red-600/20"
              >
                {removing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Confirm Demote to Student
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
