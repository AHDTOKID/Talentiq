import React from 'react';
import { BarChart3, CircleHelp, CheckCircle2 } from 'lucide-react';

export default function CriteriaBreakdown({ candidate, role }) {
  return <section className="criteria-panel card">
    <div className="section-head"><h3><BarChart3 size={18}/> Job-specific criteria breakdown</h3><span>{role?.code} · Weighted rubric</span></div>
    <div className="criteria-grid">{(candidate.breakdown || []).map(row => <div className="criterion" key={row.key}>
      <div className="criterion-top"><strong>{row.label}</strong><span>{row.score}%</span></div>
      <div className="progress-track"><div className={row.score >= 85 ? 'progress-green' : row.score >= 65 ? 'progress-blue' : 'progress-muted'} style={{ width: `${row.score}%` }}/></div>
      <p>{row.evidence}</p>
      {!!row.found?.length && <div className="match-tags">{row.found.map(term => <span key={term}><CheckCircle2 size={11}/>{term}</span>)}</div>}
      {!!row.evidenceDetails?.length && <details className="source-evidence"><summary>View exact resume evidence ({row.evidenceDetails.length})</summary><ul>{row.evidenceDetails.map((hit, i) => <li key={`${hit.term}-${i}`}><strong>{hit.term}</strong> <small>· {hit.source}</small><blockquote>{hit.excerpt}</blockquote></li>)}</ul></details>}
      <div className="criterion-weight">Weight {row.weight}%{row.missing?.length > 0 && ` · Not explicitly found: ${row.missing.slice(0, 3).join(', ')}`}</div>
    </div>)}</div>
    <p className="method-caption"><CircleHelp size={13}/> Matching uses explicit resume terms and known aliases, not a trained AI model. Evidence snippets are candidates for human verification; missing keywords do not prove missing skills.</p>
  </section>;
}
