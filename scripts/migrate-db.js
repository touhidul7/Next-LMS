import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';

// Read .env file
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const password = process.env.NEXT_PUBLIC_SUPABASE_PASSWORD || 'Touhidulislam77';
const projectRef = 'cwjhfkjbztgbfdnqnmnj';

const connectionStrings = [
  `postgres://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`,
  `postgres://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  `postgres://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
  `postgres://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
];

async function runMigration() {
  const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '20260914000000_initial_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  for (const connStr of connectionStrings) {
    const host = connStr.split('@')[1].split('/')[0];
    console.log(`Trying connection to ${host}...`);

    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      console.log(`✓ Connected to ${host}! Executing migration script...`);

      await client.query(sql);
      console.log('✓ Migration executed successfully! All tables, enums, triggers, and RLS policies created.');
      await client.end();
      return true;
    } catch (err) {
      console.log(`Connection to ${host} failed: ${err.message}`);
      try { await client.end(); } catch (e) {}
    }
  }

  console.error('\nCould not automatically connect via direct database connection strings.');
  console.log('\nPlease run the SQL content in `supabase/migrations/20260914000000_initial_schema.sql` directly inside your Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/cwjhfkjbztgbfdnqnmnj/sql');
  return false;
}

runMigration();
