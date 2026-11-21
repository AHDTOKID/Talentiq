import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requisition: { type: mongoose.Schema.Types.ObjectId, ref: 'Requisition' },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  action: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

auditLogSchema.index({ requisition: 1, createdAt: -1 });
export default mongoose.model('AuditLog', auditLogSchema);
