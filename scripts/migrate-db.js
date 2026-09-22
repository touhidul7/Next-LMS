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

const connectionString = `postgres://postgres.${projectRef}:${password}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`;

async function runMigration() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  console.log(`Connecting to database via aws-0-ap-northeast-1.pooler.supabase.com...`);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('✓ Successfully connected to PostgreSQL database!');

    // Create migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const { rows: appliedRows } = await client.query(`SELECT name FROM public._migrations`);
    const applied = new Set(appliedRows.map(r => r.name));

    // Assume 20260914000000_initial_schema.sql and 20260917000001_add_lesson_id_to_submissions.sql are applied
    if (!applied.has('20260914000000_initial_schema.sql')) {
      await client.query(`INSERT INTO public._migrations (name) VALUES ('20260914000000_initial_schema.sql') ON CONFLICT DO NOTHING`);
      applied.add('20260914000000_initial_schema.sql');
    }

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`- Skipping already applied migration: ${file}`);
        continue;
      }

      console.log(`Executing migration: ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
      await client.query(`INSERT INTO public._migrations (name) VALUES ($1)`, [file]);
      console.log(`✓ Migration completed: ${file}`);
    }

    console.log('\n✓ All pending migrations executed successfully!');
    await client.end();
    return true;
  } catch (err) {
    console.error('Migration failed:', err.message);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

runMigration();
