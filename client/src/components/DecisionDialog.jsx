import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { statusLabel } from '../utils';

export default function DecisionDialog({ candidate, status, onClose, onConfirm, saving }) {
  const [note, setNote] = useState('');
  const needsReason = status === 'rejected';
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className="modal decision-dialog" role="dialog" aria-modal="true" aria-label="Confirm hiring decision">
    <div className="modal-head"><div><h2>{needsReason ? 'Reject candidate' : `Move to ${statusLabel(status)}`}</h2><p>{candidate.name} · {candidate.currentTitle || 'Applicant'}</p></div><button className="icon-button" onClick={onClose}><X size={19}/></button></div>
    <div className="modal-body"><div className={`notice-strip ${needsReason ? 'notice-danger' : ''}`}>{needsReason ? <ShieldAlert size={19}/> : <CheckCircle2 size={19}/>}<span>{needsReason ? 'This action changes their hiring status. Record a job-related reason and confirm after human review.' : 'This action records a recruiter decision. It does not send an email or schedule a meeting automatically.'}</span></div>
      <label className="field-label">Decision notes {needsReason ? <em>* required</em> : <small>(optional)</small>}<textarea rows={4} value={note} maxLength={2000} onChange={e => setNote(e.target.value)} placeholder="Describe evidence from the resume or interview, and next steps..."/></label>
    </div><div className="modal-foot"><button className="outline-button" onClick={onClose}>Cancel</button><button className={needsReason ? 'danger-button' : 'primary-button'} disabled={saving || (needsReason && !note.trim())} onClick={() => onConfirm(status, note)}>{saving ? 'Saving...' : 'Confirm Decision'}</button></div>
  </div></div>;
}
