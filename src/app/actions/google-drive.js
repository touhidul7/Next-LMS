'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/server';
import { verifyDriveVideo, normalizeDriveId } from '@/lib/video/providers/google-drive';

/**
 * Server action to verify a Google Drive video input for admin lesson editing
 */
export async function verifyVideoAction(sourceId) {
  await requireAdminRole();

  if (!sourceId) {
    return { error: 'Please enter a Google Drive video URL or File ID' };
  }

  const result = await verifyDriveVideo(sourceId);
  return result;
}

/**
 * Server action to disconnect Google Drive integration
 */
export async function disconnectGoogleDriveAction() {
  await requireAdminRole();
  const supabase = await createAdminClient();

  await supabase.from('google_drive_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  return { success: 'Google Drive integration disconnected.' };
}
