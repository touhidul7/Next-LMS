import { createAdminClient } from '@/lib/supabase/server';

/**
 * Normalizes any Google Drive link or ID to raw 33+ character File ID
 * Supported formats:
 * - https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
 * - https://drive.google.com/open?id=1A2B3C4D5E6F7G8H9I0J
 * - https://drive.google.com/uc?id=1A2B3C4D5E6F7G8H9I0J
 * - 1A2B3C4D5E6F7G8H9I0J
 * @param {string} source 
 * @returns {string} normalized Drive File ID
 */
export function normalizeDriveId(source) {
  if (!source) return '';
  const trimmed = source.trim();

  // Pattern 1: /file/d/{id}/
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Pattern 2: ?id={id} or &id={id}
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Pattern 3: Direct Raw File ID
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

let cachedTokenInfo = null;

/**
 * Retrieves valid Google OAuth Access Token, automatically refreshing if expired
 * @returns {Promise<{ accessToken: string, email: string } | null>}
 */
export async function getValidAccessToken() {
  const now = new Date();

  // If token is cached in RAM and valid (with 2 min buffer), return instantly
  if (cachedTokenInfo && new Date(cachedTokenInfo.expiry) > new Date(now.getTime() + 2 * 60 * 1000)) {
    return { accessToken: cachedTokenInfo.accessToken, email: cachedTokenInfo.email };
  }

  const supabase = await createAdminClient();

  const { data: tokenRecord, error } = await supabase
    .from('google_drive_tokens')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !tokenRecord) {
    cachedTokenInfo = null;
    return null;
  }

  cachedTokenInfo = {
    accessToken: tokenRecord.access_token,
    email: tokenRecord.account_email,
    expiry: tokenRecord.token_expiry,
  };

  const expiry = new Date(tokenRecord.token_expiry);

  // If token is still valid (with 2 min buffer), return it
  if (expiry > new Date(now.getTime() + 2 * 60 * 1000)) {
    return { accessToken: tokenRecord.access_token, email: tokenRecord.account_email };
  }

  // Refresh token using Google OAuth API
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || !tokenRecord.refresh_token) {
    return { accessToken: tokenRecord.access_token, email: tokenRecord.account_email };
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokenRecord.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      const newExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();

      await supabase
        .from('google_drive_tokens')
        .update({
          access_token: data.access_token,
          token_expiry: newExpiry,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tokenRecord.id);

      return { accessToken: data.access_token, email: tokenRecord.account_email };
    }
  } catch (err) {
    console.error('Failed to refresh Google OAuth token:', err);
  }

  return { accessToken: tokenRecord.access_token, email: tokenRecord.account_email };
}

/**
 * Server-to-server verification call to Google Drive API
 * @param {string} rawSource 
 */
export async function verifyDriveVideo(rawSource) {
  const fileId = normalizeDriveId(rawSource);
  if (!fileId) {
    return { valid: false, error: 'Invalid Google Drive URL or File ID format' };
  }

  const auth = await getValidAccessToken();
  if (!auth) {
    return {
      valid: false,
      fileId,
      error: 'Google Drive account is not connected. Please connect your Google account in Settings.',
    };
  }

  try {
    // Request metadata from Google Drive API v3
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,videoMediaMetadata`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return { valid: false, fileId, error: 'File not found on Google Drive. Verify file permissions.' };
      }
      return { valid: false, fileId, error: `Google Drive API error (${res.status}). Verify account access.` };
    }

    const data = await res.json();

    // Verify MIME type is a video or media binary
    const isVideo = data.mimeType?.startsWith('video/') || data.mimeType === 'application/octet-stream';

    return {
      valid: true,
      fileId: data.id,
      filename: data.name,
      mimeType: data.mimeType,
      sizeBytes: parseInt(data.size || '0', 10),
      durationSeconds: Math.round((data.videoMediaMetadata?.durationMillis || 0) / 1000),
      connectedAccount: auth.email,
      isVideo,
    };
  } catch (err) {
    return { valid: false, fileId, error: `Network error verifying Drive video: ${err.message}` };
  }
}
