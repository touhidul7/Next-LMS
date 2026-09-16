import { createAdminClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await requireAdminRole();

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/settings/integrations/google?error=missing_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const host = request?.headers?.get('x-forwarded-host') || request?.headers?.get('host');
  const proto = request?.headers?.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const defaultRedirectUri = host ? `${proto}://${host}/api/google/callback` : `${origin}/api/google/callback`;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || defaultRedirectUri;

  try {
    // 1. Exchange code for access & refresh tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${origin}/admin/settings/integrations/google?error=token_exchange_failed`);
    }

    // 2. Fetch connected Google account email
    let userEmail = 'connected_account@google.com';
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (userRes.ok) {
        const userInfo = await userRes.json();
        userEmail = userInfo.email || userEmail;
      }
    } catch (e) {}

    // 3. Save tokens into database (Server-Only)
    const supabase = await createAdminClient();
    const expiry = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

    const { data: existingToken } = await supabase
      .from('google_drive_tokens')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const refreshTokenToSave = tokenData.refresh_token || existingToken?.refresh_token || '';

    let dbError = null;
    if (existingToken?.id) {
      const { error } = await supabase
        .from('google_drive_tokens')
        .update({
          account_email: userEmail,
          access_token: tokenData.access_token,
          refresh_token: refreshTokenToSave,
          token_expiry: expiry,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id);
      dbError = error;
    } else {
      const { error } = await supabase.from('google_drive_tokens').insert({
        account_email: userEmail,
        access_token: tokenData.access_token,
        refresh_token: refreshTokenToSave,
        token_expiry: expiry,
      });
      dbError = error;
    }

    if (dbError) {
      console.error('Failed to save Google Drive token:', dbError);
      return NextResponse.redirect(
        `${origin}/admin/settings/integrations/google?error=${encodeURIComponent(dbError.message)}`
      );
    }

    return NextResponse.redirect(`${origin}/admin/settings/integrations/google?status=success`);
  } catch (err) {
    return NextResponse.redirect(
      `${origin}/admin/settings/integrations/google?error=${encodeURIComponent(err.message)}`
    );
  }
}
