import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import dotenv from 'dotenv';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local so DATABASE_URL is available
dotenv.config({ path: resolve(__dirname, '..', '.env.local') });

const { Client } = pg;

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const run = async (label, sqlPath) => {
    const full = resolve(__dirname, '..', sqlPath);
    const sql = readFileSync(full, 'utf8');
    console.log(`\n-- Applying: ${label} (${sqlPath})`);
    await client.query(sql);
    console.log(`-- Done: ${label}`);
  };

  try {
    await client.query('create extension if not exists pgcrypto;');
    await run('schema', 'db/schema.sql');
    await run('seed models', 'db/seed_models.sql');
    console.log('\nAll SQL applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

