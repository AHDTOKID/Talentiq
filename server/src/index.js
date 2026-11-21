import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import requisitionRoutes from './routes/requisitions.js';
import candidateRoutes from './routes/candidates.js';
import decisionRoutes from './routes/decisions.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(x => x.trim()) }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'talentiq-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/requisitions', requisitionRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/decisions', decisionRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5001);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
  throw new Error('Set a JWT_SECRET of at least 32 characters in server/.env');

connectDB().then(() => {
  app.listen(port, () => console.log(`Talentiq API listening on http://localhost:${port}`));
}).catch(error => { console.error(`Could not start API: ${error.message}`); process.exit(1); });
