import mongoose from 'mongoose';

const criterionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  weight: { type: Number, required: true, min: 0, max: 100 },
  keywords: [{ type: String, trim: true }],
  description: { type: String, default: '' }
}, { _id: false });

const requisitionSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  department: { type: String, default: 'Engineering' },
  location: { type: String, default: 'Remote / Hybrid' },
  targetHires: { type: Number, default: 1, min: 1, max: 1000 },
  hiringManager: { type: String, default: '' },
  description: { type: String, default: '', maxlength: 10000 },
  criteria: { type: [criterionSchema], default: [] },
  status: { type: String, enum: ['active', 'paused', 'closed'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Requisition', requisitionSchema);
