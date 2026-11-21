import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = Router();
function tokenFor(user) { return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' }); }
const publicUser = user => ({ user: user.safe(), token: tokenFor(user) });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') || typeof password !== 'string' || password.length < 8)
      return res.status(400).json({ message: 'Enter a name, valid email and a password of at least 8 characters.' });
    if (await User.exists({ email: email.toLowerCase().trim() })) return res.status(409).json({ message: 'This email is already registered.' });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash: await bcrypt.hash(password, 12), role: 'recruiter' });
    res.status(201).json(publicUser(user));
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.active || !await user.comparePassword(String(req.body.password || '')))
      return res.status(401).json({ message: 'Invalid email or password.' });
    res.json(publicUser(user));
  } catch (error) { next(error); }
});
router.get('/me', auth, (req, res) => res.json({ user: req.user.safe() }));
export default router;
