import mongoose from 'mongoose';

const evidenceDetailSchema = new mongoose.Schema({
  term: String, matchedAs: String, source: String, excerpt: String
}, { _id: false });

const breakdownSchema = new mongoose.Schema({
  key: String, label: String, score: Number, weight: Number,
  evidence: String, found: [String], missing: [String],
  evidenceDetails: [evidenceDetailSchema]
}, { _id: false });

const candidateSchema = new mongoose.Schema({
  requisition: { type: mongoose.Schema.Types.ObjectId, ref: 'Requisition', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 140 },
  email: { type: String, lowercase: true, trim: true, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  currentTitle: { type: String, default: '' },
  company: { type: String, default: '' },
  yearsExperience: { type: Number, default: null },
  profileVersion: { type: Number, default: 1 },
  summary: { type: String, default: '' },
  skills: [{ type: String }],
  education: [{ type: String }],
  experience: [{ type: String }],
  internships: [{ type: String }],
  projects: [{ type: String }],
  certifications: [{ type: String }],
  achievements: [{ type: String }],
  links: [{ type: String }],
  resumeText: { type: String, default: '' },
  resumeName: { type: String, default: '' },
  resumeMime: { type: String, default: '' },
  resumeData: { type: Buffer, select: false },
  parseWarnings: [{ type: String }],
  matchScore: { type: Number, default: 0, min: 0, max: 100 },
  confidence: { type: Number, default: 0, min: 0, max: 100 },
  breakdown: [breakdownSchema],
  strengths: [{ type: String }],
  gaps: [{ type: String }],
  interviewQuestions: [{ type: String }],
  status: { type: String, enum: ['new', 'review', 'shortlisted', 'interview', 'rejected'], default: 'new', index: true },
  decisionNote: { type: String, default: '' },
  decisionAt: { type: Date },
  decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: { type: String, enum: ['demo', 'upload', 'manual'], default: 'upload' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

candidateSchema.index({ requisition: 1, matchScore: -1 });
export default mongoose.model('Candidate', candidateSchema);
