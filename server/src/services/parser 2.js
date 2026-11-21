import { createRequire } from 'node:module';
import { hasEvidence } from './scoring.js';
// PDF and DOCX parsers load only for document uploads. Plain-text analysis runs without them.
const require = createRequire(import.meta.url);

export const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt'];
const SKILL_TERMS = [
  'TypeScript', 'JavaScript', 'Node.js', 'React', 'Next.js', 'Angular', 'Vue', 'PostgreSQL',
  'MongoDB', 'Redis', 'MySQL', 'GraphQL', 'REST', 'Python', 'Java', 'C++', 'Go', 'Rust',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Kafka', 'Microservices', 'Git',
  'CI/CD', 'Terraform', 'FastAPI', 'Django', 'Spring Boot', 'Machine Learning',
  'SQL', 'HTML', 'CSS', 'Tailwind', 'Selenium', 'Jest'
];

function keywordIncluded(text, keyword) { return hasEvidence(text, keyword); }

export function extractProfile(text, overrideName = '') {
  const cleaned = String(text || '').replace(/\r/g, '\n').replace(/\n{4,}/g, '\n\n').trim();
  const lines = cleaned.split('\n').map(line => line.trim()).filter(Boolean);
  const email = cleaned.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone = cleaned.match(/(?:\+?\d[\d\s().-]{8,}\d)/)?.[0] || '';
  const links = [...new Set((cleaned.match(/(?:https?:\/\/|www\.)[^\s<>]+/gi) || []).map(s => s.replace(/[,.);]+$/, '')))].slice(0, 8);
  const yearsPattern = cleaned.match(/(?:over\s+|more than\s+)?(\d{1,2}(?:\.\d)?)\+?\s*(?:years|yrs)\s+(?:of\s+)?(?:professional\s+)?experience/i);
  const yearsExperience = yearsPattern ? Number(yearsPattern[1]) : null;
  const skills = SKILL_TERMS.filter(s => keywordIncluded(cleaned, s));
  const education = lines.filter(line => /\b(b\.?tech|b\.?s\.?|bachelor|master|m\.?tech|m\.?s\.?|ph\.?d|university|college)\b/i.test(line)).slice(0, 5);
  const header = lines.find(line => /^[a-z][a-z\s.'-]{3,60}$/i.test(line) && !/^(resume|curriculum vitae|contact|summary|education|experience|profile)$/i.test(line)) || '';
  const name = overrideName.trim() || (header ? header.split(/[|–—]/)[0].trim().slice(0, 90) : '') || (email ? email.split('@')[0].replace(/[._-]+/g, ' ') : 'Unnamed candidate');
  const warnings = [];
  if (cleaned.length < 120) warnings.push('Very little extractable text. Scanned or image-only documents may require OCR.');
  if (!email) warnings.push('Email address not detected.');
  return { name, email, phone, links, yearsExperience, skills, education, resumeText: cleaned.slice(0, 150000), parseWarnings: warnings };
}

export async function parseResume(file, overrideName = '') {
  const extension = '.' + file.originalname.split('.').pop().toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(extension)) throw new Error('Only PDF, DOCX and TXT resumes are supported.');
  let text;
  try {
    if (extension === '.pdf') {
      if (file.buffer.subarray(0, 4).toString() !== '%PDF') throw new Error('Invalid PDF document.');
      // createRequire avoids pdf-parse 1.x standalone debug behavior under ESM.
      text = (await require('pdf-parse')(file.buffer)).text;
    } else if (extension === '.docx') {
      if (file.buffer[0] !== 0x50 || file.buffer[1] !== 0x4b) throw new Error('Invalid DOCX document.');
      const mammoth = (await import('mammoth')).default;
      text = (await mammoth.extractRawText({ buffer: file.buffer })).value;
    } else {
      text = file.buffer.toString('utf8');
    }
  } catch (error) {
    throw new Error(`Could not extract resume text: ${error.message}`);
  }
  if (!text?.trim()) throw new Error('No text could be extracted. Image-based PDF OCR is not included in this version.');
  return extractProfile(text, overrideName);
}
