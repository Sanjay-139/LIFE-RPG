import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, initDatabase } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('🚀 Running LIFE RPG database migrations...');
  await initDatabase();

  if (!pool) {
    console.log('ℹ️ No live PostgreSQL pool configured. Migrations skipped in offline development mode.');
    return;
  }

  // 1. Primary: __dirname/migrations (e.g. dist/database/migrations or src/database/migrations)
  let migrationsDir = path.join(__dirname, 'migrations');

  // 2. Fallback: if running from dist, check relative source location (../../src/database/migrations)
  if (!fs.existsSync(migrationsDir)) {
    const srcFallback = path.resolve(__dirname, '../../src/database/migrations');
    if (fs.existsSync(srcFallback)) {
      migrationsDir = srcFallback;
    }
  }

  // 3. Fallback: check working directory relative path
  if (!fs.existsSync(migrationsDir)) {
    const cwdFallback = path.resolve(process.cwd(), 'src/database/migrations');
    if (fs.existsSync(cwdFallback)) {
      migrationsDir = cwdFallback;
    }
  }

  if (!fs.existsSync(migrationsDir)) {
    console.warn('⚠️ Migrations directory not found at', migrationsDir);
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const client = await pool.connect();
  try {
    for (const file of files) {
      console.log(`📄 Executing migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✅ ${file} applied successfully.`);
    }
    console.log('🎉 All LIFE RPG migrations completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
