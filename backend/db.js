import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'braindump',
    }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Safe startup query ensuring password column exists in users table
pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);')
  .then(() => {
    console.log('PostgreSQL: users table schema verified.');
  })
  .catch((err) => {
    console.error('PostgreSQL schema verification warning:', err.message);
  });

export default pool;

