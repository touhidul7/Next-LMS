import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const adminSupabase = await createAdminClient();
          const userEmail = (user.email || '').toLowerCase().trim();

          // 1. Check if user is pre-authorized in admin_whitelist
          let isPreauthorizedAdmin = false;
          try {
            const { data: whitelistEntry } = await adminSupabase
              .from('admin_whitelist')
              .select('*')
              .ilike('email', userEmail)
              .maybeSingle();

            if (whitelistEntry) {
              isPreauthorizedAdmin = true;
            }
          } catch (err) {
            console.warn('Could not query admin_whitelist (table may not exist yet):', err);
          }

          // 2. Fetch existing profile
          const { data: existingProfile } = await adminSupabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          const shouldBeAdmin =
            isPreauthorizedAdmin ||
            existingProfile?.role === 'admin' ||
            existingProfile?.role === 'super_admin';

          const assignedRole = shouldBeAdmin ? 'admin' : (existingProfile?.role || 'student');
          const metaName = user.user_metadata?.full_name || user.user_metadata?.name || existingProfile?.full_name || userEmail.split('@')[0];
          const metaAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || existingProfile?.avatar_url || null;

          // 3. Upsert profile with latest info and correct role
          await adminSupabase.from('profiles').upsert(
            {
              id: user.id,
              email: user.email,
              full_name: metaName,
              avatar_url: metaAvatar,
              role: assignedRole,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );

          // 4. Redirect based on role
          if (assignedRole === 'admin' || assignedRole === 'super_admin') {
            return NextResponse.redirect(`${origin}${next && next !== '/dashboard' ? next : '/admin'}`);
          }

          return NextResponse.redirect(`${origin}${next || '/dashboard'}`);
        }
      } catch (profileErr) {
        console.error('Error syncing profile in callback:', profileErr);
        // Fallback to next or dashboard
        return NextResponse.redirect(`${origin}${next || '/dashboard'}`);
      }

      return NextResponse.redirect(`${origin}${next || '/dashboard'}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
