'use client';

import Link from 'next/link';
import { logoutAction } from '@/app/actions/auth';
import BrandLogo from '@/components/BrandLogo';
import { LogOut, User, ShieldAlert, LayoutDashboard, CreditCard, BookOpen, Users } from 'lucide-react';

export default function HeaderNav({ profile }) {
  return (
    <header className="border-b border-slate-800 bg-[#090d16]/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Context Links */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center">
            <BrandLogo className="h-6 sm:h-7" />
          </Link>

          <nav className="hidden md:flex items-center space-x-4 text-xs font-medium">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4 text-[#fa8b98]" /> Dashboard
            </Link>

            {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
              <>
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-lg bg-[#175cff]/20 border border-[#175cff]/40 text-[#93c5fd] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4 text-[#60a5fa]" /> Admin
                </Link>
                <Link
                  href="/admin/users"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4 text-[#fa8b98]" /> Users & Admins
                </Link>
                <Link
                  href="/admin/payments"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4 text-pink-400" /> Payments
                </Link>
                <Link
                  href="/admin/courses"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-purple-400" /> Courses & Curriculum
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 text-right">
            <div>
              <div className="text-xs font-medium text-white">{profile?.full_name || profile?.email}</div>
              <div className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-end gap-1">
                {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                  <span className="text-[#fa8b98] flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Admin</span>
                ) : profile?.role === 'mentor' ? (
                  <span className="text-purple-400">Mentor</span>
                ) : (
                  <span className="text-[#fa8b98]">Student</span>
                )}
              </div>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900/50 transition-all flex items-center gap-1.5 text-xs font-medium"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
