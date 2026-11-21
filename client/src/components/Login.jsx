import React, { useState } from 'react';
import { Sparkles, ShieldCheck, BrainCircuit, FileSearch, LockKeyhole, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@talentiq.demo');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async e => { e.preventDefault(); setBusy(true); setError(''); try { if (mode === 'login') await signIn(email, password); else await register(name, email, password); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <div className="auth-page"><div className="auth-left"><div className="auth-brand"><span className="brand-mark"><Sparkles size={22}/></span><span>Talentiq<span className="brand-dot">.</span></span></div><div className="auth-hero"><div className="hero-kicker"><span className="hero-dot"/> THE INTELLIGENT HIRING WORKSPACE</div><h1>Find the right talent.<br/><span>With clarity.</span></h1><p>Bring every resume, role requirement, and decision into one beautifully organized screening workspace.</p><div className="feature-list"><div><FileSearch/><span><strong>Smart resume intake</strong><small>Upload PDF, DOCX or TXT, and extract key experience.</small></span></div><div><BrainCircuit/><span><strong>Explainable match scores</strong><small>Transparent scoring that puts evidence first.</small></span></div><div><ShieldCheck/><span><strong>Human-led decisions</strong><small>Structured shortlisting and a clear audit trail.</small></span></div></div></div><div className="auth-copyright">© 2026 Talentiq · Precision Talent Intelligence</div></div>
    <div className="auth-right"><div className="login-card"><div className="login-eyebrow"><LockKeyhole size={16}/> SECURE WORKSPACE</div><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="login-subtitle">{mode === 'login' ? 'Sign in to continue screening exceptional talent.' : 'Set up your recruiter workspace in seconds.'}</p><form onSubmit={submit}>
      {mode === 'register' && <label>Full name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"/></label>}
      <label>Work email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com"/></label>
      <label>Password<div className="password-field"><input required minLength={mode === 'register' ? 8 : undefined} type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"/><button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(v => !v)}>{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="login-submit" type="submit" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign in to Screening Hub' : 'Create account'}<ArrowRight size={18}/></button>
    </form><div className="auth-switch">{mode === 'login' ? 'New to Talentiq?' : 'Already have an account?'} <button onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></div>
    <div className="demo-hint"><CheckCircle2 size={16}/><span><strong>Demo available.</strong> Run <code>npm run seed</code>, then sign in with <code>admin@talentiq.demo</code> and the password from <code>server/.env</code>.</span></div>
    </div></div>
  </div>;
}
