import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';

const projectRoot = new URL('../', import.meta.url);
let server;
let baseUrl;
let databaseDirectory;
let serverOutput = '';

before(async () => {
  databaseDirectory = await mkdtemp(join(tmpdir(), 'campus-arena-test-'));
  server = spawn(process.execPath, ['server.js'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: '0',
      SQLITE_PATH: join(databaseDirectory, 'test.db')
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  server.stdout.setEncoding('utf8');
  server.stderr.setEncoding('utf8');
  server.stdout.on('data', chunk => { serverOutput += chunk; });
  server.stderr.on('data', chunk => { serverOutput += chunk; });

  const startup = new Promise((resolve, reject) => {
    const checkOutput = () => {
      const match = serverOutput.match(/Campus Arena running at http:\/\/localhost:(\d+)/);
      if (match) resolve(`http://127.0.0.1:${match[1]}`);
    };
    server.stdout.on('data', checkOutput);
    server.stderr.on('data', checkOutput);
    server.once('error', reject);
    server.once('exit', code => reject(new Error(`Server exited with code ${code}.\n${serverOutput}`)));
  });
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Server did not start in time.\n${serverOutput}`)), 15000).unref();
  });

  baseUrl = await Promise.race([startup, timeout]);
});

after(async () => {
  if (server && server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill();
    await exited;
  }
  if (databaseDirectory) await rm(databaseDirectory, { recursive: true, force: true });
});

test('serves the app and seeded opportunities', async () => {
  const pageResponse = await fetch(baseUrl);
  assert.equal(pageResponse.status, 200);
  assert.match(await pageResponse.text(), /Campus Arena/);

  const stylesResponse = await fetch(`${baseUrl}/styles.css`);
  assert.equal(stylesResponse.status, 200);
  assert.match(stylesResponse.headers.get('content-type'), /text\/css/);

  const eventsResponse = await fetch(`${baseUrl}/api/events`);
  assert.equal(eventsResponse.status, 200);
  const { events } = await eventsResponse.json();
  assert.ok(events.length > 0);
  assert.ok(events.every(event => event.id && event.title && event.status !== 'Rejected'));
  for (const category of ['Internship', 'Hackathon', 'Tech Summit', 'Coding']) {
    assert.ok(events.some(event => event.category === category), `expected at least one ${category} listing`);
  }
  const workshop = events.find(event => event.title === 'Introduction to Python Workshop');
  assert.ok(workshop);
  assert.equal(workshop.status, 'Pending');
  assert.equal(workshop.mode, 'Remote');
  assert.equal(workshop.href, 'https://hbctraining.github.io/main/registrations/AllFunders-Introduction-to-Python.html');
  const pythonCamp = events.find(event => event.title === 'Python Camp Workshop');
  assert.ok(pythonCamp);
  assert.equal(pythonCamp.date, 'Dec 10, 2026');
  assert.equal(pythonCamp.status, 'Pending');
  assert.equal(pythonCamp.href, 'https://www.python.org/events/python-user-group/2248/');
  assert.ok(events.filter(event => event.category === 'Coding').length >= 7);
});

test('answers assistant questions locally without an external AI key', async () => {
  const listingResponse = await fetch(`${baseUrl}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'Find coding workshops', history: [] })
  });
  assert.equal(listingResponse.status, 200);
  const listingAnswer = await listingResponse.json();
  assert.match(listingAnswer.text, /current listing/i);
  assert.match(listingAnswer.text, /Introduction to Python Workshop/);
  assert.match(listingAnswer.text, /confirm details with the organizer/i);
  assert.ok(Array.isArray(listingAnswer.followUps));

  const guidanceResponse = await fetch(`${baseUrl}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'How can I improve my resume?', history: [] })
  });
  assert.equal(guidanceResponse.status, 200);
  const guidanceAnswer = await guidanceResponse.json();
  assert.match(guidanceAnswer.text, /tailor the top section/i);

  const unknownResponse = await fetch(`${baseUrl}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'What is the latest breaking news?', history: [] })
  });
  assert.equal(unknownResponse.status, 200);
  const unknownAnswer = await unknownResponse.json();
  assert.match(unknownAnswer.text, /don’t have enough reliable information/i);

  const contextualResponse = await fetch(`${baseUrl}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Show remote ones',
      history: [{ role: 'user', content: 'Find coding workshops' }]
    })
  });
  assert.equal(contextualResponse.status, 200);
  const contextualAnswer = await contextualResponse.json();
  assert.match(contextualAnswer.text, /Remote/);
  assert.doesNotMatch(contextualAnswer.text, /Hybrid/);

  const personalizedResponse = await fetch(`${baseUrl}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'Recommend opportunities for me; I like Python', history: [] })
  });
  assert.equal(personalizedResponse.status, 200);
  const personalizedAnswer = await personalizedResponse.json();
  assert.match(personalizedAnswer.text, /Introduction to Python Workshop/);
  assert.match(personalizedAnswer.text, /not a guarantee of eligibility or fit/i);

  const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Assistant Student', college: 'Test College', email: 'assistant@example.test', password: 'test-password-123' })
  });
  assert.equal(signupResponse.status, 201);
  const cookie = signupResponse.headers.get('set-cookie').split(';', 1)[0];
  const profileResponse = await fetch(`${baseUrl}/api/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ interests: 'Python', skills: 'Python programming', course: 'Computer Science' })
  });
  assert.equal(profileResponse.status, 200);
  const profileRecommendationResponse = await fetch(`${baseUrl}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ question: 'Recommend opportunities for me', history: [] })
  });
  assert.equal(profileRecommendationResponse.status, 200);
  const profileRecommendation = await profileRecommendationResponse.json();
  assert.match(profileRecommendation.text, /potentially relevant/i);
  assert.match(profileRecommendation.text, /Introduction to Python Workshop/);

  const firstPageTitles = [...listingAnswer.text.matchAll(/• ([^\n]+?) —/g)].map(match => match[1]);
  const moreResponse = await fetch(`${baseUrl}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Show me more',
      history: [
        { role: 'user', content: 'Find coding workshops' },
        { role: 'model', content: listingAnswer.text }
      ]
    })
  });
  assert.equal(moreResponse.status, 200);
  const moreAnswer = await moreResponse.json();
  for (const title of firstPageTitles) assert.ok(!moreAnswer.text.includes(`• ${title} —`));
});

test('validates signup and authenticates a newly registered user', async () => {
  const invalidResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Student', college: 'Test College', email: 'invalid@example.test', password: 'short' })
  });
  assert.equal(invalidResponse.status, 400);

  const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Student', college: 'Test College', email: 'student@example.test', password: 'test-password-123' })
  });
  assert.equal(signupResponse.status, 201);
  const cookie = signupResponse.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/i);

  const meResponse = await fetch(`${baseUrl}/api/me`, {
    headers: { Cookie: cookie.split(';', 1)[0] }
  });
  assert.equal(meResponse.status, 200);
  const { user } = await meResponse.json();
  assert.equal(user.email, 'student@example.test');

  const invalidLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@example.test', password: 'incorrect-password' })
  });
  assert.equal(invalidLogin.status, 401);

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@example.test', password: 'test-password-123' })
  });
  assert.equal(loginResponse.status, 200);
  assert.match(loginResponse.headers.get('set-cookie'), /HttpOnly/i);
});

test('supports saved opportunities, organization follows, reports, and logout', async () => {
  const eventsResponse = await fetch(`${baseUrl}/api/events`);
  const { events } = await eventsResponse.json();
  const event = events.find(item => item.category === 'Coding' && item.date === 'Nov 10, 2026');
  assert.ok(event, 'expected a future coding workshop for authenticated actions');

  const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Flow Test', college: 'Test College', email: 'flow@example.test', password: 'test-password-123' })
  });
  assert.equal(signupResponse.status, 201);
  const cookie = signupResponse.headers.get('set-cookie').split(';', 1)[0];

  const saveResponse = await fetch(`${baseUrl}/api/events/${event.id}/save`, {
    method: 'POST',
    headers: { Cookie: cookie }
  });
  assert.equal(saveResponse.status, 200);
  let savedEvents = await (await fetch(`${baseUrl}/api/events`, { headers: { Cookie: cookie } })).json();
  assert.equal(savedEvents.events.find(item => item.id === event.id).saved, true);

  const unsaveResponse = await fetch(`${baseUrl}/api/events/${event.id}/save`, {
    method: 'POST',
    headers: { Cookie: cookie }
  });
  assert.equal(unsaveResponse.status, 200);
  savedEvents = await (await fetch(`${baseUrl}/api/events`, { headers: { Cookie: cookie } })).json();
  assert.equal(savedEvents.events.find(item => item.id === event.id).saved, false);

  const followOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ org: event.org })
  };
  const followResponse = await fetch(`${baseUrl}/api/organizations/follow`, followOptions);
  assert.equal(followResponse.status, 200);
  assert.equal((await followResponse.json()).followed, true);
  const unfollowResponse = await fetch(`${baseUrl}/api/organizations/follow`, followOptions);
  assert.equal(unfollowResponse.status, 200);
  assert.equal((await unfollowResponse.json()).followed, false);

  const reportResponse = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      category: 'Incorrect details',
      subject: 'Workshop details need checking',
      details: 'The listing has an update that should be reviewed by a moderator.',
      eventId: event.id
    })
  });
  assert.equal(reportResponse.status, 201);
  assert.ok((await reportResponse.json()).reportId);

  const invalidReport = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ category: 'Made up category', subject: 'Invalid report', details: 'This report has an invalid category value.' })
  });
  assert.equal(invalidReport.status, 400);

  const adminResponse = await fetch(`${baseUrl}/api/admin/events`, { headers: { Cookie: cookie } });
  assert.equal(adminResponse.status, 403);

  const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookie }
  });
  assert.equal(logoutResponse.status, 200);
  const meResponse = await fetch(`${baseUrl}/api/me`, { headers: { Cookie: cookie } });
  assert.equal((await meResponse.json()).user, null);
  const unauthenticatedSave = await fetch(`${baseUrl}/api/events/${event.id}/save`, { method: 'POST' });
  assert.equal(unauthenticatedSave.status, 401);
});

test('tracks an application and accepts a student opportunity submission', async () => {
  const eventsResponse = await fetch(`${baseUrl}/api/events`);
  const { events } = await eventsResponse.json();
  const workshop = events.find(item => item.title === 'Introduction to Python Workshop');
  assert.ok(workshop);

  const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Opportunity Author', college: 'Test College', email: 'author@example.test', password: 'test-password-123' })
  });
  assert.equal(signupResponse.status, 201);
  const cookie = signupResponse.headers.get('set-cookie').split(';', 1)[0];

  const expiredSubmission = await fetch(`${baseUrl}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      title: 'Expired Test Workshop',
      category: 'Coding',
      deadline: '2020-01-01',
      href: 'https://workshops.example.test/expired',
      desc: 'A test listing with a past deadline to verify expired application handling.'
    })
  });
  assert.equal(expiredSubmission.status, 201);
  const expiredFeed = await (await fetch(`${baseUrl}/api/events`, { headers: { Cookie: cookie } })).json();
  const pastEvent = expiredFeed.events.find(item => item.title === 'Expired Test Workshop');
  assert.ok(pastEvent?.expired);

  const applyResponse = await fetch(`${baseUrl}/api/events/${workshop.id}/apply`, {
    method: 'POST',
    headers: { Cookie: cookie }
  });
  assert.equal(applyResponse.status, 200);
  const appliedEvents = await (await fetch(`${baseUrl}/api/events`, { headers: { Cookie: cookie } })).json();
  assert.equal(appliedEvents.events.find(item => item.id === workshop.id).applied, true);

  const expiredApplyResponse = await fetch(`${baseUrl}/api/events/${pastEvent.id}/apply`, {
    method: 'POST',
    headers: { Cookie: cookie }
  });
  assert.equal(expiredApplyResponse.status, 410);

  const invalidSubmission = await fetch(`${baseUrl}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ title: 'Incomplete Workshop' })
  });
  assert.equal(invalidSubmission.status, 400);

  const submissionResponse = await fetch(`${baseUrl}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      title: 'Student JavaScript Workshop',
      category: 'Coding',
      deadline: '2027-01-15',
      href: 'https://workshops.example.test/javascript',
      desc: 'A student-submitted workshop for practicing JavaScript fundamentals.'
    })
  });
  assert.equal(submissionResponse.status, 201);
  const { event } = await submissionResponse.json();
  assert.equal(event.title, 'Student JavaScript Workshop');
  assert.equal(event.status, 'Pending');
  assert.equal(event.category, 'Coding');

  const feed = await (await fetch(`${baseUrl}/api/events`, { headers: { Cookie: cookie } })).json();
  assert.equal(feed.events.find(item => item.id === event.id).title, event.title);
});
