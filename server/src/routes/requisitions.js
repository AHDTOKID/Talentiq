import { Router } from 'express';
import Requisition from '../models/Requisition.js';
import Candidate from '../models/Candidate.js';
import AuditLog from '../models/AuditLog.js';
import { auth, permit } from '../middleware/auth.js';
import { DEFAULT_CRITERIA, evaluateCandidate, validateCriteria } from '../services/scoring.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try { res.json({ requisitions: await Requisition.find().sort({ createdAt: -1 }).lean() }); }
  catch (error) { next(error); }
});

router.post('/', permit('admin', 'recruiter'), async (req, res, next) => {
  try {
    const { title, code, department, location, targetHires, hiringManager, description, criteria } = req.body;
    if (!title?.trim() || !code?.trim()) return res.status(400).json({ message: 'Job title and requisition code are required.' });
    const requisition = await Requisition.create({
      title: title.trim(), code: code.trim().toUpperCase(), department, location,
      targetHires: Number(targetHires) || 1, hiringManager, description,
      criteria: validateCriteria(criteria || DEFAULT_CRITERIA), createdBy: req.user.id
    });
    await AuditLog.create({ actor: req.user.id, requisition: requisition.id, action: 'requisition.created', details: { code: requisition.code } });
    res.status(201).json({ requisition });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const requisition = await Requisition.findById(req.params.id);
    if (!requisition) return res.status(404).json({ message: 'Requisition not found.' });
    res.json({ requisition });
  } catch (error) { next(error); }
});

router.patch('/:id', permit('admin', 'recruiter'), async (req, res, next) => {
  try {
    const requisition = await Requisition.findById(req.params.id);
    if (!requisition) return res.status(404).json({ message: 'Requisition not found.' });
    const allowed = ['title', 'department', 'location', 'targetHires', 'hiringManager', 'description', 'status'];
    for (const key of allowed) if (req.body[key] !== undefined) requisition[key] = req.body[key];
    if (req.body.criteria !== undefined) requisition.criteria = validateCriteria(req.body.criteria);
    await requisition.save();
    if (req.body.criteria !== undefined) {
      const candidates = await Candidate.find({ requisition: requisition.id });
      // Re-evaluate evidence when the role rubric changes. Decisions are untouched.
      for (const candidate of candidates) {
        Object.assign(candidate, evaluateCandidate(candidate, requisition.criteria));
        await candidate.save();
      }
    }
    await AuditLog.create({ actor: req.user.id, requisition: requisition.id, action: 'requisition.updated', details: { changed: Object.keys(req.body) } });
    res.json({ requisition });
  } catch (error) { next(error); }
});

router.get('/:id/metrics', async (req, res, next) => {
  try {
    if (!await Requisition.exists({ _id: req.params.id })) return res.status(404).json({ message: 'Requisition not found.' });
    const candidates = await Candidate.find({ requisition: req.params.id }).select('matchScore status').lean();
    const total = candidates.length;
    res.json({ metrics: {
      total, parsed: total,
      recommended: candidates.filter(c => c.matchScore >= 85).length,
      inReview: candidates.filter(c => ['new', 'review', 'interview'].includes(c.status)).length,
      rejected: candidates.filter(c => c.status === 'rejected').length,
      shortlisted: candidates.filter(c => c.status === 'shortlisted').length
    } });
  } catch (error) { next(error); }
});

function escapeCsv(value) {
  let s = String(value ?? '');
  if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}
router.get('/:id/export', async (req, res, next) => {
  try {
    const role = await Requisition.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Requisition not found.' });
    const people = await Candidate.find({ requisition: role.id, status: { $in: ['shortlisted', 'interview'] } }).sort({ matchScore: -1 }).lean();
    const rows = [['Name', 'Email', 'Score', 'Status', 'Skills', 'Decision note']];
    for (const c of people) rows.push([c.name, c.email, c.matchScore, c.status, (c.skills || []).join('; '), c.decisionNote]);
    const csv = rows.map(row => row.map(escapeCsv).join(',')).join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${role.code.replace(/[^\w-]/g, '')}-shortlist.csv"`);
    res.send('\ufeff' + csv);
  } catch (error) { next(error); }
});
export default router;
