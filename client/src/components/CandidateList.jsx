import React from 'react';
import { Search, SlidersHorizontal, ArrowDownWideNarrow, UserRound, CheckCircle2, AlertTriangle, Inbox, ChevronRight } from 'lucide-react';
import { initials, scoreTone, statusLabel } from '../utils';

const filters = [['all', 'All'], ['high', 'High Match'], ['borderline', 'Potential'], ['shortlisted', 'Shortlist'], ['archive', 'Archive']];
export default function CandidateList({ candidates, metrics, selectedId, onSelect, search, onSearch, filter, onFilter, sort, onSort, loading }) {
  return <section className="candidate-panel">
    <div className="candidate-tools">
      <div className="candidate-search"><Search size={15}/><input aria-label="Filter candidates" value={search} onChange={e => onSearch(e.target.value)} placeholder="Search name, skill, company..."/></div>
      <div className="filter-row">{filters.map(([id, label]) => <button key={id} className={filter === id ? 'filter-pill active' : 'filter-pill'} onClick={() => onFilter(id)}>{label}{id === 'all' && <span>({metrics?.total ?? 0})</span>}{id === 'high' && <span>({metrics?.recommended ?? 0})</span>}</button>)}</div>
      <div className="list-toolbar"><span><SlidersHorizontal size={14}/> Candidate ranking</span><button onClick={() => onSort(sort === 'score' ? 'newest' : 'score')}><ArrowDownWideNarrow size={13}/> {sort === 'score' ? 'Best match' : 'Newest'}</button></div>
    </div>
    <div className="candidate-stack" aria-live="polite">
      {loading && <div className="candidate-empty"><div className="spinner"/>Loading candidates...</div>}
      {!loading && candidates.length === 0 && <div className="candidate-empty"><Inbox size={32}/><strong>No candidates found</strong><span>Try a different filter, or upload resumes to this role.</span></div>}
      {!loading && candidates.map(c => {
        const selected = c._id === selectedId;
        const tone = scoreTone(c.matchScore);
        return <button type="button" key={c._id} aria-pressed={selected} onClick={() => onSelect(c._id)} className={`candidate-card ${selected ? 'selected' : ''}`}>
          <div className="candidate-row-main"><span className={`candidate-avatar av-${tone}`}>{initials(c.name)}</span><div className="candidate-person"><div className="candidate-name">{c.name}{selected && <CheckCircle2 size={14} color="#059669"/>}{c.status === 'interview' && <span className="fast-tag">Interview</span>}</div><div className="candidate-subtitle">{c.currentTitle || 'Applicant'}{c.company ? ` · ${c.company}` : ''}{c.yearsExperience != null ? ` (${c.yearsExperience} yrs)` : ''}</div></div><div className="candidate-score-wrap"><span className={`score-pill ${tone}`}>{c.matchScore}%</span><small>{c.matchScore >= 85 ? 'Strong Fit' : c.matchScore >= 70 ? 'Match' : 'Review'}</small></div></div>
          <div className="skill-row">{(c.skills || []).slice(0, 5).map(s => <span key={s}>{s}</span>)}{(c.skills || []).length > 5 && <span>+{c.skills.length - 5}</span>}</div>
          <div className="candidate-foot"><span className={`candidate-foot-status ${c.status === 'rejected' ? 'bad' : ''}`}>{c.status === 'rejected' ? <AlertTriangle size={12}/> : <CheckCircle2 size={12}/>} {c.status === 'review' ? 'Awaiting hiring review' : statusLabel(c.status)}</span><span className="candidate-location">{c.location || 'Location not provided'}</span></div>
          {selected && <ChevronRight size={16} className="selected-chevron"/>}
        </button>;
      })}
    </div>
    <div className="candidate-panel-footer">Scores are advisory. Review full resumes before any decision.</div>
  </section>;
}
