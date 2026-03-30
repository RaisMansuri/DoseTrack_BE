const { Pool } = require('pg');
const { DATABASE_URL } = require('./env');

const shouldUseSsl = DATABASE_URL.includes('supabase.co');

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
    })
  : null;

async function query(text, params = []) {
  if (!pool) {
    throw new Error('DATABASE_URL is missing. Copy .env.example to .env and add your Supabase Postgres connection string.');
  }

  return pool.query(text, params);
}

module.exports = {
  pool,
  query
};
