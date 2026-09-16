import { requireAdminRole } from '@/lib/auth/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await requireAdminRole();

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const host = request?.headers?.get('x-forwarded-host') || request?.headers?.get('host');
  const proto = request?.headers?.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const defaultRedirectUri = host ? `${proto}://${host}/api/google/callback` : 'http://localhost:3000/api/google/callback';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || defaultRedirectUri;

  if (!clientId) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID missing in environment variables' }, { status: 500 });
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(authUrl.toString());
}
