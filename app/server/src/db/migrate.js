const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function migrate() {
  console.log('🚀 Running database migrations...\n');

  // Create migrations tracking table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      ran_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Get list of migration files
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  // Get already-ran migrations
  const { rows: ran } = await pool.query('SELECT name FROM _migrations ORDER BY name');
  const ranNames = new Set(ran.map(r => r.name));

  let count = 0;

  for (const file of files) {
    if (ranNames.has(file)) {
      console.log(`  ⏭️  ${file} (already ran)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

    try {
      await pool.query('BEGIN');
      await pool.query(sql);
      await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      await pool.query('COMMIT');
      console.log(`  ✅ ${file}`);
      count++;
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error(`  ❌ ${file} — ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`\n✅ ${count} migration(s) applied.`);
  await pool.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
