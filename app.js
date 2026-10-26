const seedEvents = [
  {id:1, title:'Global Game Jam 2026', category:'Hackathon', date:'Jan 30, 2026', mode:'Remote', status:'Verified', org:'Game Makers Guild', desc:'Build something playful with a global community in 48 hours.', votes:128, href:'https://globalgamejam.org/'},
  {id:2, title:'Women in Tech Fellowship', category:'Internship', date:'Feb 12, 2026', mode:'On-site', status:'Verified', org:'Northstar Labs', desc:'A paid, mentor-led product engineering fellowship for students.', votes:94, href:'https://www.linkedin.com/jobs/'},
  {id:3, title:'CodeSprint: FinTech Edition', category:'Coding', date:'Feb 21, 2026', mode:'Remote', status:'Pending', org:'Open Ledger', desc:'Solve real financial access problems and win a $5,000 prize.', votes:61, href:'https://devpost.com/'},
  {id:4, title:'National Design Challenge', category:'Competition', date:'Mar 04, 2026', mode:'On-site', status:'Verified', org:'Design Council', desc:'Shape the future of accessible public services with your team.', votes:77, href:'https://www.aiga.org/'},
  {id:5, title:'Campus Climate Summit', category:'Event', date:'Mar 18, 2026', mode:'On-site', status:'Verified', org:'Green Campus Network', desc:'Meet student leaders turning climate ideas into local action.', votes:46, href:'https://www.un.org/en/climatechange'},
  {id:6, title:'AI Research Assistantship', category:'Internship', date:'Apr 01, 2026', mode:'Remote', status:'Verified', org:'Arc Research', desc:'Work alongside researchers on responsible machine learning.', votes:112, href:'https://www.indeed.com/'},
  {id:7, title:'Google Solution Challenge', category:'Hackathon', date:'Oct 15, 2026', mode:'Remote', status:'Verified', org:'Google Developer Student Clubs', desc:'Build a solution using Google technologies to address one or more UN SDGs and showcase your impact.', votes:143, href:'https://developers.google.com/community/gdsc-solution-challenge'},
  {id:8, title:'AWS Cloud Skills Bootcamp', category:'Event', date:'Oct 28, 2026', mode:'Hybrid', status:'Verified', org:'Amazon Web Services', desc:'A hands-on cloud learning sprint covering serverless, AI, and practical deployment workshops.', votes:89, href:'https://aws.amazon.com/training/'},
  {id:9, title:'Campus Product Design Sprint', category:'Competition', date:'Nov 06, 2026', mode:'On-site', status:'Pending', org:'Design Collective', desc:'Turn a real campus pain point into a prototype and pitch a user-centered product solution.', votes:72, href:'https://designcollective.example'},
  {id:10, title:'Semiconductor Research Internship', category:'Internship', date:'Nov 18, 2026', mode:'On-site', status:'Verified', org:'CIRCUIT Labs', desc:'Explore chip design, system-level research, and next-gen hardware workflows with a research mentor.', votes:118, href:'https://www.linkedin.com/jobs/'},
  {id:11, title:'IndiaBios Innovation Summit', category:'Tech Summit', date:'Dec 03, 2026', mode:'On-site', status:'Verified', org:'BioTech Connect', desc:'Meet researchers, founders, and students driving biotech, AI, and health-tech innovation.', votes:96, href:'https://www.indiabiosummit.com/'},
  {id:12, title:'Startup Weekend Campus Edition', category:'Event', date:'Dec 12, 2026', mode:'Hybrid', status:'Verified', org:'Startup Weekend', desc:'Validate ideas quickly, build with a team, and pitch to mentors and local founders.', votes:84, href:'https://startupweekend.org/'},
  {id:13, title:'Open Source India Sprint', category:'Hackathon', date:'Jan 08, 2027', mode:'Remote', status:'Verified', org:'Open Source Community', desc:'Collaborate with peers on impactful open-source tools and build a project that solves a real campus challenge.', votes:104, href:'https://opensource.org/'},
  {id:14, title:'ClimateTech Fellowship', category:'Internship', date:'Jan 19, 2027', mode:'Hybrid', status:'Pending', org:'Emerald Labs', desc:'Support sustainable product experiments, climate policy prototypes, and partner research with field experts.', votes:68, href:'https://climatetech.example/'},
  {id:15, title:'Campus Creator Lab', category:'Event', date:'Feb 02, 2027', mode:'On-site', status:'Verified', org:'Creator Guild', desc:'Launch a content, design, or media story with peer feedback, mentorship, and live portfolio review.', votes:74, href:'https://creatorlab.example/'},
  {id:16, title:'Women in AI Residency', category:'Internship', date:'Feb 15, 2027', mode:'Remote', status:'Verified', org:'AI for Her', desc:'Work on applied AI projects, product experiments, and research sprints with mentorship from leading builders.', votes:128, href:'https://aiforher.example/'},
  {id:17, title:'AI Sprint for Campus Solutions', category:'Hackathon', date:'Oct 13, 2026', mode:'Remote', status:'Verified', org:'Innovation Hub', desc:'Build a useful AI product for campus life, get mentor feedback, and present to student founders.', votes:160, href:'https://innovationhub.example/'},
  {id:18, title:'Startup Fast Track', category:'Event', date:'Oct 16, 2026', mode:'Hybrid', status:'Verified', org:'Founders Circle', desc:'Meet startup builders, test your idea, and learn what investors actually care about in a pitch.', votes:142, href:'https://founderscircle.example/'},
  {id:19, title:'Design for Good Residency', category:'Internship', date:'Oct 18, 2026', mode:'On-site', status:'Verified', org:'Purpose Studio', desc:'Work on real-world product and service design challenges with quick mentorship and portfolio reviews.', votes:97, href:'https://purpose-studio.example/'},
  {id:20, title:'Campus Launch Lab', category:'Competition', date:'Oct 20, 2026', mode:'Remote', status:'Verified', org:'Launch Lab', desc:'Prototype a student-led idea, sharpen your pitch, and compete for early-stage founder feedback.', votes:121, href:'https://launchlab.example/'},
  {id:21, title:'Software Engineering Intern - Bengaluru', category:'Internship', date:'Check listing', mode:'On-site', status:'Pending', org:'Flipkart', desc:'Bengaluru-focused software engineering opportunity. Check Flipkart Careers for current openings, eligibility, location, and application dates.', votes:214, href:'https://www.flipkartcareers.com/'},
  {id:22, title:'AI and Data Science Intern - Bengaluru', category:'Internship', date:'Check listing', mode:'On-site', status:'Pending', org:'NVIDIA', desc:'Explore AI and data science internship openings based in Bengaluru. Confirm the active role and student eligibility on NVIDIA Careers.', votes:196, href:'https://www.nvidia.com/en-us/about-nvidia/careers/'},
  {id:23, title:'Product Analytics Intern - Bengaluru', category:'Internship', date:'Check listing', mode:'Hybrid', status:'Pending', org:'Meesho', desc:'Bengaluru-focused product analytics opportunity. Check Meesho Careers for current openings, work arrangement, and application requirements.', votes:188, href:'https://careers.meesho.com/'},
  {id:24, title:'Product Design Intern - Bengaluru', category:'Internship', date:'Check listing', mode:'On-site', status:'Pending', org:'Myntra', desc:'Explore product design internship openings in Bengaluru. Confirm the active role, portfolio expectations, and eligibility on the official careers page.', votes:201, href:'https://careers.myntra.com/'},
  {id:25, title:'Machine Learning Intern - Bengaluru', category:'Internship', date:'Check listing', mode:'On-site', status:'Pending', org:'Gojek', desc:'Bengaluru-focused machine learning opportunity. Check Gojek Careers for current openings, team location, and student eligibility.', votes:219, href:'https://www.gojek.io/careers'},
  {id:26, title:'Software Tech Lead - Bengaluru', category:'Job', date:'Check listing', mode:'On-site', status:'Pending', org:'ABB', desc:'ABB Software Tech Lead job opportunity in Bengaluru. Check the official listing for current requirements and application details.', votes:0, href:'https://abb.wd3.myworkdayjobs.com/en-US/External_Career_Page/job/Bangalore-Karnataka-India/Software-Tech-Lead_JR00050067-1?source=mygwork'},
  {id:27, title:'Project-Based Technology Internship', category:'Internship', date:'Check listing', mode:'Remote', status:'Pending', org:'MTK Secure Academy', desc:'Explore project-based technology internship programs. Check the official page for project tracks, eligibility, duration, and application details.', votes:0, href:'https://www.academy.mtksecure.in/programs/project-based'},
  {id:28, title:'Project-Based Internship Intake', category:'Internship', date:'Check listing', mode:'Remote', status:'Pending', org:'DevsIndia Campus', desc:'Explore the DevsIndia Campus project-based internship intake. Check the official page for available projects, eligibility, and program details.', votes:0, href:'https://campus.devsindia.in/'},
  {id:29, title:'Codgen Student Project Program', category:'Internship', date:'Check listing', mode:'Remote', status:'Pending', org:'Codgen', desc:'Codgen describes practical student tasks, project work, and certificates. Its page does not confirm a formal internship role; verify program terms and eligibility on the official site.', votes:0, href:'https://www.codgen.in/'},
  {id:30, title:'Introduction to Python Workshop', category:'Coding', date:'Nov 10, 2026', mode:'Remote', status:'Pending', org:'Harvard Chan Bioinformatics Core', desc:'Four live online sessions on Nov 10, 13, 17, and 20, 2026 (10 AM–12 PM ET). Hands-on Python and data analysis for life-science researchers; no prior coding experience is required. Harvard-affiliated researchers receive priority, and a registration fee may apply. Check eligibility and current registration details with the organizer.', votes:0, href:'https://hbctraining.github.io/main/registrations/AllFunders-Introduction-to-Python.html'},
  {id:36, title:'Python Camp Workshop', category:'Coding', date:'Dec 10, 2026', mode:'On-site', status:'Pending', org:'Python User Group - Peshawar', desc:'A Python community workshop in Peshawar, Pakistan, listed on Python.org for Dec 10, 2026. Open the official event page for venue details and the organizer RSVP link.', votes:0, href:'https://www.python.org/events/python-user-group/2248/'},
  {id:31, title:'Google Developer Workshops & Events', category:'Coding', date:'Check schedule', mode:'Remote', status:'Pending', org:'Google for Developers', desc:'Browse Google’s official developer event directory for upcoming learning sessions and workshops across Android, web, cloud, and AI. Check the event page for dates, format, eligibility, and registration.', votes:0, href:'https://developers.google.com/events/'},
  {id:32, title:'GitHub Developer Workshops & Webinars', category:'Coding', date:'Check schedule', mode:'Remote', status:'Pending', org:'GitHub', desc:'Explore official GitHub events and webinars for practical sessions on software development, collaboration, and open-source tools. Check the organizer page for upcoming dates and registration.', votes:0, href:'https://github.com/resources/events'},
  {id:33, title:'AWS Developer Workshops & Events', category:'Coding', date:'Check schedule', mode:'Remote', status:'Pending', org:'Amazon Web Services', desc:'Find AWS-led learning events with practical sessions on building and deploying applications. Check the official events page for workshop topics, dates, format, and registration.', votes:0, href:'https://aws.amazon.com/events/'},
  {id:34, title:'Python Community Workshops & Events', category:'Coding', date:'Check schedule', mode:'Hybrid', status:'Pending', org:'Python Software Foundation', desc:'Browse the Python community events calendar for upcoming Python meetups, conferences, and workshops. Confirm the event format, schedule, and registration with its organizer.', votes:0, href:'https://www.python.org/events/'},
  {id:35, title:'NVIDIA Deep Learning Institute Workshops', category:'Coding', date:'Check schedule', mode:'Hybrid', status:'Pending', org:'NVIDIA', desc:'Explore NVIDIA Deep Learning Institute training and workshops covering accelerated computing, AI, and data science. Check the official training page for instructor-led dates, format, and any fees.', votes:0, href:'https://www.nvidia.com/en-us/training/'},
].filter(event => !event.href.includes('.example'));
function loadAssistantHistory(){
  try {
    const history = JSON.parse(localStorage.assistantHistory || '[]');
    return Array.isArray(history) ? history
      .filter(message => message && ['user', 'model'].includes(message.role) && typeof message.content === 'string')
      .slice(-20)
      .map(message => ({
        role: message.role,
        content: message.content.slice(0, 3000),
        followUps: Array.isArray(message.followUps) ? message.followUps.filter(item => typeof item === 'string').slice(0, 3) : []
      })) : [];
  } catch {
    return [];
  }
}
let state = { view:'landing', theme:localStorage.theme||'light', user:JSON.parse(localStorage.user||'null'), saved:JSON.parse(localStorage.saved||'[]'), savedFolders:JSON.parse(localStorage.savedFolders||'{}'), folders:['General','Apply soon','Research'], applied:JSON.parse(localStorage.applied||'[]'), tracker:JSON.parse(localStorage.tracker||'{"Interested":[],"Applied":[],"Shortlisted":[],"Completed":[]}'), hidden:[], events:seedEvents.filter(event => !isEventExpired(event)).map(event => ({...event, status:event.status === 'Verified' ? 'Pending' : event.status, votes:0})), filter:'All', mode:'All modes', search:'', deadlineFilter:'Any deadline', savedOnly:false, dashTab:'saved', sortBy:'popular', quickFilter:'All', assistantEvents:[], assistantHistory:loadAssistantHistory(), assistantRequestId:0, discussionPosts: JSON.parse(localStorage.discussionPosts||'[]'), adminOverview:{totalEvents:0,pendingEvents:0,verifiedEvents:0,totalUsers:0,reportsCount:0}, adminEvents:[], adminReports:[] };
const app = document.querySelector('#app');
const esc = s => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function eventDate(value){
  if(typeof value !== 'string' || !value.trim()) return null;
  const isoDate = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = isoDate ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3])) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function isEventExpired(event, now = new Date()){
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return [event.deadline, event.date].some(value => {
    const date = eventDate(value);
    return date && date.getTime() < today;
  });
}
function downloadSavedShortlist(){
  const savedEvents = state.saved.map(id=>state.events.find(event=>event.id===id)).filter(Boolean);
  if(!savedEvents.length){toast('Save an opportunity before exporting your shortlist.');return;}
  const columns = ['Title','Organization','Category','Opportunity date','Application deadline','Review status','Official listing'];
  const quote = value => {
    let text = String(value ?? '');
    if(/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g,'""')}"`;
  };
  const rows = [columns,...savedEvents.map(event=>[
    event.title,event.org,event.category,event.date,event.deadline || '',event.status,event.href
  ])].map(row=>row.map(quote).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${rows}\r\n`],{type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `campus-arena-shortlist-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Your saved shortlist was exported.');
}
function persist(){localStorage.theme=state.theme; localStorage.saved=JSON.stringify(state.saved); localStorage.savedFolders=JSON.stringify(state.savedFolders); localStorage.applied=JSON.stringify(state.applied); localStorage.tracker=JSON.stringify(state.tracker); localStorage.discussionPosts=JSON.stringify(state.discussionPosts); if(state.user)localStorage.user=JSON.stringify(state.user);}
function nav(){ const auth = state.user; return `<header class="nav"><button class="brand" data-view="landing"><span class="brand-mark">CA</span> CAMPUS ARENA </button><nav class="nav-links"><button data-view="events">Discover</button><button data-view="support">Support</button>${auth && auth.role==='admin' ? '<button data-action="admin-portal">Admin Portal</button>' : ''}</nav><div class="nav-actions"><button class="secondary assistant-trigger" data-action="assistant">Student Assistant</button>${auth?`<button class="secondary" data-view="events">Upcoming Events</button><div class="profile-menu"><button class="avatar" data-action="profile">${esc(auth.name[0])}</button></div>`:`<button class="ghost" data-action="login">Login</button><button class="primary" data-action="signup">Join Us</button>`}<button class="icon-btn" title="Toggle theme" data-action="theme">${state.theme==='light'?'☾':'☀'}</button></div></header>`; }
function featuredOpportunities(){
  return state.events.filter(event => event.status === 'Verified' && !isEventExpired(event))
    .sort((a,b)=> (b.votes||0) - (a.votes||0)).slice(0,4);
}
const alumniJourneys = [
  {name:'Maya R.',role:'Software Engineer · Bengaluru',story:'“I saved a weekend coding challenge, teamed up with two classmates, and turned our project into a portfolio piece. That gave me something concrete to discuss in interviews.”',path:'Saved a listing → built a project → prepared for interviews'},
  {name:'Arjun K.',role:'Product Design Associate · Pune',story:'“A design sprint helped me work through a real brief from start to finish. I added the prototype and user research to my portfolio before applying for design roles.”',path:'Found a design sprint → built a case study → updated portfolio'},
  {name:'Leah T.',role:'Data Analyst · Hyderabad',story:'“I used the opportunity tracker to keep my applications organized. While waiting to hear back, I kept practicing SQL and documenting a small analytics project.”',path:'Tracked applications → practiced skills → prepared examples'}
];
function alumniCards(){
  return alumniJourneys.map(alum=>`<article class="featured-card alumni-demo"><span class="feature-index">FICTIONAL DEMO PROFILE</span><h3>${esc(alum.name)}</h3><p class="alumni-demo-role">${esc(alum.role)}</p><p>${esc(alum.story)}</p><small class="alumni-demo-path">${esc(alum.path)}</small><small class="alumni-demo-note">Fictional example—not a real alumni testimonial or verified job outcome.</small></article>`).join('');
}
function alumni(){
  return `<main class="page"><div class="page-top"><div><span class="eyebrow">Alumni journeys</span><h2>Small steps, real skills.</h2><p>Fictional examples of how students can turn opportunities into experience.</p></div><button class="ghost" data-view="events">Browse opportunities</button></div><div class="alumni-strip"><div class="featured-grid">${alumniCards()}</div></div></main>`;
}
function featuredHighlights(){
  const featured = featuredOpportunities();
  if(!featured.length) return [
    ...alumniJourneys
  ].map(alum=>`<article class="featured-card alumni-demo"><span class="feature-index">FICTIONAL DEMO PROFILE</span><h3>${esc(alum.name)}</h3><p class="alumni-demo-role">${esc(alum.role)}</p><p>${esc(alum.story)}</p><small class="alumni-demo-path">${esc(alum.path)}</small>`+
    `<small class="alumni-demo-note">Fictional example for layout demonstration—not a real user or verified job outcome.</small></article>`).join('');
  return featured.map(event => `<article class="featured-card"><span class="feature-index">${esc(event.category)}</span><h3>${esc(event.title)}</h3><p>${esc(event.org)}</p><div class="mini-meta"><span>${esc(event.mode)}</span><span>${(event.votes || 0)} student votes</span></div></article>`).join('');
}
function categorySpotlight(category, label = category){
  const upcoming = state.events
    .filter(event => event.category === category && event.status !== 'Rejected' && !isEventExpired(event))
    .sort((a,b) => (eventDate(a.date)?.getTime() ?? Infinity) - (eventDate(b.date)?.getTime() ?? Infinity));
  const next = upcoming[0];
  const datedCount = upcoming.filter(event => eventDate(event.date)).length;
  const calendarCount = upcoming.length - datedCount;
  const listingSummary = `${datedCount} DATED · ${calendarCount} CALENDAR${calendarCount === 1 ? '' : 'S'}`;
  return `<article class="feature"><span class="feature-index">${upcoming.length} LISTING${upcoming.length === 1 ? '' : 'S'} · ${listingSummary}</span><h3>${esc(label)}</h3>${next
    ? `<p><strong>${esc(next.title)}</strong><br>${esc(next.org)} · ${esc(next.date)} · ${esc(next.mode)}</p><small>${esc(next.status === 'Verified' ? 'Moderator-verified' : 'Pending review')}</small>`
    : '<p>No upcoming listings right now. Check back soon.</p>'}<button class="text-btn" data-action="browse-category" data-category="${esc(category)}">Explore ${esc(label.toLowerCase())} →</button></article>`;
}
function landing(){
  const highlighted = state.events.find(event => event.status === 'Verified' && !isEventExpired(event));
  const featuredAvailable = featuredOpportunities().length > 0;
  return `<main>
    <section class="hero">
      <div class="hero-copy"><span class="eyebrow">The student opportunity network</span><h1>Make your next move count.</h1><p>Campus Arena brings student opportunities together with clear review status, so you can check details before applying.</p><div class="hero-actions"><button class="primary" data-action="signup">Join the arena <span>→</span></button><button class="ghost" data-view="events">Browse opportunities</button><button class="secondary assistant-trigger" data-action="assistant">Ask student assistant</button></div></div>
      <div class="hero-art"><div class="art-ring"></div><div class="art-card one"><small>${highlighted ? 'MODERATOR-VERIFIED' : 'REVIEW STATUS'}</small><strong>${esc(highlighted?.title || 'Trusted by 170+ Learners')}</strong><span class="tag">${esc(highlighted?.category || 'Campus Arena')}</span></div><div class="art-card two"><small>COMMUNITY ACTION</small><strong>Share opportunities. Help your campus grow.</strong></div></div>
    </section>
    <div class="band"><div class="ticker"><span>Curated by students</span><span>01 / Find your signal</span><span>02 / Make your move</span><span>03 / Shape the community</span></div></div>
    <section class="section"><div class="section-head"><div><span class="eyebrow">Alumni journeys</span><h2>Find your next opportunity.</h2></div><p>See how students can turn opportunities into skills and experience. These are fictional demo profiles, not real testimonials.</p></div><div class="alumni-strip"><div class="featured-grid">${alumniCards()}</div></div></section>
    <section class="featured-strip ${featuredAvailable ? '' : 'alumni-strip'}"><div class="section-head"><div><span class="eyebrow">${featuredAvailable ? 'Featured today' : 'Illustrative demo stories'}</span><h2>${featuredAvailable ? 'Verified opportunities' : 'Alumni journeys'}</h2></div>${featuredAvailable ? '<button class="ghost" data-view="events">See all</button>' : '<p>Small steps, real skills, and a little persistence can open new doors.</p>'}</div><div class="featured-grid">${featuredHighlights()}</div></section>
    <section class="section"><div class="section-head"><div><span class="eyebrow">Why Campus Arena</span><h2>A better way in.</h2></div><p>Check review status and listing details before you apply. Report anything that looks incomplete or outdated.</p></div><div class="feature-grid"><article class="feature"><span class="feature-index">01</span><h3>Review status</h3><p>See whether an opportunity is pending review or moderator-verified.</p></article><article class="feature"><span class="feature-index">02</span><h3>Keep your shortlist</h3><p>Save opportunities you want to revisit and organize your next steps.</p></article><article class="feature"><span class="feature-index">03</span><h3>Apply with intention</h3><p>Review the original organization listing for requirements and current availability.</p></article></div></section>
    <section class="section"><div class="section-head"><div><span class="eyebrow">Student momentum</span><h2>Built for action.</h2></div><p>Use the tools to track opportunities and help keep the feed useful.</p></div><div class="feature-grid"><article class="feature"><span class="feature-index">DISCOVER</span><h3>Opportunity feed</h3><p>Browse by category, mode, or deadline. Listings with known past dates are removed from the public feed.</p></article><article class="feature"><span class="feature-index">PLAN</span><h3>Career roadmap</h3><p>Update your profile, shortlist opportunities, apply, and reflect on outcomes.</p><ul class="mini-list"><li>Update profile</li><li>Shortlist opportunities</li><li>Check application dates</li></ul></article><article class="feature"><span class="feature-index">CONTRIBUTE</span><h3>Help keep listings accurate</h3><p>Post opportunities, report expired links, and check original sources for current requirements.</p></article></div></section>
    <section class="section" id="faq"><div class="section-head"><div><span class="eyebrow">Questions, answered</span><h2>Start curious.</h2></div></div><div class="faq-list"><details><summary>Who can submit an opportunity?</summary><p>Any authenticated student can post an event, internship, or competition. Submissions remain pending until a moderator reviews them.</p></details><details><summary>Is Campus Arena free?</summary><p>Yes. Discovery, saving, community validation, and applying are free for students.</p></details><details><summary>How do you verify listings?</summary><p>A listing is moderator-verified only after review. Check its original source and report details that look incomplete or misleading.</p></details></div></section>
  </main>`;
}
function deadlineFor(event){
  if(event.deadline) return event.deadline;
  const date = new Date(event.date);
  if(Number.isNaN(date.getTime())) return 'Check listing';
  date.setDate(date.getDate()-7);
  return date.toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'});
}
function deadlineCountdown(event){
  const deadline = event.deadline ? new Date(event.deadline) : new Date(event.date);
  if(Number.isNaN(deadline.getTime())) return 'Deadline: Check listing';
  const diff = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if(diff <= 0) return 'Deadline today';
  if(diff === 1) return 'Deadline tomorrow';
  if(diff <= 7) return `${diff} days left`;
  return `Apply before ${deadline.toLocaleDateString('en-US',{month:'short',day:'numeric'})}`;
}
function eventImage(event){
  const images = {
    Hackathon: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    Internship: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80',
    Coding: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80',
    Competition: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80',
    Event: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
    'Tech Summit': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80'
  };
  return images[event.category] || images.Event;
}
function assistantEvent(event){
  return `<article class="assistant-result"><div><span class="tag">${esc(event.category)}</span><h4>${esc(event.title)}</h4><p>${esc(event.date)} · ${esc(event.mode)} · ${esc(event.org)}</p></div><div class="assistant-result-actions"><button data-action="assistant-view" data-id="${event.id}">View</button><button data-action="apply" data-id="${event.id}">Apply</button><button data-action="save" data-id="${event.id}">${state.saved.includes(event.id) ? 'Saved' : 'Save'}</button></div></article>`;
}
function assistantTranscript(){
  if (!state.assistantHistory.length) return '<div class="assistant-message assistant-message-bot">I can help with Campus Arena listings, applications, resumes, interviews, study plans, and student projects. I do not have live web access.</div>';
  return state.assistantHistory.map(message => {
    const isAssistant = message.role === 'model';
    const followUps = isAssistant && Array.isArray(message.followUps) && message.followUps.length
      ? `<div class="assistant-followups"><span class="feature-index">YOU COULD ASK</span>${message.followUps.map(question => `<button type="button" data-action="assistant-prompt" data-prompt="${esc(question)}">${esc(question)}</button>`).join('')}</div>`
      : '';
    return `<div class="assistant-message ${isAssistant ? 'assistant-message-bot' : 'assistant-message-user'}">${esc(message.content)}</div>${followUps}`;
  }).join('');
}
function assistantWidget(){
  const starters = ['Find internships in Bangalore', 'How do I apply for these?', 'Help me improve my resume'];
  return `<section class="assistant-widget"><div class="assistant-widget-header"><div><span class="eyebrow">Campus Arena assistant</span><h3>Need a quick nudge?</h3></div><button class="ghost assistant-clear" type="button" data-action="assistant-clear">New chat</button></div><div class="assistant-starters">${starters.map(prompt => `<button type="button" data-action="assistant-prompt" data-prompt="${prompt}">${prompt}</button>`).join('')}</div><div class="assistant-messages assistant-widget-messages">${assistantTranscript()}</div><form class="assistant-form assistant-widget-form" id="dashboard-assistant-form"><input name="question" autocomplete="off" placeholder="Ask about listings, resumes, or study..." aria-label="Ask the Campus Arena assistant"><button class="primary" type="submit">Ask</button></form></section>`;
}
function notificationPanel(){
  const savedEvents = state.saved.map(id => state.events.find(event => event.id === id)).filter(Boolean);
  const appliedCount = state.applied.length;
  const upcoming = savedEvents.filter(event => eventPriority(event) > 0 && eventPriority(event) <= 14).slice(0, 2);
  const items = upcoming.map(event => `<div class="notification-item"><span class="feature-index">DEADLINE SOON</span><p>${esc(event.title)} closes ${esc(deadlineFor(event))}.</p></div>`);
  if (appliedCount) items.push(`<div class="notification-item"><span class="feature-index">FOLLOW UP</span><p>${appliedCount} application${appliedCount === 1 ? '' : 's'} waiting for follow-up.</p></div>`);
  if (!items.length) items.push('<div class="notification-item"><span class="feature-index">START HERE</span><p>Save an opportunity to receive deadline reminders and follow-up prompts.</p></div>');
  return `<section class="notification-panel"><div><span class="eyebrow">Your notifications</span><h3>Keep momentum visible.</h3></div><div class="notification-list">${items.slice(0, 3).join('')}</div></section>`;
}
function mountAssistantWidget(){
  if (!state.user || state.view !== 'dashboard' || document.querySelector('.assistant-widget')) return;
  const tabs = document.querySelector('.dashboard-tabs');
  if (tabs) tabs.insertAdjacentHTML('beforebegin', `${notificationPanel()}${assistantWidget()}`);
}
function mountAdminAnalytics(){
  if (!state.user || state.user.role !== 'admin' || state.view !== 'admin' || document.querySelector('.admin-analytics')) return;
  const panel = document.querySelector('.admin-panel');
  if (!panel) return;
  const categories = (state.adminOverview.categoryCounts || []).map(item => `<span>${esc(item.category)} <strong>${item.count}</strong></span>`).join('');
  const modes = (state.adminOverview.modeCounts || []).map(item => `<span>${esc(item.mode)} <strong>${item.count}</strong></span>`).join('');
  panel.insertAdjacentHTML('beforebegin', `<section class="admin-analytics"><div><span class="eyebrow">Platform analytics</span><h3>What the community is exploring</h3></div><div class="analytics-list"><div><span class="feature-index">BY CATEGORY</span>${categories || '<p>No category data yet.</p>'}</div><div><span class="feature-index">BY FORMAT</span>${modes || '<p>No format data yet.</p>'}</div></div></section>`);
}
function assistant(){
  const starters = ['Find internships in Bangalore', 'How do I apply for these?', 'Help me improve my resume'];
  state.assistantEvents = [];
  modal(`<div class="assistant-modal"><div class="modal-head"><div><span class="eyebrow">Campus Arena assistant</span><h2>Ask the arena.</h2><p class="assistant-intro">Get help with listings, applications, resumes, interviews, study plans, and student projects. It does not have live web access.</p></div><button class="ghost assistant-clear" type="button" data-action="assistant-clear">New chat</button><button class="close" data-action="close">×</button></div><div class="assistant-starters">${starters.map(prompt => `<button data-action="assistant-prompt" data-prompt="${prompt}">${prompt}</button>`).join('')}</div><div class="assistant-messages">${assistantTranscript()}</div><form class="assistant-form" id="assistant-form"><input name="question" required autocomplete="off" placeholder="Ask about listings or student guidance..." aria-label="Ask the Campus Arena assistant"><button class="primary">Ask</button></form></div>`);
}
async function askAssistant(question, source){
  const cleanQuestion = String(question).trim();
  if (!cleanQuestion) return;
  const requestId = ++state.assistantRequestId;
  const container = source?.querySelector('.assistant-messages') || document.querySelector('.assistant-messages, .assistant-widget-messages');
  if (!container) return;
  const form = source?.querySelector('.assistant-form') || document.querySelector('#assistant-form, #dashboard-assistant-form');
  const submit = form?.querySelector('[type="submit"], button:not([type])');
  const promptButtons = [...(source?.querySelectorAll('[data-action="assistant-prompt"]') || [])];
  if (submit) { submit.disabled = true; submit.textContent = 'Thinking...'; }
  promptButtons.forEach(button => { button.disabled = true; });
  const userMessage = document.createElement('div');
  userMessage.className = 'assistant-message assistant-message-user';
  userMessage.textContent = cleanQuestion;
  const replyMessage = document.createElement('div');
  replyMessage.className = 'assistant-message assistant-message-bot';
  replyMessage.textContent = 'Thinking...';
  container.append(userMessage, replyMessage);
  container.scrollTop = container.scrollHeight;
  if (form) form.querySelector('input[name="question"]').value = '';
  try {
    const result = await apiRequest('/api/assistant', {
      method: 'POST',
      body: JSON.stringify({ question: cleanQuestion, history: state.assistantHistory.slice(-16).map(({ role, content }) => ({ role, content })) })
    });
    if (requestId !== state.assistantRequestId) return;
    state.assistantHistory.push(
      { role: 'user', content: cleanQuestion },
      { role: 'model', content: result.text, followUps: result.followUps }
    );
    state.assistantHistory = state.assistantHistory.slice(-20);
    localStorage.assistantHistory = JSON.stringify(state.assistantHistory);
    container.innerHTML = assistantTranscript();
    const listedTitles = [...result.text.matchAll(/• ([^\n]+?) —/g)].map(match => match[1]);
    const events = listedTitles.map(title => state.events.find(event => event.title === title)).filter(Boolean);
    state.assistantEvents = events;
    if (events.length) container.insertAdjacentHTML('beforeend', `<div class="assistant-results">${events.map(assistantEvent).join('')}</div>`);
  } catch (error) {
    if (requestId !== state.assistantRequestId) return;
    replyMessage.textContent = error.message;
  } finally {
    if (submit) { submit.disabled = false; submit.textContent = 'Ask'; }
    promptButtons.forEach(button => { button.disabled = false; });
    const input = form?.querySelector('input[name="question"]');
    if (input) input.focus();
    container.scrollTop = container.scrollHeight;
  }
}
function badgeSummary(user){
  const points = Number(user?.points || 0);
  const badges = [];
  if(points >= 30) badges.push('Helpful Contributor');
  if(points >= 80) badges.push('Opportunity Explorer');
  if(points >= 150) badges.push('Campus Mentor');
  return badges.length ? badges.join(' • ') : 'New member';
}
function getProfileText(user){
  const parts = [user?.interests || '', user?.skills || '', user?.course || '', user?.eligibility || ''];
  return parts.join(' ').toLowerCase();
}
function recommendationFeed(){
  if (!state.user) return [];
  const query = getProfileText(state.user);
  return state.events
    .filter(event => event.status !== 'Rejected')
    .map(event => {
      const haystack = `${event.title} ${event.category} ${event.org} ${event.desc} ${event.mode}`.toLowerCase();
      let score = 0;
      if (query && haystack.includes(query)) score += 8;
      const interestTerms = (state.user.interests || '').toLowerCase().split(/[,\s]+/).filter(Boolean);
      const skillTerms = (state.user.skills || '').toLowerCase().split(/[,\s]+/).filter(Boolean);
      const courseTerms = (state.user.course || '').toLowerCase().split(/[,\s]+/).filter(Boolean);
      const eligibilityTerms = (state.user.eligibility || '').toLowerCase().split(/[,\s]+/).filter(Boolean);
      [ ...interestTerms, ...skillTerms, ...courseTerms, ...eligibilityTerms ].forEach(term => {
        if (term && haystack.includes(term)) score += 4;
      });
      if (event.category && (state.user.interests || '').toLowerCase().includes(event.category.toLowerCase())) score += 2;
      if (event.mode === 'Remote' && /remote|online|hybrid/i.test((state.user.eligibility || '').toLowerCase())) score += 1;
      return { event, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.event);
}
function eventEligibility(event){
  if (event.eligibility) return event.eligibility;
  if (event.category === 'Internship') return 'Students and early-career applicants interested in this role. Check the original listing for degree, graduation year, location, and experience requirements.';
  if (event.category === 'Job') return 'Check the official employer listing for experience, qualifications, location, and application requirements.';
  if (event.category === 'Hackathon' || event.category === 'Coding') return 'Students, developers, designers, and builders. Confirm team-size, technology, and age or enrollment rules on the original listing.';
  if (event.category === 'Competition') return 'Students interested in the challenge topic. Review the organizer\'s rules, team requirements, and submission criteria before entering.';
  return 'Students and community members interested in this opportunity. Check the original listing for attendance, registration, and eligibility requirements.';
}
function eventDetails(event){
  if (!event) return;
  const expired = isEventExpired(event);
  const tags = [event.category, event.mode, expired ? 'Expired' : event.status, event.org].filter(Boolean);
  modal(`<div class="event-details" style="--event-image: url('${eventImage(event)}')"><div class="event-details-hero"><div class="event-details-overlay"><div class="modal-head"><div><span class="eyebrow">${esc(event.org)}</span><h2>${esc(event.title)}</h2></div><button class="close" data-action="close">×</button></div><div class="event-tags">${tags.map(tag => `<span class="tag">${esc(tag)}</span>`).join('')}</div></div></div><div class="event-details-body"><p class="event-details-description">${esc(event.desc)}</p><div class="event-info-grid"><div><span class="eyebrow">Deadline</span><strong>${esc(deadlineFor(event))}</strong><small>${expired ? 'This opportunity date has passed.' : esc(deadlineCountdown(event))}</small></div><div><span class="eyebrow">Format</span><strong>${esc(event.mode)}</strong><small>${esc(event.date)}</small></div><div><span class="eyebrow">Eligibility</span><p>${esc(eventEligibility(event))}</p></div></div><div class="event-details-actions"><a class="primary" href="${esc(event.href)}" target="_blank" rel="noopener">${expired ? 'Check original listing ↗' : 'Open application link ↗'}</a><button class="secondary" data-action="save" data-id="${event.id}">${state.saved.includes(event.id) ? 'Saved to list' : 'Save opportunity'}</button><button class="secondary" data-action="follow-org" data-org="${esc(event.org)}">${event.followed ? 'Following organization' : 'Follow organization'}</button><button class="ghost" data-action="share" data-id="${event.id}">Share opportunity</button></div><section class="review-box"><div><span class="eyebrow">Community reviews</span><h3>${event.averageRating ? `${event.averageRating.toFixed(1)} / 5` : 'No ratings yet'}</h3><p>${event.reviewCount || 0} student review${event.reviewCount === 1 ? '' : 's'}</p></div><form class="review-form" data-event-id="${event.id}"><select name="rating" aria-label="Rating"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><input name="comment" required placeholder="Share a useful experience"><button class="primary">Post review</button></form></section></div></div>`);
}
async function shareEvent(event){
  const shareData = { title: event.title, text: `${event.title} - ${event.desc}`, url: event.href };
  try {
    if (navigator.share) await navigator.share(shareData);
    else { await navigator.clipboard.writeText(`${event.title}: ${event.href}`); toast('Opportunity link copied.'); }
  } catch (error) {
    if (error.name !== 'AbortError') toast('Could not share this opportunity.');
  }
}
function eventCard(e){
  const expired = isEventExpired(e);
  const scheduleOnly = e.date === 'Check schedule';
  const dateLabel = scheduleOnly ? 'Organizer calendar · check dates' : e.date;
  return `<article class="event-card" data-action="details" data-id="${e.id}" style="--event-image: url('${eventImage(e)}')"><div class="card-top"><span class="tag">${esc(e.category)}</span><span class="status">● ${expired ? 'Expired' : esc(e.status)}</span></div><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p><div class="card-meta"><span>${esc(dateLabel)}</span><span>${esc(e.mode)}</span><span>${esc(deadlineCountdown(e))}</span></div><div class="card-actions"><button data-action="save" data-id="${e.id}">${state.saved.includes(e.id)?'Saved':'Add to List'}</button>${expired ? '<span class="status">Applications closed</span>' : `<button class="apply" data-action="apply" data-id="${e.id}">Apply Now</button>`}<button class="hide" data-action="hide" data-id="${e.id}">Hide from Me</button></div><div class="trust"><span>Community signal</span><button data-action="upvote" data-id="${e.id}">▲ ${e.votes} trust</button><button data-action="report" data-id="${e.id}">Report</button></div><label class="tracker-select"><span>Track status</span><select data-action="update-tracker" data-id="${e.id}"><option value="">Choose...</option>${['Interested','Applied','Shortlisted','Completed'].map(bucket => `<option value="${bucket}" ${state.tracker?.[bucket]?.includes(e.id)?'selected':''}>${bucket}</option>`).join('')}</select></label></article>`;
}
function eventPriority(event){
  const deadline = event.deadline ? new Date(event.deadline) : new Date(event.date);
  if(Number.isNaN(deadline.getTime())) return 0;
  const diff = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}
function matchesDeadline(event){
  if(state.deadlineFilter === 'Any deadline') return true;
  const days = eventPriority(event);
  if(state.deadlineFilter === 'Next 7 days') return days > 0 && days <= 7;
  if(state.deadlineFilter === 'Next 30 days') return days > 0 && days <= 30;
  return true;
}
function getSortedEvents(list){
  const events = [...list];
  if(state.sortBy==='deadline'){ return events.sort((a,b)=> eventPriority(a)-eventPriority(b)); }
  if(state.sortBy==='newest'){ return events.sort((a,b)=> Number(new Date(b.date)) - Number(new Date(a.date))); }
  return events.sort((a,b)=> (b.votes||0) - (a.votes||0));
}
function savedList(){
  const savedEvents = state.saved.map(id => state.events.find(event => event.id === id)).filter(Boolean);
  const items = savedEvents.map(event => `<article class="saved-item"><div><span class="tag">${esc(event.category)}</span><h4>${esc(event.title)}</h4><p>${esc(event.date)} · ${esc(event.mode)}</p><select class="saved-folder" data-action="saved-folder" data-id="${event.id}" aria-label="Folder for ${esc(event.title)}">${state.folders.map(folder => `<option ${state.savedFolders[event.id]===folder?'selected':''}>${folder}</option>`).join('')}</select></div><button class="saved-remove" title="Remove from saved list" aria-label="Remove ${esc(event.title)} from saved list" data-action="save" data-id="${event.id}">×</button></article>`).join('');
  return `<aside class="saved-column"><div class="saved-column-head"><div><span class="eyebrow">Your shortlist</span><h3>Saved list</h3></div><span class="saved-count">${savedEvents.length}</span></div>${items || '<div class="saved-empty">Your saved opportunities will appear here.</div>'}<button class="saved-link" data-action="saved">Open full saved list →</button></aside>`;
}
function events(){const categories=[...new Set(state.events.filter(event=>!isEventExpired(event)).map(event=>event.category))];
  let shown=state.events.filter(e=>!isEventExpired(e)&&!state.hidden.includes(e.id)&& (state.filter==='All'||e.category===state.filter) && (state.mode==='All modes'||e.mode===state.mode) && matchesDeadline(e) && (!state.savedOnly||state.saved.includes(e.id)) && (!state.search||`${e.title} ${e.org}`.toLowerCase().includes(state.search.toLowerCase())));
  if(state.quickFilter==='Remote') shown = shown.filter(e => e.mode === 'Remote');
  if(state.quickFilter==='Urgent') shown = shown.filter(e => eventPriority(e) <= 7 && eventPriority(e) > 0);
  if(['Internship','Hackathon','Tech Summit','Coding'].includes(state.quickFilter)) shown = shown.filter(e => e.category === state.quickFilter);
  if(state.quickFilter==='Trending') shown = shown.filter(e => (e.votes || 0) >= 80);
  shown = getSortedEvents(shown);
  return `<main class="page"><div class="page-top"><div><span class="eyebrow">Your opportunity radar</span><h2>Upcoming events</h2><p>Find your next room to grow, build, and be seen.</p></div>${state.user?'<button class="secondary" data-action="post">+ Post an opportunity</button>':''}</div><div class="filters"><label class="search"><input data-filter="search" value="${esc(state.search)}" placeholder="Search opportunities or organizations" /></label><select data-filter="category"><option value="All" ${state.filter==='All'?'selected':''}>All</option>${categories.map(category=>`<option value="${esc(category)}" ${state.filter===category?'selected':''}>${category}</option>`).join('')}</select><select data-filter="mode"><option value="All modes" ${state.mode==='All modes'?'selected':''}>All modes</option><option value="Remote" ${state.mode==='Remote'?'selected':''}>Remote</option><option value="On-site" ${state.mode==='On-site'?'selected':''}>On-site</option></select><select data-filter="deadline"><option ${state.deadlineFilter==='Any deadline'?'selected':''}>Any deadline</option><option ${state.deadlineFilter==='Next 7 days'?'selected':''}>Next 7 days</option><option ${state.deadlineFilter==='Next 30 days'?'selected':''}>Next 30 days</option></select><select data-filter="sort"><option value="popular" ${state.sortBy==='popular'?'selected':''}>Sort: Popular</option><option value="deadline" ${state.sortBy==='deadline'?'selected':''}>Sort: Deadline</option><option value="newest" ${state.sortBy==='newest'?'selected':''}>Sort: Newest</option></select><label class="filter-toggle"><input type="checkbox" data-filter="saved-only" ${state.savedOnly?'checked':''}> Saved only</label></div><div class="quick-filters">${['All','Trending','Urgent','Remote','Internship','Hackathon','Tech Summit','Coding'].map(filter => `<button class="filter-chip ${state.quickFilter===filter?'active':''}" data-action="quick-filter" data-filter="${filter}">${filter}</button>`).join('')}</div><div class="events-layout"><div class="event-grid">${shown.length?shown.map(eventCard).join(''):'<div class="empty">No opportunities match that signal yet.</div>'}</div>${savedList()}</div></main>`}
function dashboard(){
  let list=state.dashTab==='saved'?state.saved:state.applied;
  const savedEvents=state.saved.map(id=>state.events.find(event=>event.id===id)).filter(Boolean);
  const recommendations = recommendationFeed();
  const trackerKeys = ['Interested','Applied','Shortlisted','Completed'];
  const nextGoal = state.saved.length >= 3 ? 'You are building a strong shortlist.' : 'Save 3 opportunities to build momentum.';
  const activeTracker = trackerKeys.reduce((total, key) => total + (state.tracker?.[key]?.length || 0), 0);
  return `<main class="page"><div class="page-top"><div><span class="eyebrow">Welcome back, ${esc(state.user?.name||'explorer')}</span><h2>Your arena</h2><p>A clear view of what you are tracking and where you are going next.</p></div><div class="page-top-actions">${state.dashTab==='saved'&&savedEvents.length?'<button class="secondary" data-action="export-saved">Export shortlist</button>':''}<button class="primary" data-view="events">Find opportunities →</button></div></div><div class="dashboard-grid"><div class="metric"><span class="eyebrow">Events saved</span><span class="number">${state.saved.length}</span><small>Your shortlist, all in one place</small></div><div class="metric"><span class="eyebrow">Applications clicked</span><span class="number">${state.applied.length}</span><small>Intentional steps forward</small></div><div class="metric"><span class="eyebrow">Contribution points</span><span class="number">${Number(state.user?.points||0)}</span><small>${badgeSummary(state.user)}</small></div></div><div class="pulse-card"><div><span class="eyebrow">Smart momentum</span><h3>${nextGoal}</h3></div><div class="pulse-metrics"><span>${activeTracker} tracked</span><span>${recommendations.length} matches</span></div></div><div class="dashboard-tabs"><button class="tab ${state.dashTab==='saved'?'active':''}" data-action="dash-tab" data-tab="saved">Saved events</button><button class="tab ${state.dashTab==='applied'?'active':''}" data-action="dash-tab" data-tab="applied">Applied history</button><button class="tab ${state.dashTab==='submitted'?'active':''}" data-action="dash-tab" data-tab="submitted">My submissions</button></div><div class="feature-grid"><div class="feature"><span class="feature-index">FOR YOU</span><h3>Recommended for you</h3>${recommendations.length ? recommendations.map(event => `<p>• ${esc(event.title)} · ${esc(event.category)}</p>`).join('') : '<p>No fresh recommendations right now.</p>'}</div><div class="feature"><span class="feature-index">TRACKER</span><h3>My Opportunity Tracker</h3>${trackerKeys.map(key => `<p>• ${key}: ${state.tracker?.[key]?.length || 0}</p>`).join('')}</div><div class="feature"><span class="feature-index">CONTRIBUTION</span><h3>Your contribution</h3><p>${Number(state.user?.points||0)} contribution points</p></div></div><div class="challenge-card"><div><span class="eyebrow">Weekly challenge</span><h3>Complete your profile + save 3 opportunities</h3></div><button class="primary" data-view="profile">Update profile →</button></div>${state.dashTab==='submitted'?'<div class="empty">Your submitted opportunities will appear here after review.</div>':list.length?`<div class="event-grid">${state.events.filter(e=>list.includes(e.id)).map(eventCard).join('')}</div>`:'<div class="empty">Your list is ready for its first good find. <button class="text-btn" data-view="events">Explore events →</button></div>'}</main>`}

function adminPortal(){const overview = state.adminOverview; return `<main class="page"><div class="page-top"><div><span class="eyebrow">Administrative controls</span><h2>Admin portal</h2><p>Monitor community activity, review submissions, and approve listings.</p></div><button class="ghost" data-view="events">Open public feed</button></div><div class="dashboard-grid"><div class="metric"><span class="eyebrow">Total events</span><span class="number">${overview.totalEvents}</span><small>Across Campus Arena</small></div><div class="metric"><span class="eyebrow">Pending reviews</span><span class="number">${overview.pendingEvents}</span><small>Needs a quick decision</small></div><div class="metric"><span class="eyebrow">Verified</span><span class="number">${overview.verifiedEvents}</span><small>Active opportunities</small></div><div class="metric"><span class="eyebrow">Reports</span><span class="number">${overview.reportsCount}</span><small>Moderation queue</small></div></div><div class="admin-panel"><div class="admin-panel-header"><h3>Submission queue</h3></div>${(state.adminEvents||[]).length?`<div class="event-grid">${state.adminEvents.map(event => `<article class="event-card"><div class="card-top"><span class="tag">${esc(event.category)}</span><span class="status">● ${esc(event.status)}</span></div><h3>${esc(event.title)}</h3><p>${esc(event['desc'])}</p><div class="card-meta"><span>${esc(event.date)}</span><span>${esc(event.mode)}</span><span>Deadline: ${esc(event.deadline || 'Review needed')}</span></div><div class="card-actions"><button class="primary" data-action="approve-event" data-id="${event.id}">Approve</button><button class="ghost" data-action="reject-event" data-id="${event.id}">Reject</button></div></article>`).join('')}</div>`:'<div class="empty">There are no pending submissions to review.</div>'}</div></main>`; }
function adminEventForm(event = {}){
  modal(`<div class="modal-head"><div><span class="eyebrow">Opportunity management</span><h2>${event.id ? 'Edit opportunity.' : 'Add opportunity.'}</h2></div><button class="close" data-action="close">×</button></div><form class="form" id="admin-event-form"><input type="hidden" name="id" value="${esc(event.id || '')}"><label>Title<input name="title" required value="${esc(event.title || '')}"></label><label>Category<select name="category"><option ${event.category === 'Hackathon' ? 'selected' : ''}>Hackathon</option><option ${event.category === 'Internship' ? 'selected' : ''}>Internship</option><option ${event.category === 'Job' ? 'selected' : ''}>Job</option><option ${event.category === 'Coding' ? 'selected' : ''}>Coding</option><option ${event.category === 'Competition' ? 'selected' : ''}>Competition</option><option ${event.category === 'Event' ? 'selected' : ''}>Event</option><option ${event.category === 'Tech Summit' ? 'selected' : ''}>Tech Summit</option></select></label><label>Event date<input name="date" required value="${esc(event.date || '')}"></label><label>Deadline<input name="deadline" required value="${esc(event.deadline || '')}"></label><label>Mode<select name="mode"><option ${event.mode === 'Remote' ? 'selected' : ''}>Remote</option><option ${event.mode === 'On-site' ? 'selected' : ''}>On-site</option><option ${event.mode === 'Hybrid' ? 'selected' : ''}>Hybrid</option></select></label><label>Status<select name="status"><option ${event.status === 'Verified' ? 'selected' : ''}>Verified</option><option ${event.status === 'Pending' ? 'selected' : ''}>Pending</option><option ${event.status === 'Rejected' ? 'selected' : ''}>Rejected</option></select></label><label>Organization<input name="org" required value="${esc(event.org || '')}"></label><label>Application URL<input name="href" type="url" required value="${esc(event.href || '')}"></label><label>Description<textarea name="desc" rows="4" required>${esc(event.desc || '')}</textarea></label><button class="primary">${event.id ? 'Save changes' : 'Create opportunity'} →</button></form>`);
}
function adminPortalV2(){
  const pending = state.adminEvents.filter(event => event.status === 'Pending');
  return `<main class="page"><div class="page-top"><div><span class="eyebrow">Administrative controls</span><h2>Admin portal</h2><p>Manage reports, listings, and student submissions from one place.</p></div><button class="ghost" data-view="events">Open public feed</button></div><div class="dashboard-grid"><div class="metric"><span class="eyebrow">Total opportunities</span><span class="number">${state.adminOverview.totalEvents}</span><small>Managed listings</small></div><div class="metric"><span class="eyebrow">Pending submissions</span><span class="number">${pending.length}</span><small>Waiting for approval</small></div><div class="metric"><span class="eyebrow">Verified listings</span><span class="number">${state.adminOverview.verifiedEvents}</span><small>Published opportunities</small></div><div class="metric"><span class="eyebrow">Open reports</span><span class="number">${state.adminReports.filter(report => report.status === 'Open').length}</span><small>Needs moderation</small></div></div><section class="admin-panel"><div class="admin-panel-header"><div><span class="eyebrow">Submission approval</span><h3>Review student submissions</h3></div></div>${pending.length ? `<div class="admin-list">${pending.map(event => adminEventRow(event, true)).join('')}</div>` : '<div class="empty">There are no pending submissions to review.</div>'}</section><section class="admin-panel"><div class="admin-panel-header"><div><span class="eyebrow">Opportunity management</span><h3>Add, edit, or delete listings</h3></div><button class="secondary" data-action="admin-add-event">Add opportunity</button></div><div class="admin-list">${state.adminEvents.length ? state.adminEvents.map(event => adminEventRow(event, false)).join('') : '<div class="empty">No opportunity listings found.</div>'}</div></section><section class="admin-panel"><div class="admin-panel-header"><div><span class="eyebrow">Report management</span><h3>Incorrect, expired, or misleading information</h3></div></div>${state.adminReports.length ? `<div class="admin-list">${state.adminReports.map(report => `<article class="admin-row"><div><span class="tag">${esc(report.status)}</span><h4>${esc(report.event_title || 'Deleted opportunity')}</h4><p>${esc(report.reason)} · Reported by ${esc(report.reporter_name || 'Student')}</p></div><div class="admin-row-actions">${report.status === 'Open' ? `<button class="secondary" data-action="resolve-report" data-id="${report.id}">Resolve</button><button class="ghost" data-action="dismiss-report" data-id="${report.id}">Dismiss</button>` : '<span class="admin-status">Reviewed</span>'}</div></article>`).join('')}</div>` : '<div class="empty">No reports have been submitted.</div>'}</section></main>`;
}
function adminEventRow(event, approval){return `<article class="admin-row"><div><span class="tag">${esc(event.category)}</span><h4>${esc(event.title)}</h4><p>${esc(event.org)} · ${esc(event.date)} · ${esc(event.status)}</p></div><div class="admin-row-actions">${approval ? `<button class="primary" data-action="approve-event" data-id="${event.id}">Approve</button><button class="ghost" data-action="reject-event" data-id="${event.id}">Reject</button>` : `<button class="secondary" data-action="admin-edit-event" data-id="${event.id}">Edit</button><button class="ghost" data-action="admin-delete-event" data-id="${event.id}">Delete</button>`}</div></article>`}
function support(){return `<main class="page support-page">
  <section class="support-hero">
    <div class="support-hero-copy">
      <span class="support-kicker">CAMPUS ARENA / HELP CENTER</span>
      <h2>Find your next step.</h2>
      <p>Quick answers for finding opportunities, managing applications, and contributing to the community.</p>
      <div class="support-hero-actions">
        <button class="support-primary" data-view="events">Explore opportunities <span aria-hidden="true">&rarr;</span></button>
        <button class="support-secondary" data-action="assistant">Ask the assistant <span aria-hidden="true">&nearr;</span></button>
      </div>
    </div>
    <div class="support-hero-mark" aria-hidden="true"><span>CA</span><small>HELP<br>WITHOUT<br>THE RUNAROUND</small><i></i></div>
  </section>
  <section class="support-start" aria-labelledby="support-start-title">
    <div class="support-start-heading"><span class="eyebrow">A QUICK START</span><h3 id="support-start-title">Your first three moves.</h3></div>
    <div class="support-start-grid">
      <article><span>01</span><div><h4>Find a fit</h4><p>Search by role, category, format, or organization, then check the deadline.</p></div><button class="support-start-link" data-view="events" aria-label="Browse opportunities">Browse listings <b aria-hidden="true">&rarr;</b></button></article>
      <article><span>02</span><div><h4>Save and plan</h4><p>Save interesting listings and use your dashboard to keep track of next steps.</p></div><button class="support-start-link" data-view="${state.user?'dashboard':'landing'}" ${state.user?'':'data-action="login"'}>${state.user?'Open dashboard':'Sign in'} <b aria-hidden="true">&rarr;</b></button></article>
      <article><span>03</span><div><h4>Verify before applying</h4><p>Open the organizer’s official page to confirm eligibility, dates, and requirements.</p></div><button class="support-start-link" data-action="assistant">Ask the assistant <b aria-hidden="true">&rarr;</b></button></article>
    </div>
  </section>
  <label class="support-search"><span>SEARCH THE HELP GUIDE</span><input id="support-search" type="search" placeholder="Try: points, deadlines, saved opportunities" aria-label="Search help articles"><button class="support-search-clear" type="button" data-action="clear-support-search" aria-label="Clear help search" hidden>Clear</button><kbd>/</kbd></label>
  <div class="support-layout">
    <section class="support-articles" aria-label="Help articles">
      <div class="support-articles-head"><div><span class="eyebrow">THE FIELD GUIDE</span><h3>Answers, without the detour.</h3></div><div class="support-article-tools"><span class="support-result-count" aria-live="polite"></span><button class="support-expand-all" type="button" data-action="toggle-support-answers">Expand all</button></div></div>
      <div class="support-topics" aria-label="Filter help topics">
        <button class="support-topic active" data-support-topic="All" aria-pressed="true">All</button>
        <button class="support-topic" data-support-topic="Discover" aria-pressed="false">Discover</button>
        <button class="support-topic" data-support-topic="Applications" aria-pressed="false">Applications</button>
        <button class="support-topic" data-support-topic="Contributions" aria-pressed="false">Contributions</button>
        <button class="support-topic" data-support-topic="Account" aria-pressed="false">Account</button>
        <button class="support-topic" data-support-topic="Safety" aria-pressed="false">Safety</button>
      </div>
      <div class="support-faq-list">
        <details class="support-question" data-topic="Discover"><summary>How do I find opportunities that fit me?</summary><p>Open Discover to browse and filter by category or format. Search for a role, organization, or skill, and use the deadline information to plan your shortlist.</p></details>
        <details class="support-question" data-topic="Discover"><summary>What do the listing statuses mean?</summary><p>Pending listings are waiting for moderator review. Verified means a moderator reviewed the listing; it is not a guarantee that applications are still open. Rejected listings are removed from discovery.</p></details>
        <details class="support-question" data-topic="Applications"><summary>Does “Apply Now” submit my application?</summary><p>No. Campus Arena opens the opportunity’s original link. Review the organizer’s instructions and submit your application there. Confirming the action in Campus Arena records it in your application activity.</p></details>
        <details class="support-question" data-topic="Applications"><summary>Where can I find saved opportunities?</summary><p>Save a listing from Discover, then open your dashboard and select Saved events. Sign in to keep your account activity available across visits.</p></details>
        <details class="support-question" data-topic="Applications"><summary>How should I use the opportunity tracker?</summary><p>Use the tracker on a listing to organize it by your next step, such as planning, applying, or following up. Revisit your dashboard to review what you are tracking.</p></details>
        <details class="support-question" data-topic="Applications"><summary>Which deadline should I trust?</summary><p>Use Campus Arena’s date as a guide, then confirm the current deadline, time zone, eligibility, and required materials on the organizer’s official page. Report a listing if its details appear outdated.</p></details>
        <details class="support-question" data-topic="Contributions"><summary>How can I submit an opportunity?</summary><p>Sign in and use the opportunity submission flow. Include a clear description and the organizer’s official URL. Submissions are reviewed before they are approved for the public feed.</p></details>
        <details class="support-question" data-topic="Contributions"><summary>How do contribution points work?</summary><p>When an admin approves an opportunity submitted by a student, that contributor receives 30 points. Badges update as contribution points grow.</p></details>
        <details class="support-question" data-topic="Contributions"><summary>How do I report an expired or incorrect listing?</summary><p>Sign in and choose the report option on the listing, or use Contact Admin here. Include what seems wrong so the moderation team can investigate.</p><button class="support-inline-action" type="button" data-action="admin-report">Contact Admin</button></details>
        <details class="support-question" data-topic="Account"><summary>Where do I update my profile?</summary><p>Sign in and open your profile from the avatar menu. Your dashboard is the place to revisit saved opportunities, application activity, and contribution points.</p></details>
        <details class="support-question" data-topic="Account"><summary>Why can’t I see my saved items on another device?</summary><p>Make sure you are signed in to the same account. If the issue continues, refresh the page and check whether the listing is still available.</p></details>
        <details class="support-question" data-topic="Safety"><summary>How can I check that an opportunity is legitimate?</summary><p>Open the organizer’s official website, confirm the role and application details there, and be cautious of requests for money or sensitive information. Campus Arena does not submit applications for you.</p></details>
        <details class="support-question" data-topic="Safety"><summary>Does the student assistant know the latest application details?</summary><p>The assistant searches Campus Arena’s current opportunity feed and provides practical student guidance without an external AI service. It has no live web access, so always confirm dates, eligibility, availability, and requirements on the official organizer page. It will tell you when it cannot answer reliably rather than guessing.</p></details>
      </div>
      <p class="support-empty" hidden>No guide matched that search. Try a different phrase or topic.</p>
    </section>
    <aside class="support-routes"><span class="eyebrow">GO STRAIGHT TO</span><h3>Choose a route.</h3>
      <button class="support-route" data-view="events"><span><small>01 / DISCOVER</small>Browse the opportunity feed</span><b aria-hidden="true">&rarr;</b></button>
      <button class="support-route" data-view="${state.user?'dashboard':'landing'}" ${state.user?'':'data-action="login"'}><span><small>02 / YOUR ACCOUNT</small>${state.user?'Open your dashboard':'Sign in to your dashboard'}</span><b aria-hidden="true">&rarr;</b></button>
      <button class="support-route" data-action="admin-report"><span><small>03 / GET SUPPORT</small>Report an issue to the admin</span><b aria-hidden="true">&rarr;</b></button>
      <button class="support-route" data-action="assistant"><span><small>04 / ASK A QUESTION</small>Talk with the campus assistant</span><b aria-hidden="true">&rarr;</b></button>
      <div class="support-note"><span class="support-note-mark">i</span><p>For eligibility, availability, and deadlines, confirm details on the original organizer listing.</p></div>
    </aside>
  </div>
</main>`}
function filterSupportArticles(){const query=(document.querySelector('#support-search')?.value||'').trim().toLowerCase();const activeTopic=document.querySelector('.support-topic.active')?.dataset.supportTopic||'All';let visible=0;document.querySelectorAll('.support-question').forEach(article=>{const matchesTopic=activeTopic==='All'||article.dataset.topic===activeTopic;const matchesQuery=!query||article.textContent.toLowerCase().includes(query);article.hidden=!(matchesTopic&&matchesQuery);if(!article.hidden)visible++;});const empty=document.querySelector('.support-empty');if(empty)empty.hidden=visible>0;const count=document.querySelector('.support-result-count');if(count)count.textContent=`${visible} ${visible===1?'ARTICLE':'ARTICLES'}`;const clear=document.querySelector('.support-search-clear');if(clear)clear.hidden=!query;}
document.addEventListener('input',event=>{if(event.target.id==='support-search')filterSupportArticles();});
document.addEventListener('click',event=>{const button=event.target.closest('.support-topic');if(!button)return;document.querySelectorAll('.support-topic').forEach(topic=>{const active=topic===button;topic.classList.toggle('active',active);topic.setAttribute('aria-pressed',String(active));});filterSupportArticles();});
document.addEventListener('click',event=>{const button=event.target.closest('[data-action="clear-support-search"], [data-action="toggle-support-answers"]');if(!button)return;if(button.dataset.action==='clear-support-search'){const search=document.querySelector('#support-search');if(!search)return;search.value='';filterSupportArticles();search.focus();return;}const articles=[...document.querySelectorAll('.support-question:not([hidden])')];const expand=articles.some(article=>!article.open);articles.forEach(article=>{article.open=expand;});button.textContent=expand?'Collapse all':'Expand all';});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){const search=document.querySelector('#support-search');if(search){event.preventDefault();search.focus();}}});
document.addEventListener('click',event=>{const button=event.target.closest('.support-route[data-action="login"]');if(!button)return;event.stopImmediatePropagation();auth('login');},true);
function profile(){const image=state.user.profile_image||state.user.profileImage; return `<main class="page"><div class="page-top"><div><span class="eyebrow">Personal details</span><h2>My profile</h2><p>Keep your identity and account details up to date.</p></div><button class="ghost" data-view="dashboard">View dashboard</button></div><form class="form profile-form" id="profile-form"><div class="profile-photo">${image?`<img src="${esc(image)}" alt="Profile image">`:`<span>${esc(state.user.name[0])}</span>`}</div><label>Profile image<input name="profileImage" type="file" accept="image/*"></label><label>Name<input name="name" required value="${esc(state.user.name)}"></label><label>College / University<input name="college" required value="${esc(state.user.college)}"></label><label>Email<input value="${esc(state.user.email)}" disabled></label><label>Bio<textarea name="bio" rows="4" placeholder="Tell the community a little about you.">${esc(state.user.bio||'')}</textarea></label><label>Interests<textarea name="interests" rows="2" placeholder="AI, startups, design...">${esc(state.user.interests||'')}</textarea></label><label>Skills<textarea name="skills" rows="2" placeholder="Python, product, Figma...">${esc(state.user.skills||'')}</textarea></label><label>Course / Branch<input name="course" value="${esc(state.user.course||'')}" placeholder="Computer Science"></label><label>Eligibility<textarea name="eligibility" rows="2" placeholder="CGPA 8.5+, final-year students...">${esc(state.user.eligibility||'')}</textarea></label><button class="primary">Save profile →</button></form><div class="profile-security"><span class="eyebrow">Account security</span><h3>Reset your password</h3><p>Use your college name as the security answer.</p><button class="secondary" data-action="reset-password">Reset password →</button></div><div class="profile-logout"><button class="ghost" data-action="logout">Log out</button></div></main>`}
function assistantFab(){return state.user?'<button class="assistant-fab" data-action="assistant" aria-label="Open Campus Arena student assistant"><span class="assistant-fab-icon">✦</span><span>Student assistant</span></button>':'';}
function render(){document.documentElement.dataset.theme=state.theme; app.innerHTML=`<div class="shell">${nav()}${state.view==='landing'?landing():state.view==='events'?events():state.view==='alumni'?alumni():state.view==='dashboard'?dashboard():state.view==='profile'?profile():state.view==='admin'?adminPortalV2():state.view==='discussion'?discussion():support()}<footer class="footer"><span>© 2026 Campus Arena</span><span>Built for the curious.</span></footer></div>${assistantFab()}${state.user?`<nav class="mobile-nav"><button data-view="landing" class="${state.view==='landing'?'active':''}"><b>⌂</b>Home</button><button data-view="events" class="${state.view==='events'?'active':''}"><b>＋</b>Events</button><button data-view="alumni" class="${state.view==='alumni'?'active':''}"><b>✦</b>Explore</button><button data-view="discussion" class="${state.view==='discussion'?'active':''}"><b>💬</b>Talk</button><button data-action="saved" class="${state.view==='dashboard'&&state.dashTab==='saved'?'active':''}"><b>♡</b>Saved</button><button data-view="dashboard" class="${state.view==='dashboard'?'active':''}"><b>◉</b>Dashboard</button></nav>`:''}`; persist();}
function toast(message){const el=document.createElement('div');el.className='toast';el.textContent=message;document.body.append(el);setTimeout(()=>el.remove(),2400)}
function modal(content){document.querySelector('#modal-root').innerHTML=`<div class="modal-backdrop" data-close><div class="modal">${content}</div></div>`}
function auth(mode='login'){modal(`<div class="modal-head"><div><span class="eyebrow">Campus Arena</span><h2>${mode==='login'?'Welcome back.':'Join the arena.'}</h2></div><button class="close" data-action="close">×</button></div><form class="form" id="auth-form">${mode==='signup'?'<label>Name<input name="name" required placeholder="Your name"></label><label>College / University<input name="college" required placeholder="Where you study"></label>':''}<label>Email<input name="email" type="email" required placeholder="you@campus.edu"></label><label>Password<input name="password" type="password" required placeholder="At least 8 characters"></label><button class="primary">${mode==='login'?'Login':'Create account'} →</button></form><p class="switch">${mode==='login'?'New here?':'Already a member?'} <button data-action="${mode==='login'?'signup':'login'}">${mode==='login'?'Create an account':'Login instead'}</button></p>${mode==='login'?'<p class="switch"><button data-action="forgot">Forgot password?</button></p>':''}`)}
function discussion(){ return `<main class="page"><div class="page-top"><div><span class="eyebrow">Student discussion space</span><h2>Campus talk</h2><p>Ask questions, share prep tips, and discuss upcoming events with the community.</p></div></div><div class="feature-grid">${(state.discussionPosts.length ? state.discussionPosts : [{author:'Campus Team', text:'How are you preparing for your next application cycle?', tag:'General'}, {author:'Aisha', text:'Shared a checklist for hackathon prep: portfolio, team pitch, and time-blocking.', tag:'Tips'}]).map(post => `<article class="feature"><span class="feature-index">${esc(post.tag || 'Community')}</span><h3>${esc(post.author || 'Student')}</h3><p>${esc(post.text || '')}</p></article>`).join('')}</div><form class="form" id="discussion-form"><label>Post a question or tip<textarea name="text" rows="4" required placeholder="What are you preparing for?"></textarea></label><label>Tag<select name="tag"><option>General</option><option>Tips</option><option>Events</option><option>Questions</option></select></label><button class="primary">Share with the community →</button></form></main>`; }
function apply(id){let e=state.events.find(x=>x.id==id);modal(`<div class="modal-head"><div><span class="eyebrow">${esc(e.category)}</span><h2>One clear next step.</h2></div><button class="close" data-action="close">×</button></div><p style="color:var(--muted);line-height:1.6">Are you just browsing <strong>${esc(e.title)}</strong>, or are you actually applying?</p><div class="intent-options"><button data-action="browse" data-id="${id}">Just browsing <small>Save it and keep exploring.</small></button><button data-action="confirm-apply" data-id="${id}">I am applying <small>Track this intent and open the original listing.</small></button></div>`)}
function post(){modal(`<div class="modal-head"><div><span class="eyebrow">Community contribution</span><h2>Post an opportunity.</h2></div><button class="close" data-action="close">×</button></div><form class="form" id="post-form"><label>Opportunity title<input name="title" required placeholder="e.g. Student Product Sprint"></label><label>Category<select name="category"><option>Hackathon</option><option>Internship</option><option>Job</option><option>Coding</option><option>Competition</option><option>Event</option></select></label><label>Application deadline<input name="deadline" type="date" required></label><label>Application URL<input name="href" type="url" required placeholder="https://..."></label><label>Short description<textarea name="desc" rows="3" required placeholder="What should students know?"></textarea></label><button class="primary">Submit for review →</button></form>`)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-view],[data-action]');if(!b)return;if(b.dataset.view){state.view=b.dataset.view;render();return}const a=b.dataset.action,id=Number(b.dataset.id);if(a==='theme'){state.theme=state.theme==='light'?'dark':'light';render()}if(a==='login'||a==='signup')auth(a);if(a==='close')document.querySelector('#modal-root').innerHTML='';if(a==='forgot')modal('<div class="modal-head"><div><span class="eyebrow">Reset access</span><h2>Check your inbox.</h2></div><button class="close" data-action="close">×</button></div><p style="color:var(--muted);line-height:1.6">Enter your email on the next step and we will send a secure reset link.</p><form class="form"><label>Email<input type="email" required placeholder="you@campus.edu"></label><button class="primary" type="button" data-action="close">Send reset link →</button></form>');if(a==='profile'){state.view='dashboard';render()}if(a==='post')post();if(a==='saved'){state.view='dashboard';state.dashTab='saved';render()}if(a==='dash-tab'){state.dashTab=b.dataset.tab;render()}if(a==='save'){if(!state.saved.includes(id))state.saved.push(id);else state.saved=state.saved.filter(x=>x!==id);toast(state.saved.includes(id)?'Added to your list.':'Removed from your list.');render()}if(a==='hide'){state.hidden.push(id);toast('Hidden from your feed.');render()}if(a==='upvote'){const ev=state.events.find(x=>x.id===id);ev.votes++;toast('Thanks for strengthening the signal.');render()}if(a==='report'){toast('Report received. Our moderators will review it.')}if(a==='apply')apply(id);if(a==='browse'){document.querySelector('#modal-root').innerHTML='';toast('Saved for later.');if(!state.saved.includes(id))state.saved.push(id);render()}if(a==='confirm-apply'){const ev=state.events.find(x=>x.id===id);if(!state.applied.includes(id))state.applied.push(id);document.querySelector('#modal-root').innerHTML='';persist();toast('Application tracked. Opening listing...');setTimeout(()=>window.open(ev.href,'_blank','noopener'),500)}if(a==='contact')modal('<div class="modal-head"><div><span class="eyebrow">Support</span><h2>Send a note.</h2></div><button class="close" data-action="close">×</button></div><form class="form"><label>Your email<input type="email" required placeholder="you@campus.edu"></label><label>Message<textarea required rows="4" placeholder="What can we help with?"></textarea></label><button type="button" class="primary" data-action="close">Send message →</button></form>')});
document.addEventListener('click', event => {
  const button = event.target.closest('[data-action="browse-category"], [data-action="quick-filter"]');
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  state.view = 'events';
  state.search = '';
  state.mode = 'All modes';
  state.deadlineFilter = 'Any deadline';
  state.savedOnly = false;
  state.quickFilter = button.dataset.action === 'quick-filter' ? button.dataset.filter : 'All';
  state.filter = button.dataset.action === 'browse-category' ? button.dataset.category : 'All';
  render();
}, true);
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action="export-saved"]');
  if(!button)return;
  event.preventDefault();
  event.stopPropagation();
  downloadSavedShortlist();
});
document.addEventListener('click',e=>{
  const button = e.target.closest('[data-action="assistant"], [data-action="assistant-prompt"], [data-action="assistant-view"], [data-action="assistant-clear"]');
  if (!button) return;
  if (button.dataset.action === 'assistant') assistant();
  if (button.dataset.action === 'assistant-prompt') askAssistant(button.dataset.prompt, button.closest('.assistant-modal, .assistant-widget'));
  if (button.dataset.action === 'assistant-clear') {
    state.assistantRequestId++;
    state.assistantHistory = [];
    state.assistantEvents = [];
    localStorage.removeItem('assistantHistory');
    const chat = button.closest('.assistant-modal, .assistant-widget')?.querySelector('.assistant-messages');
    if (chat) chat.innerHTML = assistantTranscript();
  }
  if (button.dataset.action === 'assistant-view') {
    const eventId = Number(button.dataset.id);
    eventDetails(state.events.find(event => event.id === eventId));
  }
});
document.addEventListener('click', e => {
  const button = e.target.closest('[data-action]');
  if (!button || !['details', 'share'].includes(button.dataset.action)) return;
  const event = state.events.find(item => item.id === Number(button.dataset.id));
  if (button.dataset.action === 'details') eventDetails(event);
  if (button.dataset.action === 'share') shareEvent(event);
});
document.addEventListener('submit',e=>{if(e.target.id==='auth-form'||e.target.id==='post-form')e.preventDefault();});
document.addEventListener('input',e=>{if(e.target.dataset.filter==='search'){const cursor=e.target.selectionStart;state.search=e.target.value;render();const search=document.querySelector('[data-filter="search"]');search.focus();search.setSelectionRange(cursor,cursor);}});document.addEventListener('change',e=>{if(e.target.dataset.action==='saved-folder'){state.savedFolders[e.target.dataset.id]=e.target.value;persist();return}if(e.target.dataset.filter==='category')state.filter=e.target.value;if(e.target.dataset.filter==='mode')state.mode=e.target.value;if(e.target.dataset.filter==='deadline')state.deadlineFilter=e.target.value;if(e.target.dataset.filter==='sort')state.sortBy=e.target.value;if(e.target.dataset.filter==='saved-only')state.savedOnly=e.target.checked;render()});
document.addEventListener('submit',e=>{if(e.target.id!=='assistant-form'&&e.target.id!=='dashboard-assistant-form')return;e.preventDefault();askAssistant(new FormData(e.target).get('question')||'', e.target.closest('.assistant-modal, .assistant-widget'));});
document.addEventListener('submit', async e=>{if(!e.target.matches('.review-form'))return;e.preventDefault();try{await apiRequest(`/api/events/${e.target.dataset.eventId}/reviews`,{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});toast('Review posted.');document.querySelector('#modal-root').innerHTML='';}catch(error){toast(error.message);}});
render();
new MutationObserver(() => { mountAssistantWidget(); mountAdminAnalytics(); mountSupportContact(); }).observe(app, { childList: true });
mountAssistantWidget();
mountAdminAnalytics();

async function apiRequest(path, options = {}) {
  if (window.location.protocol === 'file:') {
    throw new Error('Backend features require opening the app at http://localhost:4173.');
  }
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : { error: (await response.text()).trim() || 'Request failed' };
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function reportForm(event = null){
  if(!state.user){modal(`<div class="modal-head"><div><span class="eyebrow">Contact the admin</span><h2>Sign in to send a report.</h2></div><button class="close" data-action="close">×</button></div><p class="report-intro">Reports are linked to your account so the admin can follow up and take action.</p><div class="report-modal-actions"><button class="primary" data-action="login">Sign in</button><button class="secondary" data-action="signup">Create account</button></div>`);return;}
  modal(`<div class="modal-head"><div><span class="eyebrow">PRIVATE ADMIN REPORT</span><h2>Tell us what happened.</h2></div><button class="close" data-action="close">×</button></div><p class="report-intro">Your name, college, and email are attached for the admin. Include clear details so they can investigate and act.</p><form class="form report-form" id="report-form"><label>Report type<select name="category" required><option>Safety concern</option><option>Scam or misleading</option><option>Expired opportunity</option><option>Incorrect details</option><option>Technical issue</option><option>Other</option></select></label><label>Subject<input name="subject" required minlength="5" maxlength="120" placeholder="Briefly describe the issue"></label><label>Related opportunity<select name="eventId"><option value="">General complaint / not about a listing</option>${state.events.filter(item=>item.status!=='Rejected').map(item=>`<option value="${item.id}" ${event?.id===item.id?'selected':''}>${esc(item.title)} · ${esc(item.org)}</option>`).join('')}</select></label><label>What happened?<textarea name="details" required minlength="20" maxlength="3000" rows="5" placeholder="Share what happened, where you saw it, and any details the admin should know."></textarea><small>20 to 3,000 characters. Avoid including passwords or sensitive personal information.</small></label><button class="primary" type="submit">Send report to admin →</button></form>`);
}
function mountSupportContact(){filterSupportArticles();const actions=document.querySelector('.support-hero-actions');if(!actions||actions.querySelector('[data-action="admin-report"]'))return;const button=document.createElement('button');button.className='support-secondary';button.dataset.action='admin-report';button.textContent='Contact Admin';actions.append(button);}
document.addEventListener('click',event=>{const button=event.target.closest('[data-action="report"], [data-action="admin-report"]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();const reportEvent=button.dataset.action==='report'?state.events.find(item=>item.id===Number(button.dataset.id)):null;reportForm(reportEvent);},true);
document.addEventListener('submit',async event=>{if(event.target.id!=='report-form')return;event.preventDefault();const submit=event.target.querySelector('[type="submit"]');submit.disabled=true;submit.textContent='Sending...';try{const result=await apiRequest('/api/reports',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(event.target)))});document.querySelector('#modal-root').innerHTML='';toast(`Report #${result.reportId} sent to the admin.`);}catch(error){toast(error.message);submit.disabled=false;submit.textContent='Send report to admin →';}});
async function syncAdminState() {
  if (!state.user || state.user.role !== 'admin') {
    state.adminOverview = { totalEvents: 0, pendingEvents: 0, verifiedEvents: 0, totalUsers: 0, reportsCount: 0 };
    state.adminEvents = [];
    state.adminReports = [];
    return;
  }
  try {
    const [overview, events, reports] = await Promise.all([
      apiRequest('/api/admin/overview'),
      apiRequest('/api/admin/events'),
      apiRequest('/api/admin/reports')
    ]);
    state.adminOverview = overview.overview;
    state.adminEvents = events.events || [];
    state.adminReports = reports.reports || [];
  } catch {
    state.adminOverview = { totalEvents: 0, pendingEvents: 0, verifiedEvents: 0, totalUsers: 0, reportsCount: 0 };
    state.adminEvents = [];
    state.adminReports = [];
  }
}
async function syncServerState() {
  if (window.location.protocol === 'file:') return;
  try {
    const data = await apiRequest('/api/events');
    state.events = data.events;
    try {
      const me = await apiRequest('/api/me');
      state.user = me.user;
      state.saved = data.events.filter(event => event.saved).map(event => event.id);
      state.applied = data.events.filter(event => event.applied).map(event => event.id);
      await syncAdminState();
    } catch {
      state.user = null;
      state.saved = [];
      state.applied = [];
    }
    render();
  } catch {
    state.user = null;
    state.saved = [];
    state.applied = [];
    render();
  }
}
document.addEventListener('submit', async event => {
  if (event.target.id === 'discussion-form') {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    if (!data.text) return;
    state.discussionPosts.unshift({
      author: state.user?.name || 'Anonymous Student',
      text: data.text,
      tag: data.tag || 'General'
    });
    persist();
    render();
    toast('Your discussion post is live.');
    return;
  }
  if (event.target.id !== 'auth-form' && event.target.id !== 'post-form') return;
  const data = Object.fromEntries(new FormData(event.target));
  try {
    if (event.target.id === 'auth-form') {
      const mode = data.name ? 'signup' : 'login';
      const result = await apiRequest(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify(data) });
      state.user = result.user;
      const events = await apiRequest('/api/events');
      state.events = events.events;
      state.saved = events.events.filter(item => item.saved).map(item => item.id);
      state.applied = events.events.filter(item => item.applied).map(item => item.id);
      await syncAdminState();
      document.querySelector('#modal-root').innerHTML = '';
      state.view = state.user.role === 'admin' ? 'admin' : 'dashboard';
      render();
    } else if (state.user) {
      await apiRequest('/api/events', { method: 'POST', body: JSON.stringify(data) });
      const events = await apiRequest('/api/events');
      state.events = events.events;
      document.querySelector('#modal-root').innerHTML = '';
      state.view = 'events';
      render();
    }
  } catch (error) {
    toast(error.message);
  }
});
document.addEventListener('click', event => {
  const button = event.target.closest('[data-action="save"], [data-action="apply"], [data-action="hide"]');
  if (button && !state.user) {
    event.stopImmediatePropagation();
    auth('login');
    toast('Please log in to use opportunity actions.');
  }
}, true);
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]');
  if (!button || !state.user) return;
  const action = button.dataset.action;
  const eventId = button.dataset.id;
  try {
    if (action === 'quick-filter') {
      state.quickFilter = button.dataset.filter || 'All';
      state.view = 'events';
      render();
      return;
    }
    if (action === 'admin-portal') {
      state.view = 'admin';
      await syncAdminState();
      render();
      return;
    }
    if (action === 'approve-event' || action === 'reject-event') {
      const decision = action === 'approve-event' ? 'approve' : 'reject';
      await apiRequest(`/api/admin/events/${eventId}/${decision}`, { method: 'POST' });
      await syncAdminState();
      state.view = 'admin';
      render();
      toast(decision === 'approve' ? 'Opportunity approved.' : 'Opportunity rejected.');
      return;
    }
    if (action === 'update-tracker') {
      const bucket = button.value;
      if (!bucket) return;
      const target = Number(eventId);
      Object.keys(state.tracker || {}).forEach(key => {
        state.tracker[key] = (state.tracker[key] || []).filter(id => id !== target);
      });
      state.tracker[bucket] = [...new Set([...(state.tracker[bucket] || []), target])];
      persist();
      render();
      return;
    }
    if (action === 'follow-org') { await apiRequest('/api/organizations/follow', { method: 'POST', body: JSON.stringify({ org: button.dataset.org }) }); toast('Organization follow updated.'); return; }
    if (['save', 'upvote', 'report'].includes(action)) await apiRequest(`/api/events/${eventId}/${action}`, { method: 'POST' });
    if (action === 'confirm-apply') await apiRequest(`/api/events/${eventId}/apply`, { method: 'POST' });
  } catch (error) {
    toast(error.message);
  }
});
syncServerState();

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-action="admin-add-event"], [data-action="admin-edit-event"], [data-action="admin-delete-event"], [data-action="resolve-report"], [data-action="dismiss-report"]');
  if (!button || !state.user || state.user.role !== 'admin') return;
  const action = button.dataset.action;
  const id = Number(button.dataset.id);
  try {
    if (action === 'admin-add-event') { adminEventForm(); return; }
    if (action === 'admin-edit-event') { adminEventForm(state.adminEvents.find(item => item.id === id)); return; }
    if (action === 'admin-delete-event') {
      if (!window.confirm('Delete this opportunity and its related reports?')) return;
      await apiRequest(`/api/admin/events/${id}`, { method: 'DELETE' });
      toast('Opportunity deleted.');
    }
    if (action === 'resolve-report' || action === 'dismiss-report') {
      const decision = action === 'resolve-report' ? 'resolve' : 'dismiss';
      await apiRequest(`/api/admin/reports/${id}/${decision}`, { method: 'POST' });
      toast(`Report ${decision}d.`);
    }
    await syncAdminState();
    state.view = 'admin';
    render();
  } catch (error) { toast(error.message); }
});

document.addEventListener('click', event => {
  const metric = event.target.closest('.metric:first-child');
  if (metric && state.user) { state.view = 'dashboard'; state.dashTab = 'saved'; render(); }
});
document.addEventListener('click', event => {
  const brand = event.target.closest('.brand');
  if (brand && state.user) {
    event.stopImmediatePropagation();
    modal(`<div class="modal-head"><div><span class="eyebrow">Campus Arena</span><h2>Leave your arena?</h2></div><button class="close" data-action="close">×</button></div><p style="color:var(--muted);line-height:1.6">Would you like to log out and return to the home page?</p><div class="profile-menu-actions"><button class="primary" data-action="logout">Log out and go home →</button><button class="ghost" data-action="close">Stay signed in</button></div>`);
  }
}, true);

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action="profile"]');
  if (button && state.user) { state.view = 'profile'; render(); }
});
document.addEventListener('click', async event => {
  if (event.target.closest('[data-action="logout"]')) {
    try { await apiRequest('/api/auth/logout', { method: 'POST' }); } catch {}
    state.user = null; state.saved = []; state.applied = []; state.view = 'landing';
    localStorage.removeItem('user'); localStorage.removeItem('saved'); localStorage.removeItem('applied');
    document.querySelector('#modal-root').innerHTML = ''; render(); toast('You have been logged out.');
  }
});
document.addEventListener('click', event => {
  if (event.target.closest('[data-action="reset-password"]')) modal(`<div class="modal-head"><div><span class="eyebrow">Account security</span><h2>Reset password.</h2></div><button class="close" data-action="close">×</button></div><form class="form" id="reset-form"><label>Security question: name of your college<input name="collegeAnswer" required placeholder="Enter your college name"></label><label>New password<input name="password" type="password" minlength="8" required placeholder="At least 8 characters"></label><button class="primary">Reset password →</button></form>`);
});
document.addEventListener('submit', async event => {
  if (event.target.id === 'admin-event-form') {
    event.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(event.target));
      const id = data.id;
      delete data.id;
      await apiRequest(id ? `/api/admin/events/${id}` : '/api/admin/events', { method: id ? 'PUT' : 'POST', body: JSON.stringify(data) });
      document.querySelector('#modal-root').innerHTML = '';
      await syncAdminState();
      state.view = 'admin';
      render();
      toast(id ? 'Opportunity updated.' : 'Opportunity created.');
    } catch (error) { toast(error.message); }
    return;
  }
  if (event.target.id === 'reset-form') {
    event.preventDefault();
    try { await apiRequest('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) }); document.querySelector('#modal-root').innerHTML = ''; toast('Password reset successfully.'); }
    catch (error) { toast(error.message); }
  }
  if (event.target.id === 'profile-form') {
    event.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(event.target));
      const file = event.target.profileImage.files[0];
      if (file) data.profileImage = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(file); });
      const result = await apiRequest('/api/me', { method: 'PUT', body: JSON.stringify(data) });
      state.user = result.user; toast('Profile updated.'); render();
    } catch (error) { toast(error.message); }
  }
});
