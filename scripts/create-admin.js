/**
 * Creates an admin user account in Supabase Auth and sets their profile role to 'admin'
 * Run: node scripts/create-admin.js
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env
const envPath = path.join(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach((line) => {
  const trimmed = line.trim().replace(/\r$/, '');
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ADMIN_EMAIL = 'admin@frontendlms.com';
const ADMIN_PASSWORD = 'Admin@LMS2026!';
const ADMIN_NAME = 'LMS Administrator';

async function createAdminUser() {
  console.log('Creating admin user...');

  // 1. Create user via admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: ADMIN_NAME,
    },
  });

  if (authError) {
    if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
      console.log('⚠ Admin user already exists — updating role...');

      // Find existing user
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existing = users?.find(u => u.email === ADMIN_EMAIL);

      if (existing) {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ role: 'admin', full_name: ADMIN_NAME })
          .eq('id', existing.id);

        if (updateErr) {
          console.error('Error updating role:', updateErr.message);
        } else {
          console.log(`✓ Admin role confirmed for: ${ADMIN_EMAIL}`);
        }
      }
      return;
    }
    console.error('Error creating user:', authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log(`✓ Auth user created: ${userId}`);

  // 2. Set profile role to 'admin' (trigger should create profile automatically)
  // Wait briefly for trigger to fire
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: ADMIN_EMAIL,
      full_name: ADMIN_NAME,
      role: 'admin',
    }, { onConflict: 'id' });

  if (profileError) {
    console.error('Error setting admin profile:', profileError.message);
  } else {
    console.log('✓ Admin profile created with role: admin');
  }

  console.log('\n========================================');
  console.log('  ADMIN ACCOUNT CREATED SUCCESSFULLY');
  console.log('========================================');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  Role:     admin`);
  console.log('========================================');
  console.log('\nLogin at: http://localhost:3000/login');
}

createAdminUser();
