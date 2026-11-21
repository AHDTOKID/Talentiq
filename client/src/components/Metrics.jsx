import React from 'react';
import { Files, ScanSearch, BadgeCheck, Clock3, UsersRound } from 'lucide-react';

export default function Metrics({ metrics }) {
  const stats = [
    { title: 'Total Ingested', value: metrics?.total ?? 0, caption: 'in this role', icon: Files, tone: 'slate' },
    { title: 'Auto-Analyzed', value: metrics?.parsed ?? 0, caption: 'screened', icon: ScanSearch, tone: 'slate' },
    { title: 'Recommended (≥85%)', value: metrics?.recommended ?? 0, caption: metrics?.total ? `${Math.round(metrics.recommended / metrics.total * 100)}% yield` : 'no candidates yet', icon: BadgeCheck, tone: 'green' },
    { title: 'In Review', value: metrics?.inReview ?? 0, caption: 'active queue', icon: Clock3, tone: 'blue' },
    { title: 'Shortlisted', value: metrics?.shortlisted ?? 0, caption: 'ready to progress', icon: UsersRound, tone: 'slate' }
  ];
  return <div className="metrics"><div className="metrics-grid">{stats.map(s => <div className="metric" key={s.title}>
    <div className="metric-top"><span>{s.title}</span><s.icon size={14} className={`metric-icon-${s.tone}`}/></div>
    <div className="metric-line"><strong className={`metric-value-${s.tone}`}>{s.value}</strong><small>{s.caption}</small></div>
  </div>)}</div></div>;
}
