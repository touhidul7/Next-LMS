/**
 * Apply SQL migration via Supabase REST Management API
 * Uses the pg_execute or admin endpoint to run raw SQL
 */
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '20260914000000_initial_schema.sql');
const fullSql = fs.readFileSync(sqlPath, 'utf8');

/**
 * Supabase supports running SQL via the pg_meta API or directly via psql connection.
 * We'll try the pg_meta admin API which is available in Supabase.
 */
async function runMigrationViaAPI() {
  const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
  
  // Try the Supabase management API (available for project admins)
  const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  console.log(`Attempting migration via Supabase Management API...`);
  console.log(`Project: ${projectRef}`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: fullSql }),
    });

    const text = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response: ${text.slice(0, 500)}`);

    if (response.ok) {
      console.log('\n✓ Migration applied successfully via Management API!');
      return true;
    }
  } catch (err) {
    console.log(`Management API attempt failed: ${err.message}`);
  }

  // Try pg_meta API (available within project)
  const pgMetaUrl = `${SUPABASE_URL}/pg-meta/v0/query`;
  console.log(`\nTrying pg-meta API...`);

  try {
    const response = await fetch(pgMetaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: fullSql }),
    });

    const text = await response.text();
    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      console.log('\n✓ Migration applied via pg-meta API!');
      return true;
    }
    console.log(`Response: ${text.slice(0, 500)}`);
  } catch (err) {
    console.log(`pg-meta API attempt failed: ${err.message}`);
  }

  // Try splitting by semicolons and running via RPC  
  console.log('\nTrying statement-by-statement via Supabase RPC...');
  
  // Split into individual statements
  const statements = fullSql
    .split(/;(\s*\n|\s*$)/)
    .map(s => s.trim())
    .filter(s => s.length > 10 && !s.startsWith('--'));

  let successCount = 0;
  let failCount = 0;

  for (const stmt of statements.slice(0, 5)) { // test with first 5
    try {
      const rpcUrl = `${SUPABASE_URL}/rest/v1/rpc/exec`;
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ sql: stmt + ';' }),
      });
      
      if (res.ok) successCount++;
      else failCount++;
    } catch {
      failCount++;
    }
  }

  console.log(`RPC results: ${successCount} succeeded, ${failCount} failed`);

  console.log('\n⚠ Automated migration failed. Manual step required:');
  console.log('\nPlease apply the schema manually by going to:');
  console.log(`https://supabase.com/dashboard/project/cwjhfkjbztgbfdnqnmnj/sql/new`);
  console.log('\nCopy and paste the entire contents of:');
  console.log('  supabase/migrations/20260914000000_initial_schema.sql');
  console.log('\nThen click "Run".');
  return false;
}

runMigrationViaAPI();
