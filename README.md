# Campus Arena

## Run locally

Requires Node.js 22.5+. When `DATABASE_URL` is not set, the app uses the included `campus-arena.db` SQLite database for local development.

```powershell
npm start
```

Open http://localhost:4173.

To use PostgreSQL instead, set `DATABASE_URL` before starting the server:

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

The server creates the PostgreSQL tables and seed events on first run. It provides PostgreSQL-backed signup/login, HttpOnly sessions, events, saves, application tracking, reports, votes, and authenticated event submissions.

## Migrate existing SQLite data

If `campus-arena.db` contains accounts, events, or activity from the previous version, set `DATABASE_URL` and run:

```powershell
npm run migrate
```

The migration preserves IDs and existing records. Keep the SQLite file as a backup until you verify the PostgreSQL database.
