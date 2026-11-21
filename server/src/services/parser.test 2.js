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
