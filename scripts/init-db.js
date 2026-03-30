const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function main() {
  if (!pool) {
    throw new Error('DATABASE_URL is missing. Copy .env.example to .env and update the Supabase connection string first.');
  }

  const schemaPath = path.join(__dirname, '..', 'src', 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  await pool.query(sql);
  await pool.end();
  console.log('Database schema initialized successfully.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
