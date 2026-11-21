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
