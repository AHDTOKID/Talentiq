import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, X, AlertCircle, ChevronRight, Clock3, SlidersHorizontal, ShieldCheck, ClipboardList, Sparkles, BriefcaseBusiness, Info } from 'lucide-react';
import { api, downloadProtected } from './api';
import { useAuth } from './context/AuthContext';
import TopBar from './components/TopBar';
import ReqHeader from './components/ReqHeader';
import Metrics from './components/Metrics';
import CandidateList from './components/CandidateList';
import Dossier from './components/Dossier';
import CriteriaBreakdown from './components/CriteriaBreakdown';
import Synthesis from './components/Synthesis';
import ResumeInspector from './components/ResumeInspector';
import DecisionBar from './components/DecisionBar';
import DecisionDialog from './components/DecisionDialog';
import Toast from './components/Toast';
import Login from './components/Login';
import WorkspacePage from './pages/WorkspacePage';
import RecruitmentPage from './pages/RecruitmentPage';
import { fmtDate } from './utils';

const newRoleDefault = () => ({ title: '', code: `REQ-${Math.floor(Date.now() / 1000)}`, department: 'Engineering', location: 'Hybrid', targetHires: 1, hiringManager: '', description: '', rubricPreset: 'mern' });
const exampleCriteria = [
  { key: 'technical', label: 'Technical Stack Competency', weight: 35, keywords: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'GraphQL'] },
  { key: 'seniority', label: 'Seniority & Scale Experience', weight: 25, keywords: ['lead', 'architecture', 'scale', 'distributed'] },
  { key: 'domain', label: 'Industry & Domain Fit', weight: 20, keywords: ['payment', 'fintech', 'ledger', 'banking'] },
  { key: 'reliability', label: 'Reliability & Architecture', weight: 20, keywords: ['reliability', 'testing', 'monitoring', 'microservices'] }
];


const mernCriteria = [
  { key: 'mern_stack', label: 'MERN Stack', weight: 45, keywords: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'] },
  { key: 'projects', label: 'Practical Project Evidence', weight: 25, keywords: ['project', 'built', 'developed', 'deployed'] },
  { key: 'engineering', label: 'Software Engineering Practices', weight: 20, keywords: ['REST API', 'Git', 'database', 'testing'] },
  { key: 'delivery', label: 'Application Delivery', weight: 10, keywords: ['authentication', 'deployment', 'team', 'documentation'] }
];
const editableRubric = criteria => criteria.map(c => ({ ...c, keywordsText: c.keywords.join(', ') }));

function ModalShell({ title, subtitle, onClose, children, footer, wide = false }) {
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className={`modal ${wide ? 'wide-modal' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
    <div className="modal-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
    <div className="modal-body">{children}</div>{footer && <div className="modal-foot">{footer}</div>}
  </div></div>;
}

export default function App() {
  const { user, checking, signOut } = useAuth();
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('score');
  const [search, setSearch] = useState('');
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [copying, setCopying] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [roleModal, setRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState(newRoleDefault);
  const [rubricOpen, setRubricOpen] = useState(false);
  const [rubric, setRubric] = useState([]);
  const [decision, setDecision] = useState(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditEvents, setAuditEvents] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState('');
  const [activePage, setActivePage] = useState('screening');
  const alert = useCallback((message, type = 'success') => setNotice({ message, type, id: Date.now() }), []);
  const closeToast = useCallback(() => setNotice(null), []);
  const canEdit = user?.role === 'admin' || user?.role === 'recruiter';
  const role = roles.find(r => r._id === roleId);

  const refresh = useCallback(() => setRefreshVersion(v => v + 1), []);
  const loadRoles = useCallback(async () => {
    try {
      const { requisitions } = await api('/requisitions');
      setRoles(requisitions);
      setRoleId(current => requisitions.some(r => r._id === current) ? current : requisitions[0]?._id || '');
      setError('');
    } catch (err) { setError(err.message); }
    finally { setLoadingRoles(false); }
  }, []);
  useEffect(() => { if (user) loadRoles(); }, [user, loadRoles]);
  useEffect(() => {
    if (!roleId || !user) { setCandidates([]); setMetrics(null); setSelectedId(null); return; }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoadingList(true);
      try {
        const qs = new URLSearchParams({ requisitionId: roleId, filter, search, sort });
        const [list, summary] = await Promise.all([
          api(`/candidates?${qs}`, { signal: ctrl.signal }),
          api(`/requisitions/${roleId}/metrics`, { signal: ctrl.signal })
        ]);
        if (ctrl.signal.aborted) return;
        setCandidates(list.candidates);
        setMetrics(summary.metrics);
        setSelectedId(old => list.candidates.some(c => c._id === old) ? old : list.candidates[0]?._id || null);
      } catch (err) { if (err.name !== 'AbortError' && !ctrl.signal.aborted) { alert(err.message, 'error'); setCandidates([]); setSelectedId(null); } }
      finally { if (!ctrl.signal.aborted) setLoadingList(false); }
    }, search ? 260 : 0);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [roleId, filter, sort, search, refreshVersion, user, alert]);
  useEffect(() => {
    if (!selectedId) { setCandidate(null); return; }
    const ctrl = new AbortController();
    setCandidate(null);
    api(`/candidates/${selectedId}`, { signal: ctrl.signal }).then(d => { if (!ctrl.signal.aborted) setCandidate(d.candidate); })
      .catch(err => { if (err.name !== 'AbortError') alert(err.message, 'error'); });
    return () => ctrl.abort();
  }, [selectedId, refreshVersion, alert]);

  const openRubric = () => { setRubric(editableRubric(role?.criteria || exampleCriteria)); setRubricOpen(true); };
  const saveRubric = async () => {
    const weights = rubric.reduce((n, c) => n + Number(c.weight || 0), 0);
    if (weights !== 100) return alert('Rubric weights must total exactly 100%.', 'error');
    setSaving(true);
    try {
      const criteria = rubric.map(({ keywordsText, ...c }) => ({ ...c, weight: Number(c.weight), keywords: keywordsText.split(',').map(x => x.trim()).filter(Boolean) }));
      await api(`/requisitions/${roleId}`, { method: 'PATCH', body: { criteria } });
      await loadRoles(); refresh(); setRubricOpen(false); alert('Rubric saved; candidate scores recalculated.');
    } catch (err) { alert(err.message, 'error'); } finally { setSaving(false); }
  };
  const saveRole = async () => {
    if (!roleForm.title.trim() || !roleForm.code.trim()) return alert('Enter a job title and requisition code.', 'error');
    setSaving(true);
    try {
      const { rubricPreset, ...roleFields } = roleForm;
      const result = await api('/requisitions', { method: 'POST', body: { ...roleFields, criteria: rubricPreset === 'mern' ? mernCriteria : exampleCriteria } });
      await loadRoles(); setRoleId(result.requisition._id); setRoleModal(false); setFilter('all'); setSearch(''); refresh();
      alert('New requisition created. Start uploading candidates.');
    } catch (err) { alert(err.message, 'error'); } finally { setSaving(false); }
  };
  const reanalyzeCandidate = async () => {
    if (!candidate?._id || reanalyzing) return;
    setReanalyzing(true);
    try {
      const result = await api(`/candidates/${candidate._id}/reanalyze`, { method: 'POST' });
      setCandidate(result.candidate);
      refresh();
      alert('Resume sections and job-specific scoring updated.');
    } catch (err) { alert(err.message, 'error'); }
    finally { setReanalyzing(false); }
  };
  const copyCandidateToRole = async targetRoleId => {
    if (!candidate?._id || !targetRoleId || copying) return;
    setCopying(true);
    try {
      const result = await api(`/candidates/${candidate._id}/copy-to-role`, {
        method: 'POST', body: { requisitionId: targetRoleId }
      });
      setRoleId(targetRoleId);
      setFilter('all'); setSearch(''); setSelectedId(result.candidate._id);
      refresh();
      alert('Created a new application and recalculated the match for the selected role.');
    } catch (err) { alert(err.message, 'error'); }
    finally { setCopying(false); }
  };
  const saveDecision = async (status, note) => {
    setSaving(true);
    try {
      await api(`/decisions/${candidate._id}`, { method: 'PATCH', body: { status, note } });
      setDecision(null); refresh(); alert('Decision saved to the audit history.');
    } catch (err) { alert(err.message, 'error'); } finally { setSaving(false); }
  };
  const exportList = async () => {
    setExporting(true);
    try { await downloadProtected(`/requisitions/${roleId}/export`, `${role?.code || 'talentiq'}-shortlist.csv`); alert('Shortlist exported as CSV.'); }
    catch (err) { alert(err.message, 'error'); }
    finally { setExporting(false); }
  };
  const showAudit = async () => {
    setAuditOpen(true);
    try { const { events } = await api(`/decisions/audit${roleId ? `?requisitionId=${roleId}` : ''}`); setAuditEvents(events); }
    catch (err) { alert(err.message, 'error'); }
  };
  const handleSelectRole = id => { setRoleId(id); setFilter('all'); setSearch(''); setCandidate(null); };

  if (checking) return <div className="app-loading"><div className="brand-mark"><Sparkles size={23}/></div><div className="spinner"/>Securing your workspace…</div>;
  if (!user) return <Login/>;
  return <div className="app-shell">
    <TopBar user={user} search={search} onSearch={setSearch} onAudit={showAudit} onLogout={signOut} activePage={activePage} onNavigate={setActivePage}/>
    {activePage === 'workspace' && <WorkspacePage user={user}/>}
    {activePage === 'recruitment' && <RecruitmentPage user={user} roles={roles} onNavigateToScreening={() => setActivePage('screening')}/>}
    {activePage === 'screening' && (loadingRoles ? <div className="center-message"><div className="spinner"/>Loading requisitions…</div>
      : error ? <div className="center-message error-center"><AlertCircle size={25}/>{error}<button className="primary-button" onClick={loadRoles}>Try again</button></div>
      : roles.length === 0 ? <main className="empty-workspace"><div className="empty-illustration"><BriefcaseBusiness size={43}/></div><h1>Build your first hiring pipeline</h1><p>Start by creating a job requisition. Then upload candidate resumes and review evidence-based match recommendations.</p>{canEdit && <button className="primary-button" onClick={() => { setRoleForm(newRoleDefault()); setRoleModal(true); }}><Plus size={17}/> Create requisition</button>}</main>
      : <main className="main-area"><ReqHeader role={role} requisitions={roles} onSelect={handleSelectRole} onNewRole={() => { setRoleForm(newRoleDefault()); setRoleModal(true); }} onRubric={openRubric} onUpload={() => setUploadOpen(true)} onExport={exportList} canEdit={canEdit} exporting={exporting}/>
        <div className="page-content"><Metrics metrics={metrics}/><div className="workspace-grid"><CandidateList candidates={candidates} metrics={metrics} selectedId={selectedId} onSelect={setSelectedId} search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} sort={sort} onSort={setSort} loading={loadingList}/>
          <div className="candidate-detail">{candidate ? <><Dossier candidate={candidate} role={role} roles={roles} canEdit={canEdit} reanalyzing={reanalyzing} onReanalyze={reanalyzeCandidate} copying={copying} onCopyToRole={copyCandidateToRole}/><CriteriaBreakdown candidate={candidate} role={role}/><Synthesis candidate={candidate}/><ResumeInspector key={candidate._id} candidate={candidate} onError={msg => alert(msg, 'error')}/><DecisionBar candidate={candidate} canEdit={canEdit} onDecide={setDecision}/></> : <div className="detail-placeholder card"><div className="placeholder-icon"><ClipboardList size={32}/></div><h2>{loadingList || selectedId ? 'Loading candidate…' : 'Select a candidate'}</h2><p>{selectedId ? 'Fetching screening details.' : 'Choose someone from the left to inspect their resume, criteria match and review actions.'}</p>{!selectedId && canEdit && <button className="primary-button" onClick={() => setUploadOpen(true)}><Plus size={16}/> Upload a resume</button>}</div>}</div>
        </div></div>
      </main>)}
    <footer className="site-footer"><div className="footer-brand"><span className="footer-logo"><Sparkles size={16}/></span><strong>Talentiq</strong><span>© 2026 Talentiq Systems · Human-led talent intelligence.</span></div><div><span><ShieldCheck size={14}/> Private recruiter workspace</span><span>Scores are advisory, not hiring decisions</span></div></footer>
    {uploadOpen && role && <UploadDialogWrapper role={role} onClose={() => setUploadOpen(false)} onSuccess={message => { refresh(); alert(message); }}/>}
    {decision && candidate && <DecisionDialog candidate={candidate} status={decision} onClose={() => setDecision(null)} saving={saving} onConfirm={saveDecision}/>}
    {roleModal && <ModalShell title="Create requisition" subtitle="Set up a new role and start screening applicants" onClose={() => setRoleModal(false)} footer={<><button className="outline-button" onClick={() => setRoleModal(false)}>Cancel</button><button className="primary-button" onClick={saveRole} disabled={saving}>{saving ? 'Creating...' : 'Create requisition'}</button></>}><div className="role-form"><label className="field-label">Job title *<input value={roleForm.title} onChange={e => setRoleForm({ ...roleForm, title: e.target.value })} placeholder="e.g. Backend Engineer"/></label><div className="form-grid-two"><label className="field-label">Requisition code *<input value={roleForm.code} onChange={e => setRoleForm({ ...roleForm, code: e.target.value })}/></label><label className="field-label">Target hires<input type="number" min="1" max="1000" value={roleForm.targetHires} onChange={e => setRoleForm({ ...roleForm, targetHires: e.target.value })}/></label><label className="field-label">Department<input value={roleForm.department} onChange={e => setRoleForm({ ...roleForm, department: e.target.value })}/></label><label className="field-label">Location<input value={roleForm.location} onChange={e => setRoleForm({ ...roleForm, location: e.target.value })}/></label></div><label className="field-label">Hiring manager<input value={roleForm.hiringManager} onChange={e => setRoleForm({ ...roleForm, hiringManager: e.target.value })}/></label><label className="field-label">Initial scoring rubric<select value={roleForm.rubricPreset} onChange={e => setRoleForm({ ...roleForm, rubricPreset: e.target.value })}><option value="mern">MERN / Full Stack Development</option><option value="standard">Senior Engineering / FinTech</option></select></label><label className="field-label">Job description<textarea rows={4} value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="What are you looking for?"/></label><p className="hint-text"><Info size={15}/> The initial rubric is your selected preset. Edit it any time using “Adjust Rubric”.</p></div></ModalShell>}
    {rubricOpen && role && <ModalShell wide title="Adjust scoring rubric" subtitle={`Edit ${role.code} · Applicant scores will be recalculated from their resumes`} onClose={() => setRubricOpen(false)} footer={<><span className={rubric.reduce((n, c) => n + Number(c.weight || 0), 0) === 100 ? 'weight-total valid' : 'weight-total'}>Total weight: {rubric.reduce((n, c) => n + Number(c.weight || 0), 0)}% / 100%</span><button className="outline-button" onClick={() => setRubricOpen(false)}>Cancel</button><button className="primary-button" disabled={saving} onClick={saveRubric}>{saving ? 'Saving...' : 'Save & Rescore'}</button></>}><p className="rubric-info"><SlidersHorizontal size={16}/> Scores are based on explicit keyword evidence and the weighting below. Keywords are separated by commas. Job descriptions and protected personal characteristics are never used to derive a secret score.</p><div className="rubric-presets"><span>Quick presets:</span><button className="soft-button" type="button" onClick={() => setRubric(editableRubric(mernCriteria))}>MERN / Software Developer</button><button className="outline-button" type="button" onClick={() => setRubric(editableRubric(exampleCriteria))}>Senior FinTech Engineer</button></div><div className="rubric-editor">{rubric.map((c, i) => <div className="rubric-row" key={c.key}><div className="rubric-row-top"><strong>{c.label}</strong><div className="rubric-weight"><input type="number" min="0" max="100" value={c.weight} onChange={e => setRubric(current => current.map((r, j) => j === i ? { ...r, weight: e.target.value } : r))}/><span>% weight</span></div></div><label>Keywords to look for<input value={c.keywordsText} onChange={e => setRubric(current => current.map((r, j) => j === i ? { ...r, keywordsText: e.target.value } : r))}/></label></div>)}</div></ModalShell>}
    {auditOpen && <ModalShell title="Recruitment activity" subtitle="Most recent changes in the selected requisition" onClose={() => setAuditOpen(false)}><div className="audit-list">{auditEvents.length ? auditEvents.map(e => <div key={e._id} className="audit-row"><span className="audit-icon"><Clock3 size={16}/></span><div><strong>{e.action.replaceAll('.', ' · ').replaceAll('_', ' ')}</strong><p>{e.candidate?.name || 'Requisition update'} · {e.actor?.name || 'Team member'}</p><small>{e.details?.to ? `${e.details.from || 'new'} → ${e.details.to} · ` : ''}{fmtDate(e.createdAt)}</small></div><ChevronRight size={15}/></div>) : <div className="audit-empty">No recent activity for this requisition.</div>}</div></ModalShell>}
    <Toast notice={notice} onClose={closeToast}/>
  </div>;
}

// Lazy import isn't needed for this small dialog; keeping it a component makes the page easy to extend.
import UploadDialog from './components/UploadDialog';
function UploadDialogWrapper(props) { return <UploadDialog {...props}/>; }
