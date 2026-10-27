import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const isProduction =
  process.env.NODE_ENV === 'production' ||
  Boolean(process.env.RENDER) ||
  Boolean(process.env.RAILWAY_ENVIRONMENT) ||
  (process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes('localhost') &&
    !process.env.DATABASE_URL.includes('127.0.0.1'));

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'braindump',
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Auto-initialize required schema if not yet present
const initSchema = async () => {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) DEFAULT 'New Conversation',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        raw_content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_session_created ON messages(session_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user_created ON journal_entries(user_id, created_at DESC);

      INSERT INTO users (id, email, name, password)
      VALUES (
        '123e4567-e89b-12d3-a456-426614174000',
        'demo@secondbrain.local',
        'Demo User',
        '$2b$10$G2RuqSG7ZHnmkDUpBcRtseDTo5bM2Pkz/oa4o.S1AHwsoOqhVqB8S'
      )
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('PostgreSQL: Database schema and tables verified/initialized successfully.');
  } catch (err) {
    console.error('PostgreSQL schema auto-initialization error:', err.message);
  }
};

initSchema();

export default pool;
