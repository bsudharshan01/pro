import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';

const root = fileURLToPath(new URL('.', import.meta.url));
const configuredPort = Number(process.env.PORT ?? 4173);
let port = configuredPort;
const { Pool } = pg;
const useSqlite = !process.env.DATABASE_URL;
const sqlite = useSqlite ? new DatabaseSync(process.env.SQLITE_PATH || join(root, 'campus-arena.db')) : null;
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
function eventDate(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const isoDate = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = isoDate
    ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
    : new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function isEventExpired(event, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return [event.deadline, event.date].some(value => {
    const date = eventDate(value);
    return date && date.getTime() < today;
  });
}
async function applySeedDataReviewMigration() {
  const migration = 'seed-listings-require-moderation-v1';
  const applied = await pool.query('SELECT 1 FROM app_migrations WHERE name = $1', [migration]);
  if (applied.rowCount) return;
  await pool.query("UPDATE events SET status = 'Pending', votes = 0 WHERE created_by IS NULL AND status = 'Verified'");
  await pool.query('INSERT INTO app_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING', [migration]);
}
async function clearSeedVoteCounts() {
  const migration = 'clear-seed-vote-counts-v1';
  const applied = await pool.query('SELECT 1 FROM app_migrations WHERE name = $1', [migration]);
  if (applied.rowCount) return;
  await pool.query('UPDATE events SET votes = 0 WHERE created_by IS NULL');
  await pool.query('INSERT INTO app_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING', [migration]);
}
async function removeDuplicateCodgenSeeds() {
  await pool.query(`DELETE FROM events
    WHERE org = $1 AND href = $2 AND created_by IS NULL
      AND title IN ($3, $4)
      AND id <> (SELECT MIN(id) FROM events WHERE org = $1 AND href = $2 AND created_by IS NULL)
      AND NOT EXISTS (SELECT 1 FROM saved_events WHERE event_id = events.id)
      AND NOT EXISTS (SELECT 1 FROM applications WHERE event_id = events.id)
      AND NOT EXISTS (SELECT 1 FROM reports WHERE event_id = events.id)
      AND NOT EXISTS (SELECT 1 FROM reviews WHERE event_id = events.id)`, ['Codgen', 'https://www.codgen.in/', 'Hands-On Project Internship', 'Codgen Student Project Program']);
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
function generateAssistantReply(question, history, catalog, user) {
  const lastUserMessage = [...history].reverse().find(message => message.role === 'user')?.content || '';
  const lastAssistantMessage = [...history].reverse().find(message => message.role === 'model')?.content || '';
  const isContinuation = /\b(more|next|continue|other ones|show more)\b/i.test(question);
  const isContextualFilter = /\b(remote|online|on[- ]?site|in person|which one|which should|what about|those|these)\b/i.test(question)
    && !/\b(intern|hack|summit|workshop|coding|job|event|opportunit|listing|competition)\b/i.test(question);
  const effectiveQuestion = (isContinuation || isContextualFilter) && lastUserMessage
    ? `${lastUserMessage} ${question}`
    : question;
  const query = effectiveQuestion.toLowerCase();
  const followUps = [];
  const categories = [
    ['Internship', /\bintern(ship)?s?\b|\bplacements?\b/],
    ['Hackathon', /\bhackathons?\b|\bhacks?\b/],
    ['Tech Summit', /\btech(?:nology)? summits?\b|\bconferences?\b/],
    ['Coding', /\bcoding\b|\bprogramming\b|\bworkshops?\b|\bdeveloper events?\b/],
    ['Competition', /\bcompetitions?\b|\bcontests?\b/],
    ['Job', /\bjobs?\b|\bfull[- ]time\b/],
    ['Event', /\bevents?\b|\bbootcamps?\b/]
  ].filter(([, pattern]) => pattern.test(query)).map(([category]) => category);
  const asksForListings = categories.length > 0 || /\b(opportunities|listings|openings)\b/.test(query)
    || (isContinuation && /\b(opportunities|listings|openings|intern|hack|summit|workshop|coding|job|event|competition)\b/i.test(lastUserMessage));
  const wantsPersonalized = /\b(recommend|recommendation|for me|my interests|personaliz|best match|good fit)\b/.test(query);

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(query)) {
    return { text: `Hi${user?.name ? `, ${user.name}` : ''}! I can search the current opportunity feed, explain applications, or help with resumes, interviews, study plans, and projects. What would you like to work on?`, followUps: ['Find internships', 'How do I apply?', 'Help with my resume'] };
  }

  if (asksForListings || wantsPersonalized) {
    let results = catalog.filter(event => !categories.length || categories.includes(event.category));
    const location = query.match(/\b(bengaluru|bangalore|pune|mumbai|hyderabad|delhi|chennai)\b/);
    if (location) {
      const requestedLocation = location[1] === 'bangalore' ? 'bengaluru' : location[1];
      results = results.filter(event => `${event.title} ${event.organization} ${event.description}`.toLowerCase().includes(requestedLocation)
        || (requestedLocation === 'bengaluru' && `${event.title} ${event.organization} ${event.description}`.toLowerCase().includes('bangalore')));
    }
    if (/\bremote\b|\bonline\b/.test(query)) results = results.filter(event => /remote|online/i.test(event.mode));
    if (/\bon[- ]?site\b|\bin person\b/.test(query)) results = results.filter(event => /on-site|in person/i.test(event.mode));
    if (wantsPersonalized) {
      const statedPreferences = query.match(/(?:interested in|interests? (?:include|are)|i like|i enjoy|i study|my field is)\s+([^?.!,]+)/)?.[1] || '';
      const profileTerms = `${user?.interests || ''} ${user?.skills || ''} ${user?.course || ''} ${user?.eligibility || ''} ${statedPreferences}`
        .toLowerCase().split(/[^a-z0-9+#.]+/).filter(term => term.length > 2 && !['recommend', 'opportunities', 'opportunity', 'please', 'find', 'show', 'current', 'some'].includes(term));
      if (!profileTerms.length) {
        return { text: 'I can make a more relevant shortlist if you add your interests, skills, course, or eligibility in your profile. You can also tell me those details here, such as “I study computer science and like data science.”', followUps: ['Find all current opportunities', 'How do I update my profile?'] };
      }
      const ranked = results.map(event => {
        const searchable = `${event.title} ${event.category} ${event.organization} ${event.description}`.toLowerCase();
        const score = profileTerms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
        return { event, score };
      }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
      results = ranked.map(item => item.event);
      if (!results.length) {
        return { text: 'I could not find a current listing that clearly matches the interests and skills in your profile. You can still browse all listings, or add more specific interests or skills to improve matching.', followUps: ['Show all current opportunities', 'Find coding workshops'] };
      }
    }
      const previouslyShown = isContinuation
      ? [...lastAssistantMessage.matchAll(/• ([^\n]+?) —/g)].map(match => match[1])
      : [];
    if (previouslyShown.length) results = results.filter(event => !previouslyShown.includes(event.title));
    if (!wantsPersonalized) results.sort((a, b) => (eventDate(a.date)?.getTime() ?? Infinity) - (eventDate(b.date)?.getTime() ?? Infinity));
    if (!results.length) {
      return { text: isContinuation
        ? 'That was the last matching listing in the current feed. You can broaden the category, location, or format filters to see more.'
        : 'I could not find a current listing matching those filters in the Campus Arena feed. Try another category or location, and check the organizer’s site for opportunities not listed here.',
      followUps: ['Show all current opportunities', 'Find remote internships'] };
    }
    const matches = results.slice(0, 5).map(event =>
      `• ${event.title} — ${event.category}; ${event.date}; ${event.mode}; ${event.status} review. Organizer: ${event.organization}. Check current availability and eligibility on the organizer page: ${event.url}`
    );
    if (!isContinuation && results.length > 5) followUps.push('Show me more');
    followUps.push('How do I apply for one of these?', 'Show remote opportunities');
    return {
      text: `I found ${results.length} ${wantsPersonalized ? 'potentially relevant ' : ''}current listing${results.length === 1 ? '' : 's'}${previouslyShown.length ? ' not shown in the previous reply' : ''}${results.length > 5 ? ' (showing up to 5)' : ''}. This is a match to listing text and your profile, not a guarantee of eligibility or fit. Review status is not a guarantee that registration is open; confirm details with the organizer.\n\n${matches.join('\n')}`,
      followUps
    };
  }

  if (/\bhow (do|can) i apply\b|\bapplication process\b|\bapply for\b|\bapplying\b/.test(query)) {
    return { text: 'Open a listing and review its requirements, eligibility, dates, and official organizer link. Choose Apply Now, confirm that you intend to apply, then complete the application on the organizer’s site. Campus Arena can track your intent, but it does not submit the application for you.', followUps: ['Find current opportunities', 'Help me prepare a resume'] };
  }
  if (/\b(resume|résumé|cv|curriculum vitae)\b/.test(query)) {
    return { text: 'For a clear student resume: keep it to one page when possible, tailor the top section to the role, and include education, relevant skills, projects, and experience. Describe projects with action + method + result, and quantify impact only when you can support the number. Check spelling and make sure every claim is accurate. If you share a draft with personal contact details removed, I can give focused feedback.', followUps: ['Review my project description', 'How should I prepare for interviews?'] };
  }
  if (/\b(interview|interviews)\b/.test(query)) {
    return { text: 'Start by reviewing the role description and preparing a few concise examples of your work using situation, action, and result. Practice explaining one project, what you contributed, a challenge you faced, and what you learned. Prepare questions for the interviewer and verify the interview format with the employer.', followUps: ['Help me explain a project', 'How can I improve my resume?'] };
  }
  if (/\b(study|studying|exam|exams|learn|learning|time management|focus)\b/.test(query)) {
    return { text: 'A practical study plan is to define one small outcome for each session, work in focused blocks with short breaks, and finish by recalling the material without looking at your notes. Revisit difficult topics later rather than only rereading them. If you tell me the subject and deadline, I can help outline a schedule.', followUps: ['Make me a study plan', 'How do I stay focused?'] };
  }
  if (/\b(project|portfolio|build|building)\b/.test(query)) {
    return { text: 'Choose a small problem you understand, define a usable first version, and build only the features needed to demonstrate it. Document your decisions, your own contribution, setup steps, and what you would improve next. A portfolio project is strongest when someone else can run it and see the result.', followUps: ['Suggest a beginner project', 'How do I describe a project on my resume?'] };
  }
  if (/\b(what can you do|help|assistant)\b/.test(query)) {
    return { text: 'I can search the current Campus Arena opportunity feed and offer practical guidance on applications, resumes, interviews, study plans, and student projects. I do not have live web access, so confirm changing details such as deadlines, eligibility, and availability with the original source. For other factual questions, I will say when I cannot verify the answer.', followUps: ['Find current opportunities', 'Help me improve my resume'] };
  }

  if (/update my profile|edit my profile|how do i update my profile/.test(query)) {
    return { text: 'Open your profile from the avatar menu, add your interests, skills, course, and eligibility, then save. The assistant can use those details to rank matching Campus Arena listings.', followUps: ['Recommend opportunities for me', 'Find coding workshops'] };
  }
  return {
    text: 'I don’t have enough reliable information to answer that accurately, and I don’t want to guess. I can help with Campus Arena listings, applications, resumes, interviews, study plans, or student projects. For current facts outside the app, please verify with an authoritative source.',
    followUps: ['Find current opportunities', 'How do I apply?', 'Help me improve my resume']
  };
}
async function publicEvent(event, userId) {
  const saved = userId && (await pool.query('SELECT 1 FROM saved_events WHERE user_id = $1 AND event_id = $2', [userId, event.id])).rowCount;
  const applied = userId && (await pool.query('SELECT 1 FROM applications WHERE user_id = $1 AND event_id = $2', [userId, event.id])).rowCount;
  return { ...event, saved: Boolean(saved), applied: Boolean(applied) };
}
const bengaluruInternships = [
  ['Software Engineering Intern - Bengaluru','Internship','Check listing','On-site','Pending','Flipkart','Bengaluru-focused software engineering opportunity. Check Flipkart Careers for current openings, eligibility, location, and application dates.','https://www.flipkartcareers.com/',214],
  ['AI and Data Science Intern - Bengaluru','Internship','Check listing','On-site','Pending','NVIDIA','Explore AI and data science internship openings based in Bengaluru. Confirm the active role and student eligibility on NVIDIA Careers.','https://www.nvidia.com/en-us/about-nvidia/careers/',196],
  ['Product Analytics Intern - Bengaluru','Internship','Check listing','Hybrid','Pending','Meesho','Bengaluru-focused product analytics opportunity. Check Meesho Careers for current openings, work arrangement, and application requirements.','https://careers.meesho.com/',188],
  ['Product Design Intern - Bengaluru','Internship','Check listing','On-site','Pending','Myntra','Explore product design internship openings in Bengaluru. Confirm the active role, portfolio expectations, and eligibility on the official careers page.','https://careers.myntra.com/',201],
  ['Machine Learning Intern - Bengaluru','Internship','Check listing','On-site','Pending','Gojek','Bengaluru-focused machine learning opportunity. Check Gojek Careers for current openings, team location, and student eligibility.','https://www.gojek.io/careers',219],
  ['Software Tech Lead - Bengaluru','Job','Check listing','On-site','Pending','ABB','ABB Software Tech Lead job opportunity in Bengaluru. Check the official listing for current requirements and application details.','https://abb.wd3.myworkdayjobs.com/en-US/External_Career_Page/job/Bangalore-Karnataka-India/Software-Tech-Lead_JR00050067-1?source=mygwork',0]
];
const projectInternships = [
  ['Project-Based Technology Internship','Internship','Check listing','Remote','Pending','MTK Secure Academy','Explore project-based technology internship programs. Check the official page for project tracks, eligibility, duration, and application details.','https://www.academy.mtksecure.in/programs/project-based',0],
  ['Project-Based Internship Intake','Internship','Check listing','Remote','Pending','DevsIndia Campus','Explore the DevsIndia Campus project-based internship intake. Check the official page for available projects, eligibility, and program details.','https://campus.devsindia.in/',0],
  ['Codgen Student Project Program','Internship','Check listing','Remote','Pending','Codgen','Codgen describes practical student tasks, project work, and certificates. Its page does not confirm a formal internship role; verify program terms and eligibility on the official site.','https://www.codgen.in/',0]
];
const codingWorkshops = [
  ['Introduction to Python Workshop','Coding','Nov 10, 2026','Remote','Pending','Harvard Chan Bioinformatics Core','Four live online sessions on Nov 10, 13, 17, and 20, 2026 (10 AM–12 PM ET). Hands-on Python and data analysis for life-science researchers; no prior coding experience is required. Harvard-affiliated researchers receive priority, and a registration fee may apply. Check eligibility and current registration details with the organizer.','https://hbctraining.github.io/main/registrations/AllFunders-Introduction-to-Python.html',0],
  ['Python Camp Workshop','Coding','Dec 10, 2026','On-site','Pending','Python User Group - Peshawar','A Python community workshop in Peshawar, Pakistan, listed on Python.org for Dec 10, 2026. Open the official event page for venue details and the organizer RSVP link.','https://www.python.org/events/python-user-group/2248/',0],
  ['Google Developer Workshops & Events','Coding','Check schedule','Remote','Pending','Google for Developers','Browse Google’s official developer event directory for upcoming learning sessions and workshops across Android, web, cloud, and AI. Check the event page for dates, format, eligibility, and registration.','https://developers.google.com/events/',0],
  ['GitHub Developer Workshops & Webinars','Coding','Check schedule','Remote','Pending','GitHub','Explore official GitHub events and webinars for practical sessions on software development, collaboration, and open-source tools. Check the organizer page for upcoming dates and registration.','https://github.com/resources/events',0],
  ['AWS Developer Workshops & Events','Coding','Check schedule','Remote','Pending','Amazon Web Services','Find AWS-led learning events with practical sessions on building and deploying applications. Check the official events page for workshop topics, dates, format, and registration.','https://aws.amazon.com/events/',0],
  ['Python Community Workshops & Events','Coding','Check schedule','Hybrid','Pending','Python Software Foundation','Browse the Python community events calendar for upcoming Python meetups, conferences, and workshops. Confirm the event format, schedule, and registration with its organizer.','https://www.python.org/events/',0],
  ['NVIDIA Deep Learning Institute Workshops','Coding','Check schedule','Hybrid','Pending','NVIDIA','Explore NVIDIA Deep Learning Institute training and workshops covering accelerated computing, AI, and data science. Check the official training page for instructor-led dates, format, and any fees.','https://www.nvidia.com/en-us/training/',0]
];
const upcomingCategoryListings = [
  ['Microsoft Imagine Cup','Hackathon','Nov 01, 2026','Remote','Pending','Microsoft','Explore Microsoft Imagine Cup and check the official site for current competition dates, eligibility, mentorship, and submission requirements.','https://imaginecup.microsoft.com/',0],
  ['MLH Hackathon Season 2026','Hackathon','Nov 07, 2026','Remote','Pending','Major League Hacking','Find upcoming student hackathons in the MLH 2026 season. Confirm event dates, format, eligibility, and registration on the official schedule.','https://mlh.io/seasons/2026/events',0],
  ['Smart India Hackathon (SIH)','Hackathon','Dec 01, 2026','On-site','Pending','Government of India','Tackle problem statements from government ministries, departments, and industry. Check the official site for current schedule and participation details.','https://sih.gov.in/',0],
  ['GreenTech Sustainability Hack 2026','Hackathon','Dec 12, 2026','On-site','Pending','Eduverb','A student hackathon focused on software and hardware ideas for sustainability. Check the organizer page for format, eligibility, and registration.','https://campus.eduverb.in/hackathons',0],
  ['InnovaHack Chapter 1','Hackathon','Jan 09, 2027','On-site','Pending','Unstop','A student hackathon listing on Unstop. Check the organizer page for the current event schedule, eligibility, and registration details.','https://unstop.com/hackathons',0],
  ['Cyber Shield: Enterprise DevSecOps','Hackathon','Jan 23, 2027','On-site','Pending','Eduverb','A DevSecOps-themed hackathon listing. Check the organizer page for current event format, eligibility, and registration.','https://campus.eduverb.in/hackathons',0],
  ['Web Summit 2026','Tech Summit','Nov 09, 2026','On-site','Pending','Web Summit','Technology summit in Lisbon, Nov 9–12, 2026, bringing together technology leaders, startups, and investors. Check the official site for tickets and event details.','https://websummit.com/',0],
  ['Gartner IT Symposium/Xpo','Tech Summit','Oct 26, 2026','On-site','Pending','Gartner','Technology leadership conference. Check the official conference page for the current event location, schedule, and registration.','https://www.gartner.com/en/conferences',0],
  ['Bengaluru Tech Summit (BTS) 2026','Tech Summit','Nov 17, 2026','On-site','Pending','Government of Karnataka','Bengaluru technology summit covering deep tech, AI, biotech, semiconductors, and innovation. Check the official site for schedule and registration.','https://bengalurutechsummit.com/',0],
  ['ELCIA Tech Summit 2026','Tech Summit','Dec 05, 2026','On-site','Pending','ELCIA','Technology summit in Electronics City, Bengaluru. Check the organizer page for current program and registration information.','https://elciatechsummit.in/',0],
  ['Mobile World Congress (MWC) 2027','Tech Summit','Mar 01, 2027','On-site','Pending','GSMA','Technology event focused on mobile connectivity and the broader digital ecosystem. Check the official site for event dates, venue, and registration.','https://www.mwcbarcelona.com/',0]
];
async function createSchema() {
  if (useSqlite) {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, college TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, bio TEXT DEFAULT '', profile_image TEXT DEFAULT '', security_college TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT 'user', points INTEGER NOT NULL DEFAULT 0, badges TEXT NOT NULL DEFAULT '', interests TEXT NOT NULL DEFAULT '', skills TEXT NOT NULL DEFAULT '', course TEXT NOT NULL DEFAULT '', eligibility TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL, date TEXT NOT NULL, deadline TEXT DEFAULT '', mode TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Pending', org TEXT NOT NULL, "desc" TEXT NOT NULL, href TEXT NOT NULL, votes INTEGER NOT NULL DEFAULT 0, created_by INTEGER REFERENCES users(id), created_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS app_migrations (name TEXT PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS saved_events (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, event_id));
      CREATE TABLE IF NOT EXISTS applications (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, event_id));
      CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id), event_id INTEGER REFERENCES events(id), category TEXT NOT NULL DEFAULT 'Other', subject TEXT NOT NULL DEFAULT '', reason TEXT DEFAULT 'Community report', status TEXT NOT NULL DEFAULT 'Open', reviewed_by INTEGER REFERENCES users(id), reviewed_at TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
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
    try { sqlite.exec("ALTER TABLE reports ADD COLUMN category TEXT NOT NULL DEFAULT 'Other'"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    try { sqlite.exec("ALTER TABLE reports ADD COLUMN subject TEXT NOT NULL DEFAULT ''"); } catch (error) { if (!String(error.message).includes('duplicate column name')) throw error; }
    const adminExists = sqlite.prepare('SELECT 1 FROM users WHERE email = ?').get('bsudharshan@gmail.com');
    if (!adminExists) {
      sqlite.prepare('INSERT INTO users (name, college, email, password_hash, security_college, role, points, badges) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run('Campus Admin', 'Campus Arena', 'bsudharshan@gmail.com', hashPassword('sudharshan@123'), 'Campus Arena', 'admin', 150, buildBadges(150));
    }
    for (const event of bengaluruInternships) await pool.query('INSERT INTO events (title, category, date, mode, status, org, "desc", href, votes) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9 WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = $1)', event);
    for (const event of projectInternships) await pool.query('INSERT INTO events (title, category, date, mode, status, org, "desc", href, votes) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9 WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = $1 OR href = $8)', event);
    for (const event of codingWorkshops) await pool.query('INSERT INTO events (title, category, date, mode, status, org, "desc", href, votes) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9 WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = $1 OR href = $8)', event);
    for (const event of upcomingCategoryListings) await pool.query('INSERT INTO events (title, category, date, mode, status, org, "desc", href, votes) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9 WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = $1 OR href = $8)', event);
    await applySeedDataReviewMigration();
    await clearSeedVoteCounts();
    await pool.query("UPDATE events SET status = 'Rejected' WHERE lower(href) LIKE '%://%.example/%' OR lower(href) LIKE '%://%.example'");
    await pool.query("UPDATE events SET category = 'Job' WHERE org = 'ABB' AND title = 'Software Tech Lead - Bengaluru'");
    await pool.query('UPDATE events SET title = $1, "desc" = $2 WHERE org = $3 AND href = $4 AND title = $5', ['Codgen Student Project Program', 'Codgen describes practical student tasks, project work, and certificates. Its page does not confirm a formal internship role; verify program terms and eligibility on the official site.', 'Codgen', 'https://www.codgen.in/', 'Hands-On Project Internship']);
    await removeDuplicateCodgenSeeds();
    return;
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name TEXT NOT NULL, college TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, bio TEXT DEFAULT '', profile_image TEXT DEFAULT '', security_college TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT 'user', points INTEGER NOT NULL DEFAULT 0, badges TEXT NOT NULL DEFAULT '', interests TEXT NOT NULL DEFAULT '', skills TEXT NOT NULL DEFAULT '', course TEXT NOT NULL DEFAULT '', eligibility TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS events (id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, date TEXT NOT NULL, deadline TEXT DEFAULT '', mode TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Pending', org TEXT NOT NULL, "desc" TEXT NOT NULL, href TEXT NOT NULL, votes INTEGER NOT NULL DEFAULT 0, created_by INTEGER REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS app_migrations (name TEXT PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS saved_events (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, event_id));
    CREATE TABLE IF NOT EXISTS applications (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, event_id INTEGER REFERENCES events(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, event_id));
    CREATE TABLE IF NOT EXISTS reports (id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id INTEGER REFERENCES users(id), event_id INTEGER REFERENCES events(id), category TEXT NOT NULL DEFAULT 'Other', subject TEXT NOT NULL DEFAULT '', reason TEXT DEFAULT 'Community report', status TEXT NOT NULL DEFAULT 'Open', reviewed_by INTEGER REFERENCES users(id), reviewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);
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
  await pool.query("ALTER TABLE reports ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Other'");
  await pool.query("ALTER TABLE reports ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT ''");
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
      ['AI Research Assistantship','Internship','Apr 01, 2026','Remote','Verified','Arc Research','Work alongside researchers on responsible machine learning.','https://www.indeed.com/',112],
      ['Google Solution Challenge','Hackathon','Oct 15, 2026','Remote','Verified','Google Developer Student Clubs','Build a solution using Google technologies to address one or more UN SDGs and showcase your impact.','https://developers.google.com/community/gdsc-solution-challenge',143],
      ['AWS Cloud Skills Bootcamp','Event','Oct 28, 2026','Hybrid','Verified','Amazon Web Services','A hands-on cloud learning sprint covering serverless, AI, and practical deployment workshops.','https://aws.amazon.com/training/',89],
      ['Campus Product Design Sprint','Competition','Nov 06, 2026','On-site','Pending','Design Collective','Turn a real campus pain point into a prototype and pitch a user-centered product solution.','https://designcollective.example',72],
      ['Semiconductor Research Internship','Internship','Nov 18, 2026','On-site','Verified','CIRCUIT Labs','Explore chip design, system-level research, and next-gen hardware workflows with a research mentor.','https://www.linkedin.com/jobs/',118],
      ['IndiaBios Innovation Summit','Tech Summit','Dec 03, 2026','On-site','Verified','BioTech Connect','Meet researchers, founders, and students driving biotech, AI, and health-tech innovation.','https://www.indiabiosummit.com/',96],
      ['Startup Weekend Campus Edition','Event','Dec 12, 2026','Hybrid','Verified','Startup Weekend','Validate ideas quickly, build with a team, and pitch to mentors and local founders.','https://startupweekend.org/',84],
      ['Open Source India Sprint','Hackathon','Jan 08, 2027','Remote','Verified','Open Source Community','Collaborate with peers on impactful open-source tools and build a project that solves a real campus challenge.','https://opensource.org/',104],
      ['ClimateTech Fellowship','Internship','Jan 19, 2027','Hybrid','Pending','Emerald Labs','Support sustainable product experiments, climate policy prototypes, and partner research with field experts.','https://climatetech.example/',68],
      ['Campus Creator Lab','Event','Feb 02, 2027','On-site','Verified','Creator Guild','Launch a content, design, or media story with peer feedback, mentorship, and live portfolio review.','https://creatorlab.example/',74],
      ['Women in AI Residency','Internship','Feb 15, 2027','Remote','Verified','AI for Her','Work on applied AI projects, product experiments, and research sprints with mentorship from leading builders.','https://aiforher.example/',128],
      ['AI Sprint for Campus Solutions','Hackathon','Oct 13, 2026','Remote','Verified','Innovation Hub','Build a useful AI product for campus life, get mentor feedback, and present to student founders.','https://innovationhub.example/',160],
      ['Startup Fast Track','Event','Oct 16, 2026','Hybrid','Verified','Founders Circle','Meet startup builders, test your idea, and learn what investors actually care about in a pitch.','https://founderscircle.example/',142],
      ['Design for Good Residency','Internship','Oct 18, 2026','On-site','Verified','Purpose Studio','Work on real-world product and service design challenges with quick mentorship and portfolio reviews.','https://purpose-studio.example/',97],
      ['Campus Launch Lab','Competition','Oct 20, 2026','Remote','Verified','Launch Lab','Prototype a student-led idea, sharpen your pitch, and compete for early-stage founder feedback.','https://launchlab.example/',121]
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
  for (const event of projectInternships) await pool.query('INSERT INTO events (title, category, date, mode, status, org, "desc", href, votes) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9 WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = $1 OR href = $8)', event);
  for (const event of bengaluruInternships) await pool.query('INSERT INTO events (title, category, date, mode, status, org, "desc", href, votes) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9 WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = $1)', event);
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
  for (const event of codingWorkshops) await pool.query('INSERT INTO events (title, category, date, mode, status, org, "desc", href, votes) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9 WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = $1 OR href = $8)', event);
  await applySeedDataReviewMigration();
  await clearSeedVoteCounts();
  await pool.query("UPDATE events SET status = 'Rejected' WHERE lower(href) LIKE '%://%.example/%' OR lower(href) LIKE '%://%.example'");
  await pool.query("UPDATE events SET category = 'Job' WHERE org = 'ABB' AND title = 'Software Tech Lead - Bengaluru'");
  await pool.query('UPDATE events SET title = $1, "desc" = $2 WHERE org = $3 AND href = $4 AND title = $5', ['Codgen Student Project Program', 'Codgen describes practical student tasks, project work, and certificates. Its page does not confirm a formal internship role; verify program terms and eligibility on the official site.', 'Codgen', 'https://www.codgen.in/', 'Hands-On Project Internship']);
  await removeDuplicateCodgenSeeds();
}

async function api(request, response, pathname) {
  const user = await currentUser(request);
  try {
    if (request.method === 'POST' && pathname === '/api/assistant') {
      const data = await body(request);
      const question = typeof data.question === 'string' ? data.question.trim() : '';
      if (!question || question.length > 3000) return send(response, 400, { error: 'Enter a question of 1 to 3,000 characters.' });
      const history = Array.isArray(data.history)
        ? data.history.slice(-16).filter(message =>
          message && ['user', 'model'].includes(message.role) && typeof message.content === 'string'
        ).map(message => ({ role: message.role, content: message.content.slice(0, 1500) }))
        : [];
      const eventResult = await pool.query('SELECT title, category, date, deadline, mode, status, org, "desc", href FROM events WHERE status != $1 ORDER BY id DESC LIMIT 100', ['Rejected']);
      const catalog = eventResult.rows.filter(event => !isEventExpired(event)).map(({ title, category, date, deadline, mode, status, org, desc, href }) => ({
        title, category, date, deadline, mode, status, organization: org, description: desc, url: href
      }));
      const result = generateAssistantReply(question, history, catalog, user);
      return send(response, 200, result);
    }
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
      const reports = await pool.query('SELECT reports.id, reports.category, reports.subject, reports.reason, reports.status, reports.created_at, reports.event_id, events.title AS event_title, events.status AS event_status, reporters.name AS reporter_name, reporters.email AS reporter_email, reporters.college AS reporter_college FROM reports LEFT JOIN events ON events.id = reports.event_id LEFT JOIN users AS reporters ON reporters.id = reports.user_id ORDER BY CASE reports.status WHEN \'Open\' THEN 0 ELSE 1 END, reports.created_at DESC');
      const reportCards = reports.rows.map(report => ({
        ...report,
        event_title: report.subject || report.event_title || 'General support request',
        reason: `${report.category || 'Other'} | ${report.reason || 'Community report'} | Contact: ${report.reporter_email || 'Unavailable'} | College: ${report.reporter_college || 'Unavailable'}${report.event_title ? ` | Opportunity: ${report.event_title}` : ''}`
      }));
      return send(response, 200, { reports: reportCards });
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
      const eventsResult = await pool.query('SELECT id, title, category, date, deadline, mode, status, org, "desc", href, votes FROM events WHERE status != $1 ORDER BY date, id', ['Rejected']);
      const events = await Promise.all(eventsResult.rows.map(async event => ({ ...(await publicEvent(event, user?.id)), expired: isEventExpired(event), reviewCount: Number((await pool.query('SELECT COUNT(*) AS count FROM reviews WHERE event_id = $1', [event.id])).rows[0].count || 0), averageRating: Number((await pool.query('SELECT AVG(rating) AS average FROM reviews WHERE event_id = $1', [event.id])).rows[0].average || 0), followed: Boolean(user && (await pool.query('SELECT 1 FROM follows WHERE user_id = $1 AND org = $2', [user.id, event.org])).rowCount) })));
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
    if (request.method === 'POST' && pathname === '/api/reports') {
      const data = await body(request);
      const categories = ['Safety concern', 'Scam or misleading', 'Expired opportunity', 'Incorrect details', 'Technical issue', 'Other'];
      const category = String(data.category || 'Other').trim();
      const subject = String(data.subject || '').trim();
      const details = String(data.details || '').trim();
      const eventId = data.eventId ? Number(data.eventId) : null;
      if (!categories.includes(category)) return send(response, 400, { error: 'Choose a valid report category.' });
      if (subject.length < 5 || subject.length > 120) return send(response, 400, { error: 'Subject must be between 5 and 120 characters.' });
      if (details.length < 20 || details.length > 3000) return send(response, 400, { error: 'Details must be between 20 and 3000 characters.' });
      if (eventId !== null && (!Number.isInteger(eventId) || !(await pool.query('SELECT 1 FROM events WHERE id = $1', [eventId])).rowCount)) return send(response, 400, { error: 'The selected opportunity could not be found.' });
      const result = await pool.query('INSERT INTO reports (user_id, event_id, category, subject, reason) VALUES ($1, $2, $3, $4, $5) RETURNING id', [user.id, eventId, category, subject, details]);
      return send(response, 201, { ok: true, reportId: result.rows[0].id });
    }
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
      const event = (await pool.query('SELECT date, deadline FROM events WHERE id = $1', [eventId])).rows[0];
      if (!event) return send(response, 404, { error: 'Opportunity not found.' });
      if (action === 'apply' && isEventExpired(event)) return send(response, 410, { error: 'This opportunity has passed. Check the original listing for current availability.' });
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

function listenWithFallback() {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      port += 1;
      console.warn(`Port ${port - 1} is busy. Trying http://localhost:${port} instead.`);
      listenWithFallback();
      return;
    }
    console.error('Server startup failed:', error);
    process.exitCode = 1;
  });

  server.listen(port, () => {
    const address = server.address();
    const listeningPort = typeof address === 'object' && address ? address.port : port;
    console.log(`Campus Arena running at http://localhost:${listeningPort}`);
  });
}

createSchema()
  .then(() => listenWithFallback())
  .catch(error => { console.error('PostgreSQL startup failed:', error); process.exitCode = 1; });
