# Campus Arena

## Run locally

Requires Node.js 22.5+. When `DATABASE_URL` is not set, the app uses the included `campus-arena.db` SQLite database for local development.

```powershell
npm start
```

Open http://localhost:4173.

## Saved shortlist

Signed-in students can export their saved opportunities as a CSV from the dashboard’s **Saved events** tab.

## Validate changes

Run the automated smoke tests and JavaScript syntax checks with:

```powershell
npm run check
```

The tests start an isolated server on an available port and use a temporary SQLite database. They do not modify `campus-arena.db`. Coverage includes seeded opportunity categories and dated workshops, local assistant guidance, contextual and profile-based assistant recommendations, signup/login validation, save and follow toggles, report validation, admin access control, logout, application tracking and expiry, and student opportunity submissions.

## AI assistant

The student assistant runs locally and needs no external AI key. It can search current opportunities by category, location, and format; continue a listing search with filters or “show me more”; and rank listings against interests, skills, course, and eligibility saved in a signed-in student's profile. It also provides focused guidance for applications, resumes, interviews, study plans, and student projects. Recent chat is stored in the browser, follow-up suggestions are available, and **New chat** clears local history.

This is a rule-based assistant, not a general-purpose language model. It does not have live web access, and profile matches are suggestions—not eligibility decisions. Confirm availability and requirements on organizer pages. For factual questions outside its supported areas, it says when it cannot verify an answer rather than guessing.

To use PostgreSQL instead, set `DATABASE_URL` before starting the server:

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

The server creates the PostgreSQL tables and seed events on first run. It provides PostgreSQL-backed signup/login, HttpOnly sessions, events, saves, application tracking, reports, votes, and authenticated event submissions.

Reserved `.example` seed URLs are marked Rejected during startup. Known past dates are hidden from discovery and featured listings, while saved history remains available and is labeled expired. Built-in sample listings are marked Pending until a moderator reviews them; their placeholder vote counts are cleared once by a database migration. ABB's Software Tech Lead listing is categorized as a Job.

## Migrate existing SQLite data

If `campus-arena.db` contains accounts, events, or activity from the previous version, set `DATABASE_URL` and run:

```powershell
npm run migrate
```

The migration preserves IDs and existing records. Keep the SQLite file as a backup until you verify the PostgreSQL database.
