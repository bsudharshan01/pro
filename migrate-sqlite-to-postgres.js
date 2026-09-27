import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';

const { Pool } = pg;
const sqlitePath = new URL('./campus-arena.db', import.meta.url);
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
if (!existsSync(sqlitePath)) throw new Error('campus-arena.db was not found.');

const sqlite = new DatabaseSync(fileURLToPath(sqlitePath));
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const client = await pool.connect();

try {
  await client.query('BEGIN');
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name TEXT NOT NULL, college TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, bio TEXT DEFAULT '', profile_image TEXT DEFAULT '', security_college TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS events (id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, date TEXT NOT NULL, deadline TEXT DEFAULT '', mode TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Pending', org TEXT NOT NULL, "desc" TEXT NOT NULL, href TEXT NOT NULL, votes INTEGER NOT NULL DEFAULT 0, created_by INTEGER REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS saved_events (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, event_id));
    CREATE TABLE IF NOT EXISTS applications (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, event_id));
    CREATE TABLE IF NOT EXISTS reports (id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id INTEGER REFERENCES users(id), event_id INTEGER REFERENCES events(id), reason TEXT DEFAULT 'Community report', created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
  `);

  for (const row of sqlite.prepare('SELECT id, name, college, email, password_hash, bio, profile_image, security_college, created_at FROM users').all()) {
    await client.query(`INSERT INTO users (id, name, college, email, password_hash, bio, profile_image, security_college, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, college=EXCLUDED.college, email=EXCLUDED.email, password_hash=EXCLUDED.password_hash, bio=EXCLUDED.bio, profile_image=EXCLUDED.profile_image, security_college=EXCLUDED.security_college`,
    [row.id, row.name, row.college, row.email, row.password_hash, row.bio || '', row.profile_image || '', row.security_college || '', row.created_at]);
  }
  for (const row of sqlite.prepare('SELECT id, title, category, date, deadline, mode, status, org, desc, href, votes, created_by, created_at FROM events').all()) {
    await client.query(`INSERT INTO events (id, title, category, date, deadline, mode, status, org, "desc", href, votes, created_by, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, category=EXCLUDED.category, date=EXCLUDED.date, deadline=EXCLUDED.deadline, mode=EXCLUDED.mode, status=EXCLUDED.status, org=EXCLUDED.org, "desc"=EXCLUDED."desc", href=EXCLUDED.href, votes=EXCLUDED.votes, created_by=EXCLUDED.created_by`,
    [row.id, row.title, row.category, row.date, row.deadline || '', row.mode, row.status, row.org, row.desc, row.href, row.votes, row.created_by, row.created_at]);
  }
  for (const table of ['saved_events', 'applications']) {
    for (const row of sqlite.prepare(`SELECT user_id, event_id, created_at FROM ${table}`).all()) {
      await client.query(`INSERT INTO ${table} (user_id, event_id, created_at) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [row.user_id, row.event_id, row.created_at]);
    }
  }
  for (const row of sqlite.prepare('SELECT id, user_id, event_id, reason, created_at FROM reports').all()) {
    await client.query('INSERT INTO reports (id, user_id, event_id, reason, created_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING', [row.id, row.user_id, row.event_id, row.reason, row.created_at]);
  }
  for (const table of ['users', 'events', 'reports']) {
    await client.query(`SELECT setval(pg_get_serial_sequence($1, 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1), true)`, [table]);
  }
  await client.query('COMMIT');
  console.log('SQLite data migrated to PostgreSQL.');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
  sqlite.close();
}
