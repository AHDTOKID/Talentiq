import { Router } from 'express';
import multer from 'multer';
import Requisition from '../models/Requisition.js';
import Candidate from '../models/Candidate.js';
import AuditLog from '../models/AuditLog.js';
import { auth, permit } from '../middleware/auth.js';
import { parseResume, extractProfile, ACCEPTED_EXTENSIONS } from '../services/parser.js';
import { evaluateCandidate } from '../services/scoring.js';

const router = Router();
router.use(auth);
const upload = multer({
  storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, callback) => {
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) { const error = new Error('Only .pdf, .docx or .txt resumes are allowed.'); error.status = 400; callback(error, false); }
    else callback(null, true);
  }
});
function asyncWrap(fn) { return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next); }

router.get('/', asyncWrap(async (req, res) => {
  const { requisitionId, filter = 'all', search = '', sort = 'score' } = req.query;
  if (!requisitionId) return res.status(400).json({ message: 'requisitionId is required.' });
  const query = { requisition: requisitionId };
  if (filter === 'high') query.matchScore = { $gte: 85 };
  if (filter === 'borderline') query.matchScore = { $gte: 65, $lt: 85 };
  if (filter === 'archive') query.status = 'rejected';
  if (filter === 'shortlisted') query.status = { $in: ['shortlisted', 'interview'] };
  if (search.trim()) {
    const safe = search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [ { name: new RegExp(safe, 'i') }, { skills: new RegExp(safe, 'i') }, { currentTitle: new RegExp(safe, 'i') }, { company: new RegExp(safe, 'i') } ];
  }
  const candidates = await Candidate.find(query).select('-resumeText').sort(sort === 'newest' ? { createdAt: -1 } : { matchScore: -1, createdAt: -1 }).lean();
  res.json({ candidates });
}));

router.post('/upload', permit('admin', 'recruiter'), upload.array('resumes', 10), asyncWrap(async (req, res) => {
  const requisition = await Requisition.findById(req.body.requisitionId);
  if (!requisition) return res.status(404).json({ message: 'Choose an existing requisition.' });
  if (requisition.status !== 'active') return res.status(400).json({ message: 'Uploads require an active requisition.' });
  if (!req.files?.length) return res.status(400).json({ message: 'Select at least one PDF, DOCX or TXT file.' });
  const created = [], errors = [];
  for (const file of req.files) {
    try {
      const profile = await parseResume(file, req.files.length === 1 ? String(req.body.name || '') : '');
      const evaluation = evaluateCandidate(profile, requisition.criteria);
      const candidate = await Candidate.create({ ...profile, ...evaluation,
        requisition: requisition.id, resumeName: file.originalname, resumeMime:
          file.originalname.toLowerCase().endsWith('.pdf') ? 'application/pdf' :
          file.originalname.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain',
        resumeData: file.buffer, uploadedBy: req.user.id, source: 'upload'
      });
      await AuditLog.create({ actor: req.user.id, requisition: requisition.id, candidate: candidate.id,
        action: 'candidate.uploaded', details: { filename: file.originalname, matchScore: candidate.matchScore } });
      created.push({ id: candidate.id, name: candidate.name, matchScore: candidate.matchScore });
    } catch (error) { errors.push({ file: file.originalname, message: error.message }); }
  }
  res.status(created.length ? 201 : 422).json({ created, errors });
}));

router.post('/manual', permit('admin', 'recruiter'), asyncWrap(async (req, res) => {
  const { requisitionId, name, resumeText, currentTitle, company, location } = req.body;
  const requisition = await Requisition.findById(requisitionId);
  if (!requisition) return res.status(404).json({ message: 'Requisition not found.' });
  if (!name?.trim() || !resumeText?.trim()) return res.status(400).json({ message: 'Name and resume text are required.' });
  const profile = { ...extractProfile(resumeText, name), currentTitle: currentTitle || '', company: company || '', location: location || '' };
  const candidate = await Candidate.create({ ...profile, ...evaluateCandidate(profile, requisition.criteria), requisition: requisition.id, uploadedBy: req.user.id, source: 'manual' });
  await AuditLog.create({ actor: req.user.id, requisition: requisition.id, candidate: candidate.id, action: 'candidate.created_manual' });
  res.status(201).json({ candidate });
}));

router.get('/:id', asyncWrap(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });
  res.json({ candidate });
}));
router.get('/:id/resume', asyncWrap(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id).select('+resumeData');
  if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });
  if (!candidate.resumeData?.length) return res.status(404).json({ message: 'No original document is available for this candidate.' });
  const filename = (candidate.resumeName || 'resume').replace(/[\r\n"\\]/g, '_');
  res.set({ 'Content-Type': candidate.resumeMime || 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${filename}"`, 'X-Content-Type-Options': 'nosniff' });
  res.send(candidate.resumeData);
}));
router.delete('/:id', permit('admin'), asyncWrap(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });
  await AuditLog.create({ actor: req.user.id, requisition: candidate.requisition,
    action: 'candidate.deleted', details: { deletedCandidateId: candidate.id, name: candidate.name } });
  await candidate.deleteOne();
  res.json({ message: 'Candidate and stored resume deleted.' });
}));
export default router;
