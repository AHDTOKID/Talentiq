/**
 * Explainable heuristic matching only. These results are decision support,
 * NOT a trained AI model or an automated employment decision.
 * Protected attributes are never included as scoring inputs.
 */
export const DEFAULT_CRITERIA = [
  { key: 'technical', label: 'Technical Stack Competency', weight: 35,
    keywords: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'GraphQL'],
    description: 'Required programming languages, frameworks, and databases' },
  { key: 'seniority', label: 'Seniority & Scale Experience', weight: 25,
    keywords: ['lead', 'architecture', 'scale', 'distributed'],
    description: 'Evidence of ownership, mentorship, systems and scale' },
  { key: 'domain', label: 'FinTech & Domain Fit', weight: 20,
    keywords: ['payment', 'fintech', 'ledger', 'banking'],
    description: 'Relevant product or domain expertise' },
  { key: 'reliability', label: 'System Reliability & Architecture', weight: 20,
    keywords: ['reliability', 'testing', 'monitoring', 'microservices'],
    description: 'Reliability, maintainability, and operational practices' }
];

const ALIASES = {
  'node.js': ['node.js', 'nodejs', 'node js'],
  'next.js': ['next.js', 'nextjs'],
  'ci cd': ['ci cd', 'continuous integration'],
  'react': ['react', 'reactjs', 'react.js'],
  'typescript': ['typescript', 'type script'],
  'postgresql': ['postgresql', 'postgres'],
  'graphql': ['graphql'],
  'aws': ['aws', 'amazon web services'],
  'payment': ['payment', 'payments', 'payment processing'],
  'microservices': ['microservices', 'microservice'],
  'testing': ['testing', 'test automation', 'unit test', 'integration test'],
  'scale': ['scale', 'scaling', 'high throughput', 'high volume'],
  'lead': ['lead', 'led', 'leadership', 'mentored', 'managed'],
  'banking': ['banking', 'bank', 'financial services'],
  'ledger': ['ledger', 'reconciliation'],
  'architecture': ['architecture', 'architected', 'architectural'],
  'reliability': ['reliability', 'uptime', 'resilience', 'fault tolerance'],
  'monitoring': ['monitoring', 'observability', 'telemetry']
};

const normalize = s => String(s || '').toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').trim();
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function hasEvidence(text, keyword) {
  const phrase = normalize(keyword);
  if (!phrase) return false;
  const terms = ALIASES[phrase] || [phrase];
  return terms.some(term => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'i').test(normalize(text));
  });
}

export function validateCriteria(criteria) {
  if (!Array.isArray(criteria) || criteria.length === 0 || criteria.length > 8) throw new Error('Provide 1–8 rubric criteria.');
  const seen = new Set();
  const normalized = criteria.map((c, i) => {
    const key = String(c.key || `criterion-${i}`).trim().slice(0, 40);
    if (seen.has(key)) throw new Error('Criterion keys must be unique.');
    seen.add(key);
    const weight = Number(c.weight);
    if (!Number.isFinite(weight) || weight < 0 || weight > 100) throw new Error('Rubric weights must be between 0 and 100.');
    const keywords = (Array.isArray(c.keywords) ? c.keywords : String(c.keywords || '').split(','))
      .map(k => String(k).trim()).filter(Boolean).slice(0, 30);
    return { key, label: String(c.label || key).trim().slice(0, 100), weight,
      keywords, description: String(c.description || '').slice(0, 350) };
  });
  if (Math.abs(normalized.reduce((sum, c) => sum + c.weight, 0) - 100) > 0.001)
    throw new Error('Rubric weights must total exactly 100%.');
  return normalized;
}

export function evaluateCandidate(candidate, criteria = DEFAULT_CRITERIA) {
  const rubric = validateCriteria(criteria);
  const text = [candidate.resumeText, (candidate.skills || []).join(' '), (candidate.education || []).join(' ')].join(' ');
  const breakdown = rubric.map(c => {
    const found = c.keywords.filter(k => hasEvidence(text, k));
    const missing = c.keywords.filter(k => !hasEvidence(text, k));
    const ratio = c.keywords.length ? found.length / c.keywords.length : 0;
    let score = Math.round(ratio * 100);
    // Experience is relevant only when the rubric is explicitly about seniority.
    if (c.key === 'seniority' && Number.isFinite(candidate.yearsExperience)) {
      const experienceScore = clamp(Math.round(candidate.yearsExperience / 5 * 100), 0, 100);
      score = c.keywords.length ? Math.round(score * .6 + experienceScore * .4) : experienceScore;
    }
    const evidence = found.length ? `Resume evidence for ${found.join(', ')}.` : 'No matching evidence found in the uploaded resume.';
    return { key: c.key, label: c.label, weight: c.weight, score, found, missing, evidence };
  });
  const matchScore = Math.round(breakdown.reduce((sum, x) => sum + x.score * x.weight / 100, 0));
  const totalTerms = rubric.reduce((sum, c) => sum + c.keywords.length, 0);
  const matchedTerms = breakdown.reduce((sum, b) => sum + b.found.length, 0);
  const textLength = String(candidate.resumeText || '').trim().length;
  // 'confidence' measures data coverage only; not predictive accuracy.
  const confidence = Math.round(clamp(30 + Math.min(textLength / 1200, 1) * 30 + (totalTerms ? matchedTerms / totalTerms : 0) * 40, 0, 100));
  const strengths = breakdown.filter(b => b.found.length).sort((a, b) => b.score - a.score)
    .slice(0, 3).map(b => `${b.label}: supporting references to ${b.found.slice(0, 4).join(', ')}.`);
  const gaps = breakdown.filter(b => b.missing.length).sort((a, b) => a.score - b.score)
    .slice(0, 3).map(b => `${b.label}: no explicit mention of ${b.missing.slice(0, 3).join(', ')}; verify during review.`);
  const interviewQuestions = breakdown.filter(b => b.missing.length)
    .slice(0, 3).map(b => `Can you describe a specific project demonstrating ${b.missing.slice(0, 2).join(' and ')}? What was your contribution and outcome?`);
  if (!interviewQuestions.length) interviewQuestions.push('Which recent project best demonstrates your relevant experience, and what outcomes did you measure?');
  return { matchScore, confidence, breakdown, strengths, gaps, interviewQuestions };
}
