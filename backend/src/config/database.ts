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
      const isRemoteDb =
        env.DATABASE_URL.includes('supabase.co') ||
        env.DATABASE_URL.includes('pooler.supabase.com') ||
        env.DATABASE_URL.includes('sslmode=require');

      pool = new Pool({
        connectionString: env.DATABASE_URL,
        ssl: env.NODE_ENV === 'production' || isRemoteDb ? { rejectUnauthorized: false } : undefined,
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
      // Safe host and connection mode extraction (NEVER log password or full connection URL)
      let targetHost = 'unknown';
      let targetPort = '5432';
      let connectionMode = 'Direct PostgreSQL';
      try {
        const parsed = new URL(env.DATABASE_URL);
        targetHost = parsed.hostname;
        targetPort = parsed.port || '5432';
        if (targetHost.includes('pooler.supabase.com')) {
          connectionMode = targetPort === '6543' ? 'Supabase Transaction Pooler' : 'Supabase Session Pooler';
        } else if (targetHost.includes('supabase.co')) {
          connectionMode = 'Supabase Direct Connection';
        }
      } catch {
        // Safe fallback if URL parsing fails
      }

      // Extract detailed error messages (including Node.js 18+ AggregateError sub-errors)
      const subErrors = Array.isArray(err?.errors)
        ? err.errors.map((e: any) => e.message || e.code).filter(Boolean).join('; ')
        : '';
      const errorMessage =
        err?.message && err.message.trim() !== ''
          ? err.message
          : subErrors || err?.code || 'Connection failed or timed out';
      const errorCode = err?.code || (Array.isArray(err?.errors) && err.errors[0]?.code) || 'UNKNOWN_ERROR';

      // SSL-specific diagnostic info if present
      const sslInfo =
        err?.routine ||
        err?.severity ||
        (typeof err?.message === 'string' && err.message.toLowerCase().includes('ssl') ? err.message : null) ||
        (err?.code && String(err.code).startsWith('ERR_SSL') ? err.code : null);

      console.error(`❌ [Database] PostgreSQL connection failed:`);
      console.error(`   - Error Message:   ${errorMessage}`);
      console.error(`   - Error Code:      ${errorCode}`);
      console.error(`   - Target Host:     ${targetHost}:${targetPort} (${connectionMode})`);
      if (subErrors && subErrors !== errorMessage) {
        console.error(`   - Sub-errors:      ${subErrors}`);
      }
      if (sslInfo) {
        console.error(`   - SSL Info:        ${sslInfo}`);
      }
      if (err?.detail) {
        console.error(`   - Error Detail:    ${err.detail}`);
      }
      if (err?.hint) {
        console.error(`   - Error Hint:      ${err.hint}`);
      }
      console.log(`💾 [Database] Operating in resilient persistent local storage mode (rpg_store.json).`);

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
