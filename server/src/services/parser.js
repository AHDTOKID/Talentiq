import { createRequire } from 'node:module';
import { hasEvidence } from './scoring.js';

const require = createRequire(import.meta.url);
export const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt'];
export const PROFILE_VERSION = 2;

// Explicitly mentioned terms only; these are never inferred from a degree or job title.
const SKILL_TERMS = [
  'TypeScript', 'JavaScript', 'Node.js', 'Express', 'React', 'Next.js', 'Angular', 'Vue',
  'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'GraphQL', 'REST API', 'Python', 'Java',
  'C++', 'C#', 'Go', 'Rust', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Kafka',
  'Microservices', 'Git', 'GitHub', 'CI/CD', 'Terraform', 'FastAPI', 'Django',
  'Spring Boot', 'Machine Learning', 'SQL', 'HTML', 'CSS', 'Tailwind', 'Selenium',
  'Jest', 'Redux', 'JWT', 'Firebase', 'Figma', 'UI/UX', 'Data Structures',
  'Algorithms', 'Linux', 'GitHub Actions', 'Bootstrap', 'Pandas', 'NumPy'
];

const HEADING_RULES = [
  ['summary', /^(?:professional\s+)?(?:summary|objective|about me|profile(?:\s+summary)?|career objective)$/i],
  ['skills', /^(?:(?:technical|core|professional|key)\s+)?skills(?:\s*(?:&|and)\s*(?:interests|tools|technologies))?$|^(?:technologies|technical expertise|tech stack|tools\s*(?:&|and)\s*technologies|programming languages)$/i],
  ['experience', /^(?:professional|work|employment|relevant|industry)\s+experience|work history|employment history|experience$/i],
  ['internships', /^(?:internships?|internship experience|industrial training|training experience)$/i],
  ['projects', /^(?:academic|personal|technical|major|selected|key|relevant|college)\s+projects?|projects?|project work$/i],
  ['education', /^education(?:\s*(?:&|and)\s*qualifications)?|academic(?:\s+background|\s+qualifications|\s+details)|qualifications$/i],
  ['certifications', /^(?:certifications?|licenses?\s*(?:&|and)\s*certifications?|courses?\s*(?:&|and)\s*certificates?|professional development)$/i],
  ['awardsAndCertificates', /^(?:achievements?|awards?)\s*(?:&|and)\s*(?:certifications?|certificates?)$/i],
  ['achievements', /^(?:achievements?|honou?rs?\s*(?:&|and)\s*awards?|awards?|accomplishments?|extracurricular activities)$/i],
  ['links', /^(?:links|portfolio|profiles|social links)$/i]
];

function headingFor(line) {
  const trimmed = line.replace(/^[#*\s]+/, '').replace(/[\s:–—-]+$/, '').trim();
  if (trimmed.length > 66) return null;
  for (const [section, regex] of HEADING_RULES) {
    if (regex.test(trimmed)) return { section, tail: '' };
    // Only an explicit colon introduces inline section content.
    const match = line.match(/^([^:]{2,58}):\s*(.+)$/);
    if (match && regex.test(match[1].trim())) return { section, tail: match[2].trim() };
  }
  return null;
}

function normalizeText(text) {
  return String(text || '').replace(/\r\n?/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\t\u00a0]+/g, ' ')
    .split('\n').map(line => line.trimEnd()).join('\n')
    .replace(/\n{4,}/g, '\n\n').trim().slice(0, 150000);
}

function sectionsFromText(text) {
  const sections = Object.fromEntries(HEADING_RULES.map(([name]) => [name, []]));
  let active = '';
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const heading = headingFor(line);
    if (heading) {
      active = heading.section;
      if (heading.tail) sections[active].push(heading.tail);
    } else if (active && line) {
      sections[active].push(line);
    } else if (active && !line) {
      sections[active].push('');
    }
  }
  return sections;
}

// Keep text evidence in its original form, rather than making up job titles or achievements.
function sectionEntries(lines, max = 12) {
  const entries = [];
  for (const line of lines) {
    const value = line.replace(/^[\s•●▪◦*–—-]+\s*/, '').trim();
    if (!value) continue;
    // A bullet list remains one assertion per row. Consecutive prose lines are
    // kept separate rather than incorrectly joining unrelated claims.
    if (!entries.includes(value)) entries.push(value.slice(0, 650));
    if (entries.length >= max) break;
  }
  return entries;
}

function extractName(lines, email, overrideName) {
  if (String(overrideName || '').trim()) return overrideName.trim().slice(0, 140);
  const labelled = lines.slice(0, 12).map(line => line.match(/^name\s*:\s*(.{3,90})$/i)?.[1]).find(Boolean);
  if (labelled) return labelled.trim();
  const excluded = /\b(resume|curriculum|vitae|profile|summary|developer|engineer|intern|student|phone|mail|mobile|address|india|github|linkedin|bachelor|university|college|objective|www|http|skills|portfolio|project|education|contact|technical|professional|experience)\b/i;
  const candidateLine = lines.slice(0, 10).find(line => /^[a-z][a-z.'\- ]{3,65}$/i.test(line)
    && line.trim().split(/\s+/).length <= 5 && !excluded.test(line));
  return candidateLine?.trim() || (email ? email.split('@')[0].replace(/[._-]+/g, ' ') : 'Unnamed candidate');
}

function extractPhone(text) {
  const explicit = text.match(/(?:phone|mobile|contact(?:\s+number)?|tel)\s*[:\-]\s*(\+?\d[\d() .-]{8,}\d)/i);
  if (explicit) return explicit[1].trim();
  const match = text.slice(0, 1000).match(/(?<!\d)(?:\+\d{1,3}[ -]?)?(?:\(?\d{2,4}\)?[ -]?)?\d{3,5}[ -]?\d{4,5}(?!\d)/);
  const digits = match?.[0].replace(/\D/g, '') || '';
  return digits.length >= 10 && digits.length <= 13 ? match[0].trim() : '';
}

function extractLinks(text) {
  const results = text.match(/(?:https?:\/\/|www\.|(?:github|linkedin|gitlab)\.com\/)[^\s<>"']+/gi) || [];
  return [...new Set(results.map(v => v.replace(/[),.;]+$/, '')))].slice(0, 12);
}

function experienceYears(text) {
  const match = text.match(/(?:over\s+|more than\s+)?(\d{1,2}(?:\.\d+)?)\+?\s*(?:years|yrs)\s+(?:of\s+)?(?:professional\s+|industry\s+|work\s+)?experience/i);
  return match ? Number(match[1]) : null;
}

function headlineFrom(lines) {
  return lines.slice(1, 12).find(line =>
    line.length < 110 && /\b(engineer|developer|designer|analyst|architect|intern|manager|consultant)\b/i.test(line)
    && !/^(?:experience|projects|skills|work experience|internships|certifications)\b/i.test(line)
  )?.slice(0, 120) || '';
}

function locationFrom(lines) {
  const labelled = lines.slice(0, 18).map(line => line.match(/^(?:location|address|based in|city)\s*[:\-]\s*(.{3,100})$/i)?.[1]).find(Boolean);
  return labelled ? labelled.trim().slice(0, 120) : '';
}

function companyFrom(text, currentTitle) {
  if (!currentTitle) return '';
  const match = currentTitle.match(/\s+(?:at|@)\s+([\w&.' -]{2,70})$/i);
  return match?.[1]?.trim() || '';
}

export function extractProfile(text, overrideName = '') {
  const cleaned = normalizeText(text);
  const lines = cleaned.split('\n').map(line => line.trim()).filter(Boolean);
  const sections = sectionsFromText(cleaned);
  const email = cleaned.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const education = sectionEntries(sections.education, 12);
  if (!education.length) {
    // Degree hint fallback, without scanning long body paragraphs for university names.
    education.push(...lines.filter(line => line.length <= 160 &&
      /\b(b\.?tech|b\.?e\.?|bachelor(?:'s)?|master(?:'s)?|m\.?tech|ph\.?d|b\.?sc|m\.?sc|university|college)\b/i.test(line)).slice(0, 5));
  }
  const currentTitle = headlineFrom(lines);
  const combined = sectionEntries(sections.awardsAndCertificates, 20);
  const fromCombinedCerts = combined.filter(line => /\b(certif(?:ied|ication|icate)|course|training|credential|diploma)\b/i.test(line));
  const fromCombinedAchievements = combined.filter(line => !fromCombinedCerts.includes(line));
  const warnings = [];
  if (cleaned.length < 120) warnings.push('Very little extractable text; scanned documents may require OCR.');
  if (!email) warnings.push('No email address detected.');
  if (!Object.values(sections).some(value => value.length)) warnings.push('No recognizable section headings; review the original resume.');
  const profile = {
    profileVersion: PROFILE_VERSION,
    name: extractName(lines, email, overrideName), email,
    phone: extractPhone(cleaned), location: locationFrom(lines),
    currentTitle, company: companyFrom(cleaned, currentTitle),
    yearsExperience: experienceYears(cleaned),
    links: extractLinks(cleaned),
    skills: SKILL_TERMS.filter(skill => hasEvidence(cleaned, skill)),
    summary: sectionEntries(sections.summary, 7).join(' ').slice(0, 1100),
    education,
    experience: sectionEntries(sections.experience, 20),
    internships: sectionEntries(sections.internships, 12),
    projects: sectionEntries(sections.projects, 20),
    certifications: [...new Set([...sectionEntries(sections.certifications, 15), ...fromCombinedCerts])].slice(0, 15),
    achievements: [...new Set([...sectionEntries(sections.achievements, 15), ...fromCombinedAchievements])].slice(0, 15),
    resumeText: cleaned,
    parseWarnings: warnings
  };
  return profile;
}

export async function parseResume(file, overrideName = '') {
  const extension = '.' + String(file.originalname || '').split('.').pop().toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(extension)) throw new Error('Only PDF, DOCX and TXT resumes are supported.');
  let text;
  try {
    if (extension === '.pdf') {
      if (file.buffer.subarray(0, 4).toString() !== '%PDF') throw new Error('Invalid PDF document.');
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
  if (!text?.trim()) throw new Error('No text could be extracted. Image-based PDF OCR is not included.');
  return extractProfile(text, overrideName);
}
