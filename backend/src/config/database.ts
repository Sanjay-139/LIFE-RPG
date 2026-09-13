import pg from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

const { Pool } = pg;

export let pool: pg.Pool | null = null;
export let supabase: SupabaseClient | null = null;
export let isPostgresConnected = false;

export async function initDatabase(): Promise<boolean> {
  // 1. Check direct PostgreSQL connection pool if configured
  if (env.DATABASE_URL) {
    try {
      pool = new Pool({
        connectionString: env.DATABASE_URL,
        ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });

      const client = await pool.connect();
      const res = await client.query('SELECT NOW() as now');
      client.release();

      isPostgresConnected = true;
      console.log(`✅ [Database] PostgreSQL connected successfully at ${res.rows[0].now}`);
    } catch (err: any) {
      console.warn(`⚠️ [Database] PostgreSQL connection failed (${err?.message}). Operating in resilient persistent local storage mode.`);
      pool = null;
      isPostgresConnected = false;
    }
  } else {
    console.log('ℹ️ [Database] DATABASE_URL not supplied. Operating in resilient persistent local storage mode.');
  }

  // 2. Initialize Supabase Admin Client if configured
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      console.log('✅ [Database] Supabase Admin Client initialized.');
    } catch (err: any) {
      console.warn(`⚠️ [Database] Supabase client init error: ${err?.message}`);
      supabase = null;
    }
  }

  return isPostgresConnected;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (pool && isPostgresConnected) {
    const result = await pool.query(text, params);
    return result.rows as T[];
  }
  return [];
}

export async function withTransaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  if (!pool || !isPostgresConnected) {
    throw new Error('Database pool not connected for transaction');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
