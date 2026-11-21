import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCandidate, hasEvidence, validateCriteria, DEFAULT_CRITERIA } from './scoring.js';

test('keyword matching respects word boundaries', () => {
  assert.equal(hasEvidence('React and Node.js', 'React'), true);
  assert.equal(hasEvidence('NodeJS service', 'Node.js'), true);
  assert.equal(hasEvidence('nonreactive systems', 'React'), false);
});
test('rubric must total 100 and keys must be unique', () => {
  assert.throws(() => validateCriteria([{ key: 'x', label: 'X', weight: 50, keywords: ['a'] }]));
  assert.equal(validateCriteria(DEFAULT_CRITERIA).length, 4);
});
test('matching produces transparent scores and candidate-specific evidence', () => {
  const expert = evaluateCandidate({ resumeText: 'TypeScript Node.js React PostgreSQL GraphQL. Led payment ledger architecture that scales and has reliability, testing, monitoring and microservices.', yearsExperience: 6 }, DEFAULT_CRITERIA);
  const novice = evaluateCandidate({ resumeText: 'HTML and CSS website with customer service.', yearsExperience: 1 }, DEFAULT_CRITERIA);
  assert.ok(expert.matchScore > novice.matchScore);
  assert.ok(expert.breakdown.every(item => typeof item.evidence === 'string'));
  assert.ok(expert.matchScore >= 0 && expert.matchScore <= 100);
});

test('MERN preset scores software developer skills and shows precise provenance', async () => {
  const { MERN_CRITERIA } = await import('./scoring.js');
  const resume = {
    resumeText: 'Projects\nBuilt and deployed React and Node.js web application with Express.js and MongoDB.\nUsed JavaScript, Git and RESTful APIs.\nCertificates: JavaScript basics.',
    projects: ['Built and deployed React and Node.js web application with Express.js and MongoDB.'],
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript']
  };
  const scored = evaluateCandidate(resume, MERN_CRITERIA);
  assert.ok(scored.matchScore >= 65, `expected a software match, received ${scored.matchScore}`);
  assert.ok(scored.breakdown[0].evidenceDetails.some(row => row.source === 'Projects'));
  assert.equal(scored.breakdown[0].found.length, 5);
});

test('different requisitions produce different scores for same resume', async () => {
  const { MERN_CRITERIA } = await import('./scoring.js');
  const candidate = { resumeText: 'JavaScript React Node.js Express MongoDB. Built a project. Developed REST API and used Git for deployments.' };
  const designRubric = [{ key: 'design', label: 'Design', weight: 100, keywords: ['Figma', 'prototype', 'design system'] }];
  assert.ok(evaluateCandidate(candidate, MERN_CRITERIA).matchScore > evaluateCandidate(candidate, designRubric).matchScore);
});
