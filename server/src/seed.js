import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Requisition from './models/Requisition.js';
import Candidate from './models/Candidate.js';
import { extractProfile } from './services/parser.js';
import { DEFAULT_CRITERIA, MERN_CRITERIA, evaluateCandidate } from './services/scoring.js';

const demoCandidates = [
  {
    name: 'Alex Mercer', title: 'Senior Staff Software Engineer', company: 'Stripe', years: 5.2, location: 'San Francisco, CA',
    body: `Alex Mercer\nalex.mercer@example.test\nSenior Staff Software Engineer at Stripe\n5.2 years experience building payment systems and transaction reconciliation ledgers.\nTechnical skills: TypeScript, Node.js, React, PostgreSQL, Redis, GraphQL, distributed systems.\nLed a team of engineers and architected high-throughput services that scale to millions of payment events.\nWorked on banking integrations and fintech compliance, delivered system reliability and monitoring, comprehensive testing and microservices.\nBuilt end-to-end architecture, on-call alerting, and mentored engineers.\nB.S. Computer Science, University of California, Berkeley.`
  },
  {
    name: 'Elena Rostova', title: 'Staff Engineer', company: 'Brex', years: 7.1, location: 'New York, NY',
    body: `Elena Rostova\nelena.rostova@example.test\nStaff Engineer at Brex\n7.1 years experience in fintech, enterprise expense and payment platforms.\nRust, React, TypeScript, Apache Kafka, Node.js, microservices, distributed architecture, observability and testing.\nLed migration of financial transactions and banking services. Monitoring and reliability goals supported production applications.\nMaster of Computer Science, Columbia University.`
  },
  {
    name: 'Marcus Vance', title: 'Full Stack Engineer', company: 'Plaid', years: 4, location: 'Seattle, WA',
    body: `Marcus Vance\nmarcus.vance@example.test\nFull Stack Engineer at Plaid\n4 years experience developing integrations for banking APIs and financial services.\nNext.js, React, TypeScript, Node.js, Go, AWS, PostgreSQL, GraphQL, REST.\nBuilt developer APIs, collaborated on architecture and payment integration services, and participated in testing.\nB.S. Software Engineering, University of Washington.`
  },
  {
    name: 'Devon Chen', title: 'Backend Engineer', company: 'Affirm', years: 3.2, location: 'Austin, TX',
    body: `Devon Chen\ndevon.chen@example.test\nBackend Engineer at Affirm\n3.2 years experience with Python, FastAPI, PostgreSQL, SQL and backend service development.\nSupported payment microservices and API monitoring at a fintech company.\nCollaborated with the team on integration testing, incident response, and technical documentation.\nB.Tech Computer Science, University of Texas.`
  },
  {
    name: 'Priya Nair', title: 'Software Engineer', company: 'Razorpay', years: 4.5, location: 'Bengaluru, India',
    body: `Priya Nair\npriya.nair@example.test\nSoftware Engineer at Razorpay\n4.5 years experience at a payment and fintech platform developing ledger, reconciliation, and banking integrations.\nTypeScript, Node.js, React, PostgreSQL, GraphQL and Docker.\nLed API modernization, designed distributed architecture, monitoring and reliability dashboards, unit testing.\nB.Tech Computer Science, IIT Madras.`
  },
  {
    name: 'Jordan Blake', title: 'Junior Developer', company: 'Pixel Labs', years: 1.2, location: 'Boston, MA',
    body: `Jordan Blake\njordan.blake@example.test\nJunior Developer at Pixel Labs\n1.2 years experience in frontend web development, HTML, CSS, JavaScript, React and Git.\nCreated accessible customer portals and automated tests for landing pages.\nB.S. Computer Science, Northeastern University.`
  }
];

async function seed() {
  await connectDB();
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@talentiq.demo';
  const password = process.env.SEED_ADMIN_PASSWORD || 'DemoAdmin123!';
  if (password.length < 8) throw new Error('SEED_ADMIN_PASSWORD must contain at least 8 characters.');
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name: 'Sarah Jenkins', email, role: 'admin', passwordHash: await bcrypt.hash(password, 12) });
    console.log(`Created demo admin: ${email}`);
  } else console.log(`Existing account preserved: ${email}`);

  let role = await Requisition.findOne({ code: 'REQ-FENG-2409' });
  if (!role) role = await Requisition.create({ code: 'REQ-FENG-2409', title: 'Senior Full Stack Engineer (FinTech Platform)',
    department: 'Engineering', location: 'San Francisco, CA (Hybrid)', targetHires: 2,
    hiringManager: 'Jordan Vance', status: 'active',
    description: 'Build modern payment and banking services with TypeScript, Node.js, React, PostgreSQL, and GraphQL. Experience with architecture, reliability, distributed systems and fintech is preferred.',
    criteria: DEFAULT_CRITERIA, createdBy: user.id });

  for (const item of demoCandidates) {
    const profile = { ...extractProfile(item.body, item.name), currentTitle: item.title,
      company: item.company, yearsExperience: item.years, location: item.location };
    const exists = await Candidate.exists({ requisition: role.id, email: profile.email });
    if (!exists) await Candidate.create({ ...profile, ...evaluateCandidate(profile, role.criteria),
      requisition: role.id, source: 'demo', uploadedBy: user.id,
      status: item.name === 'Elena Rostova' ? 'interview' : item.name === 'Jordan Blake' ? 'rejected' : 'review' });
  }

  const secondCode = 'REQ-DES-2410';
  if (!await Requisition.exists({ code: secondCode })) await Requisition.create({ code: secondCode,
    title: 'Senior Product Designer', department: 'Product & Design', location: 'Remote',
    targetHires: 1, hiringManager: 'Sarah Jenkins', createdBy: user.id,
    description: 'Design user-centered web apps with design systems, Figma and accessibility.',
    criteria: [
      { key: 'technical', label: 'Design Tools & Methods', weight: 40, keywords: ['Figma', 'prototype', 'design system', 'research'] },
      { key: 'seniority', label: 'Leadership & Delivery', weight: 25, keywords: ['lead', 'stakeholder', 'ownership'] },
      { key: 'domain', label: 'Product Thinking', weight: 20, keywords: ['product', 'customer', 'metrics'] },
      { key: 'reliability', label: 'Accessibility & Handoff', weight: 15, keywords: ['accessibility', 'developer', 'handoff'] }
    ] });
  // Creating this role does not move or re-score candidates from another job.
  // Upload resumes to it directly to evaluate software-development skills.
  if (!await Requisition.exists({ code: 'REQ-MERN-2601' })) {
    await Requisition.create({ code: 'REQ-MERN-2601', title: 'Full Stack / MERN Developer',
      department: 'Engineering', location: 'Hybrid / Remote', targetHires: 2,
      hiringManager: 'Sarah Jenkins', status: 'active', createdBy: user.id,
      description: 'Full-stack application development with React, Node.js, Express, MongoDB, REST APIs and Git.',
      criteria: MERN_CRITERIA });
  }
  console.log('Demo data ready. Run the React client and sign in with the configured demo admin account.');
}

seed().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => mongoose.disconnect());
