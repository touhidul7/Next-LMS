/**
 * Applies the LMS migration SQL via Supabase REST API (Management API)
 * Uses the service role key to execute raw SQL statements
 */
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim().replace(/\r$/, '');
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        process.env[key] = value;
      }
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '20260914000000_initial_schema.sql');
const fullSql = fs.readFileSync(sqlPath, 'utf8');

// Split SQL into logical statements to avoid size limits
// We'll send the entire SQL as one batch through the Supabase SQL API
async function applySql(sql) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/execute_sql`;
  // Try Management API approach
  const mgmtUrl = SUPABASE_URL.replace('.supabase.co', '.supabase.co').replace('https://', '');
  const projectRef = mgmtUrl.split('.')[0];

  // Use the SQL execution via Supabase JS client with service role
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'HEAD',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase connection test failed: ${response.status}`);
  }

  console.log('✓ Supabase REST API connection verified');

  // Supabase doesn't expose raw SQL via REST - need to use pg client or dashboard
  // Let's verify the project is accessible and then output instructions
  return { connected: true };
}

async function testConnection() {
  try {
    console.log(`\nTesting Supabase connection to: ${SUPABASE_URL}`);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });

    if (response.ok || response.status === 200) {
      console.log('✓ Supabase project is accessible and responding!');
      console.log('\n📋 NEXT STEP — Run Schema Migration:');
      console.log('Since direct PostgreSQL access is restricted, please apply the schema via:');
      console.log('\n  Option 1: Supabase Dashboard SQL Editor');
      console.log(`  → https://supabase.com/dashboard/project/cwjhfkjbztgbfdnqnmnj/sql/new`);
      console.log('  → Copy and paste the contents of: supabase/migrations/20260914000000_initial_schema.sql');
      console.log('\n  Option 2: Supabase CLI (if installed)');
      console.log('  → supabase db push');
      return true;
    } else {
      console.error(`Unexpected status: ${response.status}`);
      return false;
    }
  } catch (err) {
    console.error('Connection error:', err.message);
    return false;
  }
}

testConnection();
