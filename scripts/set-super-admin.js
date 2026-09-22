import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env
const envPath = path.join(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envConfig.split('\n').forEach((line) => {
  const trimmed = line.trim().replace(/\r$/, '');
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      envVars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const targetEmail = (process.argv[2] || 'touhiduliet@gmail.com').toLowerCase().trim();

async function setSuperAdmin() {
  console.log(`Setting Super Admin for email: ${targetEmail}...`);

  // 1. Add to admin whitelist
  const { error: wlErr } = await supabase.from('admin_whitelist').upsert(
    { email: targetEmail },
    { onConflict: 'email' }
  );
  if (wlErr) {
    console.warn('Note on admin_whitelist:', wlErr.message);
  } else {
    console.log(`✓ Added ${targetEmail} to admin_whitelist`);
  }

  // 2. Check if user already exists in profiles
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .ilike('email', targetEmail)
    .maybeSingle();

  if (profErr) {
    console.error('Error querying profile:', profErr.message);
    process.exit(1);
  }

  if (profile) {
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ role: 'super_admin' })
      .eq('id', profile.id);

    if (updateErr) {
      console.error('Failed to update role in profile:', updateErr.message);
      process.exit(1);
    }
    console.log(`\n======================================================`);
    console.log(`✓ SUCCESS: ${targetEmail} is now SUPER_ADMIN!`);
    console.log(`  Name: ${profile.full_name || 'N/A'}`);
    console.log(`  User ID: ${profile.id}`);
    console.log(`  Role: super_admin`);
    console.log(`======================================================\n`);
  } else {
    console.log(`\n======================================================`);
    console.log(`✓ PRE-AUTHORIZED: ${targetEmail}`);
    console.log(`  Profile does not exist yet. As soon as this user logs in`);
    console.log(`  with Google OAuth, they will automatically be an Admin.`);
    console.log(`======================================================\n`);
  }
}

setSuperAdmin();
