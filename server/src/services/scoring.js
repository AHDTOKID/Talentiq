/**
 * Explainable, bounded job-rubric matching. This is keyword + alias evidence,
 * NOT an LLM, prediction of job performance, or autonomous hiring decision.
 * Never score protected demographic/contact information.
 */
export const DEFAULT_CRITERIA = [
  { key: 'technical', label: 'Technical Stack Competency', weight: 35,
    keywords: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'GraphQL'],
    description: 'Required programming languages, frameworks and databases' },
  { key: 'seniority', label: 'Seniority & Scale Experience', weight: 25,
    keywords: ['lead', 'architecture', 'scale', 'distributed'],
    description: 'Ownership and systems experience' },
  { key: 'domain', label: 'FinTech & Domain Fit', weight: 20,
    keywords: ['payment', 'fintech', 'ledger', 'banking'],
    description: 'Relevant product or domain experience' },
  { key: 'reliability', label: 'System Reliability & Architecture', weight: 20,
    keywords: ['reliability', 'testing', 'monitoring', 'microservices'],
    description: 'Reliability and operational practices' }
];

export const MERN_CRITERIA = [
  { key: 'mern_stack', label: 'MERN Stack', weight: 45,
    keywords: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    description: 'Full-stack web application technologies' },
  { key: 'projects', label: 'Practical Project Evidence', weight: 25,
    keywords: ['project', 'built', 'developed', 'deployed'],
    description: 'Direct resume evidence of creating and shipping software' },
  { key: 'engineering', label: 'Software Engineering Practices', weight: 20,
    keywords: ['REST API', 'Git', 'database', 'testing'],
    description: 'APIs, version control, database fundamentals and testing' },
  { key: 'delivery', label: 'Application Delivery', weight: 10,
    keywords: ['authentication', 'deployment', 'team', 'documentation'],
    description: 'Authentication, delivery, collaboration and documentation' }
];

const ALIASES = {
  'node.js': ['node.js', 'nodejs', 'node js'],
  'next.js': ['next.js', 'nextjs', 'next js'],
  'react': ['react', 'reactjs', 'react.js'],
  'express': ['express.js', 'expressjs', 'express js', 'express'],
  'javascript': ['javascript', 'java script', 'ecmascript'],
  'typescript': ['typescript', 'type script'],
  'mongodb': ['mongodb', 'mongo db'],
  'postgresql': ['postgresql', 'postgres'],
  'rest api': ['rest api', 'restful api', 'restful services', 'rest services'],
  'ci/cd': ['ci/cd', 'ci cd', 'continuous integration'],
  'graphql': ['graphql'],
  'aws': ['aws', 'amazon web services'],
  'payment': ['payment', 'payments', 'payment processing'],
  'microservices': ['microservices', 'microservice'],
  'testing': ['testing', 'tests', 'unit test', 'integration test', 'test automation'],
  'scale': ['scale', 'scaling', 'high throughput', 'high volume'],
  'lead': ['lead', 'led', 'leadership', 'mentored', 'managed'],
  'banking': ['banking', 'bank', 'financial services'],
  'ledger': ['ledger', 'reconciliation'],
  'architecture': ['architecture', 'architected', 'architectural'],
  'reliability': ['reliability', 'uptime', 'resilience', 'fault tolerance'],
  'monitoring': ['monitoring', 'observability', 'telemetry'],
  'project': ['project', 'projects'],
  'built': ['built', 'created', 'implemented'],
  'developed': ['developed', 'development', 'engineered'],
  'deployed': ['deployed', 'deployment', 'launched', 'published'],
  'git': ['git', 'version control'],
  'database': ['database', 'databases', 'dbms'],
  'documentation': ['documentation', 'documented'],
  'authentication': ['authentication', 'oauth', 'jwt', 'login system'],
  'team': ['team', 'collaborated', 'collaboration'],
  'ui/ux': ['ui/ux', 'ui ux', 'user experience', 'user interface'],
  'c++': ['c++', 'cpp'],
  'c#': ['c#', 'c sharp'],
  'machine learning': ['machine learning', 'ml'],
  'data structures': ['data structures', 'dsa'],
  'algorithms': ['algorithm', 'algorithms'],
  'figma': ['figma'],
  'accessibility': ['accessibility', 'a11y', 'wcag']
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const normalized = input => String(input || '').toLowerCase().replace(/[^a-z0-9+#./-]+/g, ' ').trim();

function aliasesFor(keyword) {
  return ALIASES[normalized(keyword)] || [String(keyword || '').trim()];
}

function patternFor(term) {
  const value = normalized(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(^|[^a-z0-9])(${value})(?=$|[^a-z0-9])`, 'i');
}

// Regexes operate on original text, retaining the punctuation of names like Node.js.
function matchTerm(text, keyword) {
  if (!keyword) return null;
  for (const alias of aliasesFor(keyword)) {
    const match = patternFor(alias).exec(String(text || ''));
    if (match) return { alias, index: match.index + match[1].length, length: match[2].length };
  }
  return null;
}

export function hasEvidence(text, keyword) {
  return Boolean(matchTerm(text, keyword));
}

export function validateCriteria(criteria) {
  if (!Array.isArray(criteria) || criteria.length === 0 || criteria.length > 8) throw new Error('Provide 1–8 rubric criteria.');
  const seen = new Set();
  const result = criteria.map((criterion, i) => {
    const key = String(criterion.key || `criterion-${i}`).trim().slice(0, 40);
    if (seen.has(key)) throw new Error('Criterion keys must be unique.');
    seen.add(key);
    const weight = Number(criterion.weight);
    if (!Number.isFinite(weight) || weight < 0 || weight > 100) throw new Error('Rubric weights must be between 0 and 100.');
    const keywords = (Array.isArray(criterion.keywords) ? criterion.keywords : String(criterion.keywords || '').split(','))
      .map(k => String(k).trim()).filter(Boolean).slice(0, 30);
    return { key, label: String(criterion.label || key).trim().slice(0, 100), weight, keywords,
      description: String(criterion.description || '').slice(0, 350) };
  });
  if (Math.abs(result.reduce((sum, row) => sum + row.weight, 0) - 100) > .001)
    throw new Error('Rubric weights must total exactly 100%.');
  return result;
}

function evidenceSources(candidate) {
  // Contact, age, name, geographic location and education are excluded from scoring.
  const sources = [
    ['Projects', candidate.projects], ['Internships', candidate.internships],
    ['Professional experience', candidate.experience], ['Certifications', candidate.certifications],
    ['Achievements', candidate.achievements], ['Skills', candidate.skills],
    ['Summary', candidate.summary]
  ];
  const indexed = sources.flatMap(([source, value]) =>
    (Array.isArray(value) ? value : [value]).filter(Boolean)
      .map(text => ({ source, text: String(text).slice(0, 1500) })));
  if (candidate.resumeText) {
    // Including the full resume preserves compatibility with previously uploaded candidates.
    indexed.push(...String(candidate.resumeText).split(/\n+/).map(x => x.trim()).filter(Boolean)
      .map(text => ({ source: 'Resume text', text: text.slice(0, 1500) })));
  }
  return indexed;
}

function findEvidence(sources, term) {
  for (const entry of sources) {
    const match = matchTerm(entry.text, term);
    if (!match) continue;
    const start = Math.max(0, match.index - 48);
    const end = Math.min(entry.text.length, match.index + match.length + 90);
    const excerpt = `${start ? '…' : ''}${entry.text.slice(start, end).trim()}${end < entry.text.length ? '…' : ''}`;
    return { term, matchedAs: match.alias, source: entry.source, excerpt };
  }
  return null;
}

export function evaluateCandidate(candidate, criteria = DEFAULT_CRITERIA) {
  const rubric = validateCriteria(criteria);
  const sources = evidenceSources(candidate);
  const breakdown = rubric.map(row => {
    const evidenceDetails = row.keywords.map(term => findEvidence(sources, term)).filter(Boolean);
    const found = evidenceDetails.map(hit => hit.term);
    const missing = row.keywords.filter(term => !found.includes(term));
    const score = row.keywords.length ? Math.round(found.length / row.keywords.length * 100) : 0;
    const evidence = evidenceDetails.length
      ? `Resume mentions ${found.join(', ')}. Open evidence snippets below to verify context.`
      : 'No explicit evidence of these rubric terms found. This does not mean the candidate lacks these skills.';
    return { key: row.key, label: row.label, weight: row.weight, score, found, missing,
      evidence, evidenceDetails };
  });
  const matchScore = Math.round(breakdown.reduce((sum, row) => sum + row.score * row.weight / 100, 0));
  const totalTerms = rubric.reduce((sum, row) => sum + row.keywords.length, 0);
  const foundCount = breakdown.reduce((sum, row) => sum + row.found.length, 0);
  const textLength = String(candidate.resumeText || '').trim().length;
  // Coverage indicates readable material and rubric evidence, NOT scoring accuracy.
  const confidence = Math.round(clamp((textLength ? Math.min(textLength / 1000, 1) * 70 : 0)
    + (totalTerms ? foundCount / totalTerms * 30 : 0), 0, 100));
  const strengths = breakdown.filter(row => row.found.length).sort((a, b) => b.score - a.score)
    .slice(0, 4).map(row => `${row.label}: resume evidence for ${row.found.slice(0, 4).join(', ')}.`);
  const gaps = breakdown.filter(row => row.missing.length).sort((a, b) => a.score - b.score)
    .slice(0, 4).map(row => `${row.label}: ${row.missing.slice(0, 3).join(', ')} not explicitly mentioned; verify in a human review.`);
  const interviewQuestions = breakdown.filter(row => row.missing.length)
    .slice(0, 3).map(row => `Can you walk us through a project involving ${row.missing.slice(0, 2).join(' and ')}? What did you personally deliver?`);
  if (!interviewQuestions.length) interviewQuestions.push('Which recent project best demonstrates your experience, and what outcomes did you achieve?');
  return { matchScore, confidence, breakdown, strengths, gaps, interviewQuestions };
}
