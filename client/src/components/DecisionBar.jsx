import React from 'react';
import { XCircle, CalendarDays, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

export default function DecisionBar({ candidate, canEdit, onDecide }) {
  return <section className="decision-bar card"><div className="decision-intro"><strong>Hiring decision</strong><span>Reviewed by a human recruiter</span></div>
    <div className="decision-actions">
      {candidate.status !== 'rejected' && <button className="decision-reject" disabled={!canEdit} onClick={() => onDecide('rejected')}><XCircle size={17}/> Reject & Record Reason</button>}
      {candidate.status !== 'interview' && <button className="decision-neutral" disabled={!canEdit} onClick={() => onDecide('interview')}><CalendarDays size={17}/> Request Screening Call</button>}
      {candidate.status !== 'shortlisted' && <button className="decision-advance" disabled={!canEdit} onClick={() => onDecide('shortlisted')}><CheckCircle2 size={17}/> Advance to Shortlist <ArrowRight size={16}/></button>}
      {['rejected', 'shortlisted', 'interview'].includes(candidate.status) && <button className="decision-neutral" disabled={!canEdit} onClick={() => onDecide('review')}><RotateCcw size={16}/> Return to Review</button>}
    </div>
  </section>;
}
