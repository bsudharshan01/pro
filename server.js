import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const { Pool } = pg;
const useSqlite = !process.env.DATABASE_URL;
const sqlite = useSqlite ? new DatabaseSync(join(root, 'campus-arena.db')) : null;
const pool = useSqlite ? {
  async query(sql, values = []) {
    const parameters = [];
    const statement = sql.replace(/\$(\d+)/g, (_, index) => {
      parameters.push(values[Number(index) - 1]);
      return '?';
    });
    if (/^\s*(SELECT|WITH|PRAGMA)/i.test(statement) || /\bRETURNING\b/i.test(statement)) {
      const rows = sqlite.prepare(statement).all(...parameters);
      return { rows, rowCount: rows.length };
    }
    const result = sqlite.prepare(statement).run(...parameters);
    return { rows: [], rowCount: Number(result.changes) };
  }
} : new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const sessions = new Map();

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, stored) {
  const [salt, expected] = stored.split(':');
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}
function buildBadges(points = 0) {
  const badges = [];
  if (Number(points) >= 30) badges.push('Helpful Contributor');
  if (Number(points) >= 80) badges.push('Opportunity Explorer');
  if (Number(points) >= 150) badges.push('Campus Mentor');
  return badges.join(' | ');
}
function send(response, status, data, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  response.end(JSON.stringify(data));
}
function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || '').split(';').filter(Boolean).map(item => {
    const index = item.indexOf('=');
    return [item.slice(0, index).trim(), decodeURIComponent(item.slice(index + 1))];
  }));
}
async function currentUser(request) {
  const userId = sessions.get(parseCookies(request).campus_session);
  if (!userId) return null;
  const result = await pool.query('SELECT id, name, college, email, bio, profile_image, role, points, badges, interests, skills, course, eligibility FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}
async function body(request) {
  let raw = '';
  for await (const chunk of request) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}
async function publicEvent(event, userId) {
  const saved = userId && (await pool.query('SELECT 1 FROM saved_events WHERE user_id = $1 AND event_id = $2', [userId, event.id])).rowCount;
  const applied = userId && (await pool.query('SELECT 1 FROM applications WHERE user_id = $1 AND event_id = $2', [userId, event.id])).rowCount;
  return { ...event, saved: Boolean(saved), applied: Boolean(applied) };
}
async function createSchema() {
  if (useSqlite) {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, college TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, bio TEXT DEFAULT '', profile_image TEXT DEFAULT '', security_college TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT 'user', points INTEGER NOT NULL DEFAULT 0, badges TEXT NOT NULL DEFAULT '', interests TEXT NOT NULL DEFAULT '', skills TEXT NOT NULL DEFAULT '', course TEXT NOT NULL DEFAULT '', eligibility TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL, date TEXT NOT NULL, deadline TEXT DEFAULT '', mode TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Pending', org TEXT NOT NULL, "desc" TEXT NOT NULL, href TEXT NOT NULL, votes INTEGER NOT NULL DEFAULT 0, created_by INTEGER REFERENCES users(id), created_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS saved_events (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, event_id));
      CREATE TABLE IF NOT EXISTS applications (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, event_id));
      CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id), event_id INTEGER REFERENCES events(id), reason TEXT DEFAULT 'Community report', status TEXT NOT NULL DEFAULT 'Open', reviewed_by INTEGER REFERENCES users(id), reviewed_at TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, rating INTEGER NOT NULL, comment TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, event_id));
      CREATE TABLE IF NOT EXISTS follows (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, org TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, org));
    `);
    try { sqlite.exec("ALTER TABLE events ADD COLUMN deadline TEXT DEFAULT ''"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    try { sqlite.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    try { sqlite.exec("ALTER TABLE users ADD COLUMN points INTEGER NOT NULL DEFAULT 0"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    try { sqlite.exec("ALTER TABLE users ADD COLUMN badges TEXT NOT NULL DEFAULT ''"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    try { sqlite.exec("ALTER TABLE users ADD COLUMN interests TEXT NOT NULL DEFAULT ''"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    try { sqlite.exec("ALTER TABLE users ADD COLUMN skills TEXT NOT NULL DEFAULT ''"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    try { sqlite.exec("ALTER TABLE users ADD COLUMN course TEXT NOT NULL DEFAULT ''"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    try { sqlite.exec("ALTER TABLE users ADD COLUMN eligibility TEXT NOT NULL DEFAULT ''"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    try { sqlite.exec("ALTER TABLE reports ADD COLUMN status TEXT NOT NULL DEFAULT 'Open'"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    try { sqlite.exec("ALTER TABLE reports ADD COLUMN reviewed_by INTEGER"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    try { sqlite.exec("ALTER TABLE reports ADD COLUMN reviewed_at TEXT"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    const adminExists = sqlite.prepare('SELECT 1 FROM users WHERE email = ?').get('bsudharshan@gmail.com');
    if (!adminExists) {
      sqlite.prepare('INSERT INTO users (name, college, email, password_hash, security_college, role, points, badges) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run('Campus Admin', 'Campus Arena', 'bsudharshan@gmail.com', hashPassword('sudharshan@123'), 'Campus Arena', 'admin', 150, buildBadges(150));
    }
    return;
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name TEXT NOT NULL, college TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, bio TEXT DEFAULT '', profile_image TEXT DEFAULT '', security_college TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT 'user', points INTEGER NOT NULL DEFAULT 0, badges TEXT NOT NULL DEFAULT '', interests TEXT NOT NULL DEFAULT '', skills TEXT NOT NULL DEFAULT '', course TEXT NOT NULL DEFAULT '', eligibility TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS events (id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, date TEXT NOT NULL, deadline TEXT DEFAULT '', mode TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Pending', org TEXT NOT NULL, "desc" TEXT NOT NULL, href TEXT NOT NULL, votes INTEGER NOT NULL DEFAULT 0, created_by INTEGER REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS saved_events (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, event_id));
    CREATE TABLE IF NOT EXISTS applications (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, event_id));
    CREATE TABLE IF NOT EXISTS reports (id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id INTEGER REFERENCES users(id), event_id INTEGER REFERENCES events(id), reason TEXT DEFAULT 'Community report', status TEXT NOT NULL DEFAULT 'Open', reviewed_by INTEGER REFERENCES users(id), reviewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS reviews (id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, rating INTEGER NOT NULL, comment TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, event_id));
    CREATE TABLE IF NOT EXISTS follows (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, org TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, org));
  `);
  await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS deadline TEXT DEFAULT ''");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS badges TEXT NOT NULL DEFAULT ''");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT NOT NULL DEFAULT ''");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT NOT NULL DEFAULT ''");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS course TEXT NOT NULL DEFAULT ''");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS eligibility TEXT NOT NULL DEFAULT ''");
  await pool.query("ALTER TABLE reports ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Open'");
  await pool.query("ALTER TABLE reports ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id)");
  await pool.query("ALTER TABLE reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ");
  const adminExists = await pool.query('SELECT 1 FROM users WHERE email = $1', ['bsudharshan@gmail.com']);
  if (!adminExists.rowCount) {
    await pool.query('INSERT INTO users (name, college, email, password_hash, security_college, role, points, badges) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', ['Campus Admin', 'Campus Arena', 'bsudharshan@gmail.com', hashPassword('sudharshan@123'), 'Campus Arena', 'admin', 150, buildBadges(150)]);
  }
  const count = Number((await pool.query('SELECT COUNT(*) AS count FROM events')).rows[0].count);
  if (!count) {
    const seed = [
      ['Global Game Jam 2026','Hackathon','Jan 30, 2026','Remote','Verified','Game Makers Guild','Build something playful with a global community in 48 hours.','https://globalgamejam.org/',128],
      ['Women in Tech Fellowship','Internship','Feb 12, 2026','On-site','Verified','Northstar Labs','A paid, mentor-led product engineering fellowship for students.','https://www.linkedin.com/jobs/',94],
      ['CodeSprint: FinTech Edition','Coding','Feb 21, 2026','Remote','Pending','Open Ledger','Solve real financial access problems and win a $5,000 prize.','https://devpost.com/',61],
      ['National Design Challenge','Competition','Mar 04, 2026','On-site','Verified','Design Council','Shape the future of accessible public services with your team.','https://www.aiga.org/',77],
      ['Campus Climate Summit','Event','Mar 18, 2026','On-site','Verified','Green Campus Network','Meet student leaders turning climate ideas into local action.','https://www.un.org/en/climatechange',46],
      ['AI Research Assistantship','Internship','Apr 01, 2026','Remote','Verified','Arc Research','Work alongside researchers on responsible machine learning.','https://www.indeed.com/',112]
    ];
    for (const event of seed) await pool.query('INSERT INTO events (title, category, date, mode, status, org, "desc", href, votes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', event);
  }
  const newHackathons = [
    ['NASA Space Apps Challenge 2026','Hackathon','Oct 03, 2026','On-site','Verified','NASA Space Apps','An international hackathon where coders, scientists, designers, and storytellers use open-source space data to solve real-world problems.','https://www.spaceappschallenge.org/',156],
    ['Google Solution Challenge','Hackathon','Oct 15, 2026','Remote','Verified','Google Developer Student Clubs','Build a solution using Google technologies to address one or more of the United Nations 17 Sustainable Development Goals.','https://developers.google.com/community/gdsc-solution-challenge',143],
    ['Microsoft Imagine Cup','Hackathon','Nov 01, 2026','Remote','Verified','Microsoft','Build an innovative technology solution using Microsoft Azure for mentorship, prizes, and global recognition.','https://imaginecup.microsoft.com/',137],
    ['MLH Hackathon Season 2026','Hackathon','Nov 07, 2026','Remote','Verified','Major League Hacking','Join a global weekend hackathon season with tracks including Web3, AI/ML, cloud development, and open source.','https://mlh.io/seasons/2026/events',121],
    ['Smart India Hackathon (SIH)','Hackathon','Dec 01, 2026','On-site','Verified','Government of India','Tackle pressing problem statements from government ministries, departments, and industry leaders.','https://sih.gov.in/',175],
    ['GreenTech Sustainability Hack 2026','Hackathon','Dec 12, 2026','On-site','Pending','Eduverb','A hybrid national hackathon focused on software and hardware solutions for climate change and lower carbon footprints.','https://campus.eduverb.in/hackathons',88],
    ['InnovaHack Chapter 1','Hackathon','Jan 09, 2027','On-site','Pending','Unstop','An elite 24-hour national hackathon focused on Generative AI, FinTech, and Blockchain with pre-placement opportunities.','https://unstop.com/hackathons',102],
    ['Cyber Shield: Enterprise DevSecOps','Hackathon','Jan 23, 2027','On-site','Pending','Eduverb','Build resilient Zero Trust infrastructure frameworks and defend against digital security threats.','https://campus.eduverb.in/hackathons',79]
  ];
  for (const event of newHackathons) await pool.query('INSERT INTO events (title, category, date, mode, status, org, "desc", href, votes) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9 WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = $1)', event);
  const internships = [
    ['Product Intern - AI Assistants','Internship','Sep 28, 2026','Remote','Verified','NovaStack Labs','Build and test AI-powered productivity tools for student workflows and internal knowledge workflows.','https://novastack.example/internships',142],
    ['Frontend Engineering Intern','Internship','Oct 08, 2026','Remote','Verified','ByteForge','Create responsive product experiences for a fast-growing B2B SaaS platform used by campus communities.','https://byteforge.example/jobs',136],
    ['Data Science Intern','Internship','Oct 14, 2026','On-site','Verified','SignalIQ','Work with product and research teams to analyze retention, user behavior, and predictive models.','https://signaliq.example/careers',128],
    ['Cybersecurity Analyst Intern','Internship','Oct 22, 2026','On-site','Verified','Redline Systems','Support the security operations team with research, threat monitoring, and vulnerability reviews.','https://redline.example/internships',119],
    ['UX Research Intern','Internship','Nov 04, 2026','Hybrid','Verified','Canvas Studio','Interview users, map pain points, and shape the next generation of student-focused digital products.','https://canvasstudio.example/jobs',113],
    ['Cloud Infrastructure Intern','Internship','Nov 11, 2026','Remote','Verified','CloudNest','Help deploy and monitor infrastructure, improve internal automation, and support cloud reliability.','https://cloudnest.example/careers',108],
    ['SDE Intern - Campus to Career','Internship','Nov 25, 2026','Hybrid','Verified','Asteron Tech','Join a mentor-led internship program focused on full-stack engineering, APIs, and product delivery.','https://asteron.example/internships',134],
    ['Research Intern - Human-AI Interaction','Internship','Dec 02, 2026','Hybrid','Verified','Mimic Labs','Explore how AI can improve student collaboration, interfaces, and interaction design in practical settings.','https://mimic.example/research',125],
    ['Business Development Intern','Internship','Dec 09, 2026','On-site','Verified','Northstar Ventures','Support startup outreach, partner reporting, and student engagement across campus ecosystems.','https://northstarventures.example/careers',99],
    ['Mobile App Intern','Internship','Dec 18, 2026','Remote','Verified','Pioneer Mobile','Work on Android and iOS product improvements, testing, and release-ready polish for a student-first app.','https://pioneermobile.example/jobs',96]
  ];
  for (const event of internships) await pool.query('INSERT INTO events (title, category, date, mode, status, org, "desc", href, votes) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9 WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = $1)', event);
  const techSummits = [
    ['Web Summit 2026','Tech Summit','Nov 09, 2026','On-site','Verified','Web Summit','One of the world\'s largest technology conferences, bringing tech leaders, founders, investors, and policymakers together around AI, Web3, enterprise software, and startup growth.','https://websummit.com/',149],
    ['Mobile World Congress (MWC) 2027','Tech Summit','Mar 01, 2027','On-site','Verified','GSMA','The premier summit for connectivity, mobile technology, 5G/6G infrastructure, hardware innovation, and edge computing.','https://www.mwcbarcelona.com/',132],
    ['AWS Global Summit Series 2026','Tech Summit','Oct 20, 2026','On-site','Verified','Amazon Web Services','Free worldwide regional summits for the cloud community to connect and learn about AWS, generative AI, and serverless architectures.','https://aws.amazon.com/events/summits/',118],
    ['Gartner IT Symposium/Xpo','Tech Summit','Oct 26, 2026','On-site','Verified','Gartner','A strategic technology gathering for CIOs and IT executives focused on AI governance, cybersecurity, digital transformation, and enterprise technology roadmaps.','https://www.gartner.com/en/conferences',97],
    ['Bengaluru Tech Summit (BTS) 2026','Tech Summit','Nov 17, 2026','On-site','Verified','Government of Karnataka','Asia\'s largest technology summit covering deep tech, artificial intelligence, biotech, semiconductors, and global innovation ecosystems in Bengaluru.','https://bengalurutechsummit.com/',126],
    ['Global Fintech Fest (GFF) 2026','Tech Summit','Sep 29, 2026','On-site','Verified','Global Fintech Fest','A global fintech summit in Mumbai focused on Agentic AI, digital public infrastructure, tokenization, and inclusive finance.','https://www.globalfintechfest.com/',111],
    ['SEMICON India 2026','Tech Summit','Sep 18, 2026','On-site','Pending','SEMICON India','India\'s flagship microelectronics and semiconductor summit for chip designers, supply chain partners, global leaders, and policymakers in New Delhi.','https://semiconindia.org/',84],
    ['ELCIA Tech Summit 2026','Tech Summit','Dec 05, 2026','On-site','Pending','ELCIA','A regional technology summit in Electronics City, Bengaluru focused on robotics, Industry 5.0, AI integration, semiconductor manufacturing, and deep-tech startups.','https://elciatechsummit.in/',73],
    ['Campus Startup Meet 2026','Event','Sep 22, 2026','On-site','Verified','LaunchPad Network','Meet founders, investors, and student builders for a high-energy campus startup showcase with live demos and networking.','https://launchpad.example/events',92],
    ['Design for Impact Summit','Event','Oct 19, 2026','Hybrid','Verified','Design Collective','An interactive design event featuring workshops, critique sessions, and portfolio feedback for aspiring product and UX talent.','https://designcollective.example/summit',87],
    ['Women in AI Bootcamp','Event','Nov 28, 2026','Remote','Verified','AI for Her','A hands-on workshop series on generative AI, ethics, and career readiness for women in technology.','https://aiforher.example/workshops',81],
    ['Campus Innovation Fair 2026','Event','Dec 08, 2026','On-site','Verified','Innovation Cell','Explore student startups, prototypes, and research showcases across engineering, biotech, and social impact.','https://innovationcell.example/fair',75]
  ];
  for (const summit of techSummits) await pool.query('INSERT INTO events (title, category, date, mode, status, org, "desc", href, votes) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9 WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = $1)', summit);
}

async function api(request, response, pathname) {
  const user = await currentUser(request);
  try {
    if (request.method === 'GET' && pathname === '/api/me') return send(response, 200, { user: user || null });
    if (request.method === 'GET' && pathname === '/api/admin/overview') {
      if (!user || user.role !== 'admin') return send(response, 403, { error: 'Admin access required.' });
      const [events, users, reports] = await Promise.all([
        pool.query('SELECT COUNT(*) AS count, SUM(CASE WHEN status = $1 THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status = $2 THEN 1 ELSE 0 END) AS verified FROM events', ['Pending', 'Verified']),
        pool.query('SELECT COUNT(*) AS count FROM users'),
        pool.query('SELECT COUNT(*) AS count FROM reports')
      ]);
      const categoryCounts = await pool.query('SELECT category, COUNT(*) AS count FROM events GROUP BY category ORDER BY count DESC');
      const modeCounts = await pool.query('SELECT mode, COUNT(*) AS count FROM events GROUP BY mode ORDER BY count DESC');
      return send(response, 200, {
        overview: {
          totalEvents: Number(events.rows[0].count || 0),
          pendingEvents: Number(events.rows[0].pending || 0),
          verifiedEvents: Number(events.rows[0].verified || 0),
          totalUsers: Number(users.rows[0].count || 0),
          reportsCount: Number(reports.rows[0].count || 0),
          categoryCounts: categoryCounts.rows,
          modeCounts: modeCounts.rows
        }
      });
    }
    if (request.method === 'GET' && pathname === '/api/admin/events') {
      if (!user || user.role !== 'admin') return send(response, 403, { error: 'Admin access required.' });
      const eventsResult = await pool.query('SELECT id, title, category, date, deadline, mode, status, org, "desc", href, votes, created_by FROM events ORDER BY CASE status WHEN \'Pending\' THEN 0 ELSE 1 END, date DESC, id DESC');
      return send(response, 200, { events: eventsResult.rows });
    }
    if (request.method === 'GET' && pathname === '/api/admin/reports') {
      if (!user || user.role !== 'admin') return send(response, 403, { error: 'Admin access required.' });
      const reports = await pool.query('SELECT reports.id, reports.reason, reports.status, reports.created_at, reports.event_id, events.title AS event_title, events.status AS event_status, reporters.name AS reporter_name FROM reports LEFT JOIN events ON events.id = reports.event_id LEFT JOIN users AS reporters ON reporters.id = reports.user_id ORDER BY CASE reports.status WHEN \'Open\' THEN 0 ELSE 1 END, reports.created_at DESC');
      return send(response, 200, { reports: reports.rows });
    }
    if (request.method === 'POST' && /^\/api\/admin\/reports\/(\d+)\/(resolve|dismiss)$/.test(pathname)) {
      if (!user || user.role !== 'admin') return send(response, 403, { error: 'Admin access required.' });
      const match = pathname.match(/^\/api\/admin\/reports\/(\d+)\/(resolve|dismiss)$/);
      const status = match[2] === 'resolve' ? 'Resolved' : 'Dismissed';
      await pool.query('UPDATE reports SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP WHERE id = $3', [status, user.id, Number(match[1])]);
      return send(response, 200, { ok: true, status });
    }
    if (request.method === 'PUT' && /^\/api\/admin\/events\/\d+$/.test(pathname)) {
      if (!user || user.role !== 'admin') return send(response, 403, { error: 'Admin access required.' });
      const eventId = Number(pathname.split('/').pop());
      const data = await body(request);
      if (!data.title || !data.category || !data.date || !data.deadline || !data.mode || !data.org || !data.desc || !data.href) return send(response, 400, { error: 'All opportunity fields are required.' });
      await pool.query('UPDATE events SET title = $1, category = $2, date = $3, deadline = $4, mode = $5, status = $6, org = $7, "desc" = $8, href = $9 WHERE id = $10', [data.title.trim(), data.category, data.date, data.deadline, data.mode, data.status || 'Pending', data.org.trim(), data.desc.trim(), data.href.trim(), eventId]);
      const event = (await pool.query('SELECT id, title, category, date, deadline, mode, status, org, "desc", href, votes, created_by FROM events WHERE id = $1', [eventId])).rows[0];
      return event ? send(response, 200, { event }) : send(response, 404, { error: 'Opportunity not found.' });
    }
    if (request.method === 'POST' && pathname === '/api/admin/events') {
      if (!user || user.role !== 'admin') return send(response, 403, { error: 'Admin access required.' });
      const data = await body(request);
      if (!data.title || !data.category || !data.date || !data.deadline || !data.mode || !data.org || !data.desc || !data.href) return send(response, 400, { error: 'All opportunity fields are required.' });
      const result = await pool.query('INSERT INTO events (title, category, date, deadline, mode, status, org, "desc", href, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id', [data.title.trim(), data.category, data.date, data.deadline, data.mode, data.status || 'Verified', data.org.trim(), data.desc.trim(), data.href.trim(), user.id]);
      const event = (await pool.query('SELECT id, title, category, date, deadline, mode, status, org, "desc", href, votes, created_by FROM events WHERE id = $1', [result.rows[0].id])).rows[0];
      return send(response, 201, { event });
    }
    if (request.method === 'DELETE' && /^\/api\/admin\/events\/\d+$/.test(pathname)) {
      if (!user || user.role !== 'admin') return send(response, 403, { error: 'Admin access required.' });
      const eventId = Number(pathname.split('/').pop());
      await pool.query('DELETE FROM reports WHERE event_id = $1', [eventId]);
      await pool.query('DELETE FROM saved_events WHERE event_id = $1', [eventId]);
      await pool.query('DELETE FROM applications WHERE event_id = $1', [eventId]);
      const result = await pool.query('DELETE FROM events WHERE id = $1', [eventId]);
      return result.rowCount ? send(response, 200, { ok: true }) : send(response, 404, { error: 'Opportunity not found.' });
    }
    if (request.method === 'POST' && /^\/api\/admin\/events\/(\d+)\/(approve|reject)$/.test(pathname)) {
      if (!user || user.role !== 'admin') return send(response, 403, { error: 'Admin access required.' });
      const match = pathname.match(/^\/api\/admin\/events\/(\d+)\/(approve|reject)$/);
      const eventId = Number(match[1]);
      const action = match[2];
      const status = action === 'approve' ? 'Verified' : 'Rejected';
      const event = (await pool.query('SELECT created_by FROM events WHERE id = $1', [eventId])).rows[0];
      await pool.query('UPDATE events SET status = $1 WHERE id = $2', [status, eventId]);
      if (action === 'approve' && event?.created_by) {
        const contributor = (await pool.query('SELECT points, badges FROM users WHERE id = $1', [event.created_by])).rows[0];
        const newPoints = Number(contributor?.points || 0) + 30;
        await pool.query('UPDATE users SET points = $1, badges = $2 WHERE id = $3', [newPoints, buildBadges(newPoints), event.created_by]);
      }
      return send(response, 200, { ok: true, status });
    }
    if (request.method === 'GET' && pathname === '/api/events') {
      const eventsResult = await pool.query('SELECT id, title, category, date, deadline, mode, status, org, "desc", href, votes FROM events ORDER BY date, id');
      const events = await Promise.all(eventsResult.rows.map(async event => ({ ...(await publicEvent(event, user?.id)), reviewCount: Number((await pool.query('SELECT COUNT(*) AS count FROM reviews WHERE event_id = $1', [event.id])).rows[0].count || 0), averageRating: Number((await pool.query('SELECT AVG(rating) AS average FROM reviews WHERE event_id = $1', [event.id])).rows[0].average || 0), followed: Boolean(user && (await pool.query('SELECT 1 FROM follows WHERE user_id = $1 AND org = $2', [user.id, event.org])).rowCount) })));
      return send(response, 200, { events });
    }
    if (request.method === 'POST' && pathname === '/api/auth/signup') {
      const data = await body(request);
      if (!data.name || !data.college || !data.email || !data.password || data.password.length < 8) return send(response, 400, { error: 'Name, college, email, and an 8-character password are required.' });
      const result = await pool.query('INSERT INTO users (name, college, email, password_hash, security_college, points, badges) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id', [data.name.trim(), data.college.trim(), data.email.toLowerCase().trim(), hashPassword(data.password), data.college.trim(), 0, buildBadges(0)]);
      const token = randomUUID(); sessions.set(token, Number(result.rows[0].id));
      return send(response, 201, { user: await currentUser({ headers: { cookie: `campus_session=${token}` } }) }, { 'Set-Cookie': `campus_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800` });
    }
    if (request.method === 'POST' && pathname === '/api/auth/login') {
      const data = await body(request);
      const record = (await pool.query('SELECT * FROM users WHERE email = $1', [data.email?.toLowerCase().trim()])).rows[0];
      if (!record || !verifyPassword(data.password || '', record.password_hash)) return send(response, 401, { error: 'Invalid email or password.' });
      const token = randomUUID(); sessions.set(token, record.id);
      return send(response, 200, { user: await currentUser({ headers: { cookie: `campus_session=${token}` } }) }, { 'Set-Cookie': `campus_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800` });
    }
    if (request.method === 'POST' && pathname === '/api/auth/logout') {
      sessions.delete(parseCookies(request).campus_session); return send(response, 200, { ok: true }, { 'Set-Cookie': 'campus_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' });
    }
    if (!user) return send(response, 401, { error: 'Authentication required.' });
    const reviewMatch = pathname.match(/^\/api\/events\/(\d+)\/reviews$/);
    if (request.method === 'POST' && reviewMatch) {
      const data = await body(request);
      const rating = Math.max(1, Math.min(5, Number(data.rating)));
      if (!Number.isInteger(rating) || !data.comment?.trim()) return send(response, 400, { error: 'Rating and review text are required.' });
      await pool.query('INSERT INTO reviews (user_id, event_id, rating, comment) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, event_id) DO UPDATE SET rating = $3, comment = $4', [user.id, Number(reviewMatch[1]), rating, data.comment.trim()]);
      return send(response, 201, { ok: true });
    }
    const followMatch = pathname.match(/^\/api\/organizations\/follow$/);
    if (request.method === 'POST' && followMatch) {
      const data = await body(request);
      const org = String(data.org || '').trim();
      if (!org) return send(response, 400, { error: 'Organization is required.' });
      const existing = await pool.query('SELECT 1 FROM follows WHERE user_id = $1 AND org = $2', [user.id, org]);
      if (existing.rowCount) await pool.query('DELETE FROM follows WHERE user_id = $1 AND org = $2', [user.id, org]);
      else await pool.query('INSERT INTO follows (user_id, org) VALUES ($1, $2)', [user.id, org]);
      return send(response, 200, { followed: !existing.rowCount });
    }
    if (request.method === 'PUT' && pathname === '/api/me') {
      const data = await body(request);
      const interests = String(data.interests || user.interests || '');
      const skills = String(data.skills || user.skills || '');
      const course = String(data.course || user.course || '');
      const eligibility = String(data.eligibility || user.eligibility || '');
      await pool.query('UPDATE users SET name = $1, college = $2, bio = $3, profile_image = $4, interests = $5, skills = $6, course = $7, eligibility = $8 WHERE id = $9', [data.name?.trim() || user.name, data.college?.trim() || user.college, data.bio || '', data.profileImage || '', interests, skills, course, eligibility, user.id]);
      return send(response, 200, { user: await currentUser(request) });
    }
    if (request.method === 'POST' && pathname === '/api/auth/reset-password') {
      const data = await body(request);
      const record = (await pool.query('SELECT security_college FROM users WHERE id = $1', [user.id])).rows[0];
      if (!record || record.security_college.trim().toLowerCase() !== String(data.collegeAnswer || '').trim().toLowerCase()) return send(response, 400, { error: 'College name incorrect.' });
      if (!data.password || data.password.length < 8) return send(response, 400, { error: 'Password must be at least 8 characters.' });
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashPassword(data.password), user.id]);
      return send(response, 200, { ok: true });
    }
    const eventMatch = pathname.match(/^\/api\/events\/(\d+)\/(save|apply|report|upvote)$/);
    if (request.method === 'POST' && eventMatch) {
      const eventId = Number(eventMatch[1]); const action = eventMatch[2];
      if (action === 'save') {
        const existing = await pool.query('SELECT 1 FROM saved_events WHERE user_id = $1 AND event_id = $2', [user.id, eventId]);
        if (existing.rowCount) await pool.query('DELETE FROM saved_events WHERE user_id = $1 AND event_id = $2', [user.id, eventId]);
        else await pool.query('INSERT INTO saved_events (user_id, event_id) VALUES ($1, $2)', [user.id, eventId]);
      }
      if (action === 'apply') await pool.query('INSERT INTO applications (user_id, event_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.id, eventId]);
      if (action === 'report') await pool.query('INSERT INTO reports (user_id, event_id) VALUES ($1, $2)', [user.id, eventId]);
      if (action === 'upvote') await pool.query('UPDATE events SET votes = votes + 1 WHERE id = $1', [eventId]);
      return send(response, 200, { ok: true });
    }
    if (request.method === 'POST' && pathname === '/api/events') {
      const data = await body(request);
      if (!data.title || !data.category || !data.deadline || !data.href || !data.desc) return send(response, 400, { error: 'Title, category, deadline, URL, and description are required.' });
      const result = await pool.query('INSERT INTO events (title, category, date, deadline, mode, status, org, "desc", href, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id', [data.title, data.category, 'Pending review', data.deadline, 'Remote', 'Pending', user.name, data.desc, data.href, user.id]);
      const event = (await pool.query('SELECT id, title, category, date, deadline, mode, status, org, "desc", href, votes FROM events WHERE id = $1', [result.rows[0].id])).rows[0];
      return send(response, 201, { event: await publicEvent(event, user.id) });
    }
    return send(response, 404, { error: 'Route not found.' });
  } catch (error) {
    if (error.code === '23505' || error.errcode === 2067) return send(response, 409, { error: 'An account with that email already exists.' });
    console.error(error); return send(response, 500, { error: 'Unexpected server error.' });
  }
}
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8' };
const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname.startsWith('/api/')) return api(request, response, url.pathname);
  let file = normalize(join(root, url.pathname === '/' ? 'index.html' : url.pathname));
  if (!file.startsWith(root) || !existsSync(file)) return send(response, 404, { error: 'Not found.' });
  response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
  response.end(await readFile(file));
});
createSchema()
  .then(() => server.listen(port, () => console.log(`Campus Arena running at http://localhost:${port}`)))
  .catch(error => { console.error('PostgreSQL startup failed:', error); process.exitCode = 1; });
