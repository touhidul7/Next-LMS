import { requireAdminRole, getCurrentProfile } from '@/lib/auth/server';
import { createAdminClient } from '@/lib/supabase/server';
import HeaderNav from '@/components/dashboard/HeaderNav';
import Link from 'next/link';
import { Video, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Power } from 'lucide-react';
import { disconnectGoogleDriveAction } from '@/app/actions/google-drive';

export default async function GoogleDriveIntegrationPage(props) {
  const searchParams = await props.searchParams;
  const profile = await getCurrentProfile();
  await requireAdminRole();

  const supabase = await createAdminClient();

  const { data: tokenRecord } = await supabase
    .from('google_drive_tokens')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const isConnected = Boolean(tokenRecord && tokenRecord.access_token);
  const accountEmail = tokenRecord?.account_email || 'Not Connected';

  const status = searchParams?.status;
  const errorMsg = searchParams?.error;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <HeaderNav profile={profile} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8 pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#fa8b98] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Admin System Integration
          </div>
          <h1 className="text-3xl font-extrabold text-white">Google Drive Private Video Storage</h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect a dedicated course Google Account via OAuth 2.0 to stream private lesson videos through our authorized LMS media proxy.
          </p>
        </div>

        {status === 'success' && isConnected && (
          <div className="mb-6 p-4 rounded-2xl bg-[#fa8b98]/10/80 border border-[#fa8b98]/30 text-[#f09fa1] text-sm font-semibold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#fa8b98] flex-shrink-0" />
            <span>Google Drive account (<strong>{accountEmail}</strong>) successfully connected!</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-300 text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>OAuth Connection Error: {decodeURIComponent(errorMsg)}</span>
          </div>
        )}

        {/* Status Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#175cff] to-[#fa8b98] flex items-center justify-center text-slate-950 font-bold">
                <Video className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Google Drive OAuth 2.0 Status</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Connected Account: <strong className="text-slate-200">{accountEmail}</strong>
                </div>
              </div>
            </div>

            <div>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fa8b98]/10 text-[#fa8b98] border border-[#fa8b98]/30 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" /> Not Connected
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Google authentication remains strictly server-to-server (`LMS Server &lt;--&gt; Google Drive`). Tokens are never exposed to client browsers.
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isConnected && (
                <form action={disconnectGoogleDriveAction}>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-red-950 border border-red-800 text-red-300 font-bold hover:bg-red-900 transition-all text-xs flex items-center gap-1.5"
                  >
                    <Power className="w-4 h-4" /> Disconnect
                  </button>
                </form>
              )}

              <Link
                href="/api/google/oauth"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#175cff] to-[#fa8b98] text-white font-extrabold hover:shadow-lg hover:shadow-[#fa8b98]/20 transition-all text-xs flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {isConnected ? 'Reconnect Account' : 'Connect Google Drive'}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
