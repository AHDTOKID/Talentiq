import React, { useState } from 'react';
import { MapPin, Mail, BriefcaseBusiness, BadgeCheck, ShieldCheck, Phone, Link2, RefreshCw, FileText } from 'lucide-react';
import { initials, scoreLabel, scoreTone } from '../utils';

export default function Dossier({ candidate, role, roles = [], onReanalyze, reanalyzing, onCopyToRole, copying, canEdit }) {
  const [copyTarget, setCopyTarget] = useState('');
  const otherRoles = roles.filter(item => item._id !== role?._id && item.status === 'active');
  const score = candidate.matchScore ?? 0;
  const links = candidate.links || [];
  const lowMatch = score < 65 && (candidate.skills || []).length > 0;
  return <section className="dossier card upgraded-dossier">
    <div className="dossier-layout">
      <div className="dossier-main">
        <div className={`dossier-avatar av-${scoreTone(score)}`}>{initials(candidate.name)}<span className="verified-dot" title="Resume received; identity not verified"><FileText size={12}/></span></div>
        <div className="dossier-info">
          <div className="dossier-name"><h2>{candidate.name}</h2>{score >= 85 && <span className="tier-tag">Strong rubric match</span>}{candidate.status === 'shortlisted' && <span className="status-tag">Shortlisted</span>}</div>
          <p className="dossier-position">{candidate.currentTitle || 'Candidate'}{candidate.company ? ` · ${candidate.company}` : ''}</p>
          <div className="dossier-small"><span><MapPin size={13}/>{candidate.location || 'Location not identified'}</span>{candidate.yearsExperience != null && <span><BriefcaseBusiness size={13}/>{candidate.yearsExperience} years claimed experience</span>}</div>
          <div className="dossier-links">
            {candidate.email ? <a href={`mailto:${candidate.email}`}><Mail size={13}/>{candidate.email}</a> : <span><Mail size={13}/> No email identified</span>}
            {candidate.phone && <a href={`tel:${candidate.phone.replace(/[^+\d]/g, '')}`}><Phone size={13}/>{candidate.phone}</a>}
            <span><ShieldCheck size={13}/> Human review required</span>
          </div>
          {!!links.length && <div className="profile-quick-links">{links.slice(0, 3).map(link => {
            const target = /^(https?:\/\/)/i.test(link) ? link : `https://${link}`;
            return <a href={target} key={link} rel="noopener noreferrer" target="_blank"><Link2 size={12}/>{link.replace(/^https?:\/\//i, '').slice(0, 36)}</a>;
          })}</div>}
        </div>
      </div>
      <div className="dossier-actions">
        <div className="match-quality"><div className={`match-ring ${scoreTone(score)}`} style={{ '--progress': `${score * 3.6}deg` }}><div>{score}</div></div><div><small>ROLE RUBRIC MATCH</small><strong>{scoreLabel(score)}</strong><span>Text/evidence coverage: {candidate.confidence ?? 0}%</span></div></div>
        {canEdit && <button type="button" className="reanalyze-button" onClick={onReanalyze} disabled={reanalyzing || !candidate.resumeText}><RefreshCw size={13} className={reanalyzing ? 'icon-spinning' : ''}/>{reanalyzing ? 'Analyzing…' : 'Re-analyze Resume'}</button>}
      </div>
    </div>
    {canEdit && otherRoles.length > 0 && <div className="copy-role-control"><label htmlFor="copy-role-select">Evaluate this resume for another job</label><div className="copy-role-actions"><select id="copy-role-select" value={copyTarget} onChange={e => setCopyTarget(e.target.value)}><option value="">Choose an active requisition…</option>{otherRoles.map(item => <option key={item._id} value={item._id}>{item.title}</option>)}</select><button type="button" className="soft-button" disabled={!copyTarget || copying} onClick={() => onCopyToRole(copyTarget)}>{copying ? 'Creating…' : 'Create separate application'}</button></div><small>The original application and its hiring decision will remain unchanged.</small></div>}
    <div className="dossier-footnote"><BadgeCheck size={13}/> {candidate.profileVersion >= 2 ? 'Detailed extraction ready' : 'Older extraction — click Re-analyze Resume for projects, internships and certificates'} · Compared with <strong>{role?.title || 'selected job'}</strong></div>
    {lowMatch && <div className="role-mismatch-note"><ShieldCheck size={15}/><span>Matching is job-specific. This resume lists {candidate.skills.length} recognized skills, but the rubric for <strong>{role?.title || 'this requisition'}</strong> may expect other terms. Review or change the rubric; a low score is not a rejection.</span></div>}
  </section>;
}
