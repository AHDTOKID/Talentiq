import test from 'node:test';
import assert from 'node:assert/strict';
import { extractProfile } from './parser.js';

test('extracts email, skills and education from resume text', () => {
  const result = extractProfile('Ava Patel\nava@example.com\n4 years experience developing Node.js and React APIs.\nB.Tech Computer Science');
  assert.equal(result.email, 'ava@example.com');
  assert.ok(result.skills.includes('Node.js'));
  assert.equal(result.yearsExperience, 4);
});
test('flags documents with insufficient extractable text', () => {
  const result = extractProfile('Short resume', 'Someone');
  assert.ok(result.parseWarnings.length > 0);
});

test('v2 extracts projects, internships, certifications and achievements into distinct fields', () => {
  const sample = `Ava Patel
ava@example.com
Location: Chandigarh, India
Full Stack Developer
Summary
I build web applications.
Technical Skills & Interests
React, Node.js, Express.js, MongoDB, MySQL
Projects
Campus Crew student platform
Built a React and Node.js API for student communities.
Internships
Web Developer Intern at Example Labs
Education
B.Tech Computer Science - Chandigarh University
Achievements & Certifications
Certified in Python for AI.
Solved 150+ coding challenges.
Portfolio
https://github.com/ava/example`;
  const profile = extractProfile(sample);
  assert.equal(profile.profileVersion, 2);
  assert.equal(profile.location, 'Chandigarh, India');
  assert.equal(profile.name, 'Ava Patel');
  assert.ok(profile.skills.includes('React'));
  assert.ok(profile.skills.includes('Express'));
  assert.ok(profile.projects.some(s => s.includes('Campus Crew')));
  assert.ok(profile.internships.some(s => s.includes('Example Labs')));
  assert.ok(profile.certifications.some(s => s.includes('Python')));
  assert.ok(profile.achievements.some(s => s.includes('150+')));
  assert.ok(profile.links.some(s => s.includes('github.com/ava/example')));
});

test('v2 does not fabricate missing personal details or professional history', () => {
  const p = extractProfile('Uma Shah\numa@example.com\nReact and JavaScript web applications.\nB.Tech Computer Science');
  assert.equal(p.location, '');
  assert.equal(p.yearsExperience, null);
  assert.equal(p.projects.length, 0);
  assert.equal(p.internships.length, 0);
  assert.equal(p.certifications.length, 0);
});
