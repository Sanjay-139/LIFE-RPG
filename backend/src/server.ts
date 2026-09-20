import { app } from './app.js';
import { env } from './config/env.js';
import { initDatabase, pool, isPostgresConnected } from './config/database.js';

async function startServer() {
  console.log('====================================================');
  console.log('             LIFE RPG PRODUCTION BACKEND            ');
  console.log('    Server-Authoritative Progression & Gamification ');
  console.log('====================================================');

  // Initialize Database / Check Connection
  await initDatabase();

  // Auto-run schema migrations on database connection
  if (isPostgresConnected) {
    try {
      const { runMigrations } = await import('./database/migrate.js');
      await runMigrations();
    } catch (migErr) {
      console.warn('⚠️ [Migrations] Automatic migration check:', migErr);
    }
  }

  // Production check: Fail clearly if production lacks database configuration
  if (env.NODE_ENV === 'production' && !isPostgresConnected) {
    console.error('❌ [Fatal] Production requires valid DATABASE_URL or SUPABASE configuration. Startup aborted.');
    process.exit(1);
  }

  const port = Number(process.env.PORT) || 5000;

  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`LIFE RPG Server listening on port ${port}`);
    console.log(`📡 API Base Path:             http://0.0.0.0:${port}/api`);
    console.log(`🩺 Health Check:              http://0.0.0.0:${port}/api/health`);
    console.log(`🌐 Frontend Allowed:          ${env.FRONTEND_URL}`);
    console.log(`🎮 Progression Engine:        Active (Authoritative XP, Gold, Streaks)`);
    console.log(`💾 Persistence Status:        ${isPostgresConnected ? 'Supabase/PostgreSQL Connected' : 'Persistent Local Storage File (rpg_store.json)'}`);
    console.log('====================================================\n');
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      if (pool) {
        await pool.end();
        console.log('🔌 Database pool closed.');
      }
      console.log('👋 LIFE RPG backend terminated safely.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch(err => {
  console.error('💥 Fatal error starting LIFE RPG server:', err);
  process.exit(1);
});
