import { Router } from 'express';
import Candidate from '../models/Candidate.js';
import AuditLog from '../models/AuditLog.js';
import { auth, permit } from '../middleware/auth.js';

const router = Router();
router.use(auth);
router.get('/audit', async (req, res, next) => {
  try {
    const filter = req.query.requisitionId ? { requisition: req.query.requisitionId } : {};
    const events = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(100)
      .populate('actor', 'name email').populate('candidate', 'name').lean();
    res.json({ events });
  } catch (error) { next(error); }
});
router.patch('/:id', permit('admin', 'recruiter'), async (req, res, next) => {
  try {
    const { status, note = '' } = req.body;
    if (!['new', 'review', 'shortlisted', 'interview', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Invalid candidate decision.' });
    if (typeof note !== 'string' || note.length > 2000)
      return res.status(400).json({ message: 'Decision note must be at most 2,000 characters.' });
    if (status === 'rejected' && !note.trim()) return res.status(400).json({ message: 'Provide a job-related reason for rejection.' });
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });
    const previous = candidate.status;
    candidate.status = status;
    candidate.decisionNote = note.trim();
    candidate.decisionAt = new Date();
    candidate.decisionBy = req.user.id;
    await candidate.save();
    await AuditLog.create({ actor: req.user.id, candidate: candidate.id, requisition: candidate.requisition,
      action: 'candidate.decision', details: { from: previous, to: status, note: candidate.decisionNote } });
    res.json({ candidate });
  } catch (error) { next(error); }
});
export default router;
