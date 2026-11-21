import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'recruiter', 'reviewer'], default: 'recruiter' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.methods.comparePassword = function (password) { return bcrypt.compare(password, this.passwordHash); };
userSchema.methods.safe = function () { return { id: this.id, name: this.name, email: this.email, role: this.role }; };
export default mongoose.model('User', userSchema);
