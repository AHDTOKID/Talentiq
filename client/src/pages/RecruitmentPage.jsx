import React, { useState } from 'react';
import {
  BriefcaseBusiness, Users, TrendingUp, CheckCircle2, Clock, Plus,
  ChevronRight, Filter, ArrowRight, Star, AlertCircle, Zap,
  FileText, BarChart3, Target, Calendar, Download
} from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'applied', label: 'Applied', color: '#64748b', bg: '#f1f5f9' },
  { key: 'screening', label: 'Screening', color: '#2563eb', bg: '#eff6ff' },
  { key: 'interview', label: 'Interview', color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'offer', label: 'Offer', color: '#059669', bg: '#ecfdf5' },
  { key: 'hired', label: 'Hired', color: '#047857', bg: '#d1fae5' },
  { key: 'rejected', label: 'Rejected', color: '#dc2626', bg: '#fef2f2' },
];

const OPEN_ROLES = [
  { id: 'r1', title: 'Senior Backend Engineer', dept: 'Engineering', location: 'Hybrid', applied: 42, screening: 18, interview: 6, offer: 2, hired: 1, rejected: 15, urgent: true },
  { id: 'r2', title: 'Product Designer', dept: 'Design', location: 'Remote', applied: 28, screening: 11, interview: 4, offer: 1, hired: 0, rejected: 12, urgent: false },
  { id: 'r3', title: 'Data Analyst', dept: 'Analytics', location: 'On-site', applied: 55, screening: 20, interview: 8, offer: 0, hired: 0, rejected: 27, urgent: true },
  { id: 'r4', title: 'DevOps Lead', dept: 'Infrastructure', location: 'Hybrid', applied: 19, screening: 8, interview: 3, offer: 0, hired: 0, rejected: 8, urgent: false },
  { id: 'r5', title: 'Product Manager', dept: 'Product', location: 'Hybrid', applied: 37, screening: 14, interview: 5, offer: 2, hired: 1, rejected: 15, urgent: false },
];

const UPCOMING_INTERVIEWS = [
  { id: 1, candidate: 'James Park', role: 'Senior Backend Engineer', time: 'Today, 2:00 PM', interviewer: 'Sarah Chen', round: 'Technical' },
  { id: 2, candidate: 'Ana Ruiz', role: 'Product Designer', time: 'Today, 4:30 PM', interviewer: 'Marcus Johnson', round: 'Portfolio Review' },
  { id: 3, candidate: 'David Kim', role: 'Data Analyst', time: 'Tomorrow, 10:00 AM', interviewer: 'Priya Nair', round: 'Final' },
  { id: 4, candidate: 'Lena Weber', role: 'DevOps Lead', time: 'Tomorrow, 3:00 PM', interviewer: 'Liam Torres', round: 'Technical' },
];

const METRICS = [
  { label: 'Open Positions', value: '14', sub: 'across 6 departments', icon: BriefcaseBusiness, color: 'blue' },
  { label: 'In Pipeline', value: '181', sub: 'active candidates', icon: Users, color: 'purple' },
  { label: 'Avg. Fill Time', value: '28d', sub: '↓ 4 days vs last quarter', icon: TrendingUp, color: 'green' },
  { label: 'Offer Accept Rate', value: '82%', sub: '↑ 6% vs last quarter', icon: Star, color: 'amber' },
];

function PipelineBar({ role }) {
  const total = role.applied || 1;
  return (
    <div className="rec-pipeline-bar">
      {PIPELINE_STAGES.filter(s => s.key !== 'rejected').map(s => {
        const count = role[s.key] || 0;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={s.key} className="rec-pipeline-seg" title={`${s.label}: ${count}`}
            style={{ flex: count || 0.5, background: count ? s.bg : '#f8fafc', borderColor: count ? s.color + '33' : '#e2e8f0' }}>
            <span style={{ color: s.color, fontWeight: 700, fontSize: 13 }}>{count}</span>
            <span style={{ color: '#94a3b8', fontSize: 10 }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function RecruitmentPage({ user, roles, onNavigateToScreening, onSelectRole }) {
  const [deptFilter, setDeptFilter] = useState('All');
  const [view, setView] = useState('pipeline');

  const depts = ['All', ...Array.from(new Set(OPEN_ROLES.map(r => r.dept)))];
  const filtered = deptFilter === 'All' ? OPEN_ROLES : OPEN_ROLES.filter(r => r.dept === deptFilter);

  return (
    <div className="ws-page">
      {/* Header */}
      <div className="ws-page-header">
        <div>
          <h1 className="ws-page-title">Recruitment</h1>
          <p className="ws-page-sub">Track all open positions, candidate pipelines, and upcoming interviews.</p>
        </div>
        <div className="ws-header-actions">
          <button className="outline-button"><Download size={15}/> Export</button>
          <button className="primary-button"><Plus size={15}/> New Role</button>
        </div>
      </div>

      {/* Metrics */}
      <div className="ws-kpi-row">
        {METRICS.map(m => (
          <div key={m.label} className={`ws-kpi-card ws-kpi-${m.color}`}>
            <div className="ws-kpi-icon"><m.icon size={22}/></div>
            <div className="ws-kpi-body">
              <div className="ws-kpi-value">{m.value}</div>
              <div className="ws-kpi-label">{m.label}</div>
              <div className="ws-kpi-delta">{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* View toggle + filters */}
      <div className="rec-toolbar">
        <div className="ws-tabs" style={{ marginBottom: 0 }}>
          {['pipeline', 'table'].map(v => (
            <button key={v} className={`ws-tab ${view === v ? 'ws-tab-active' : ''}`}
              onClick={() => setView(v)}>
              {v === 'pipeline' ? 'Pipeline View' : 'Table View'}
            </button>
          ))}
        </div>
        <div className="rec-dept-filters">
          <Filter size={14} color="#64748b"/>
          {depts.map(d => (
            <button key={d} className={`rec-dept-btn ${deptFilter === d ? 'active' : ''}`}
              onClick={() => setDeptFilter(d)}>{d}</button>
          ))}
        </div>
      </div>

      {/* Pipeline view */}
      {view === 'pipeline' && (
        <div className="rec-roles-list">
          {filtered.map(role => (
            <div key={role.id} className="card rec-role-card">
              <div className="rec-role-head">
                <div className="rec-role-title-block">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 className="rec-role-title">{role.title}</h3>
                    {role.urgent && <span className="rec-urgent-tag"><Zap size={11}/> Urgent</span>}
                  </div>
                  <div className="rec-role-meta">
                    <span>{role.dept}</span>
                    <span>·</span>
                    <span>{role.location}</span>
                    <span>·</span>
                    <span>{role.applied} applicants</span>
                  </div>
                </div>
                <button className="outline-button rec-screen-btn"
                  onClick={() => onNavigateToScreening && onNavigateToScreening(role.id)}>
                  Open in Screening <ArrowRight size={14}/>
                </button>
              </div>
              <PipelineBar role={role}/>
              <div className="rec-stage-legend">
                {PIPELINE_STAGES.map(s => (
                  <span key={s.key} style={{ color: s.color, fontSize: 11 }}>
                    <span style={{ fontWeight: 700 }}>{role[s.key] || 0}</span> {s.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div className="card">
          <table className="ws-team-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Dept</th>
                <th>Location</th>
                <th>Applied</th>
                <th>Screening</th>
                <th>Interview</th>
                <th>Offer</th>
                <th>Hired</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong>{r.title}</strong>
                      {r.urgent && <span className="rec-urgent-tag" style={{ fontSize: 10 }}><Zap size={10}/> Urgent</span>}
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{r.dept}</td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{r.location}</td>
                  <td><span className="ws-task-count">{r.applied}</span></td>
                  <td><span className="ws-task-count" style={{ background: '#eff6ff', color: '#2563eb' }}>{r.screening}</span></td>
                  <td><span className="ws-task-count" style={{ background: '#f5f3ff', color: '#7c3aed' }}>{r.interview}</span></td>
                  <td><span className="ws-task-count" style={{ background: '#ecfdf5', color: '#059669' }}>{r.offer}</span></td>
                  <td><span className="ws-task-count" style={{ background: '#d1fae5', color: '#047857' }}>{r.hired}</span></td>
                  <td>
                    <button className="ws-link-btn" style={{ fontSize: 12 }}
                      onClick={() => onNavigateToScreening && onNavigateToScreening(r.id)}>
                      Screen <ChevronRight size={12}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upcoming interviews */}
      <div className="card rec-interviews-card">
        <div className="ws-card-head">
          <span><Calendar size={16}/> Upcoming Interviews</span>
          <button className="ws-link-btn">View calendar <ChevronRight size={13}/></button>
        </div>
        <div className="rec-interview-list">
          {UPCOMING_INTERVIEWS.map(iv => (
            <div key={iv.id} className="rec-interview-row">
              <div className="rec-interview-time">
                <Clock size={14} color="#64748b"/>
                <span>{iv.time}</span>
              </div>
              <div className="rec-interview-info">
                <strong>{iv.candidate}</strong>
                <span>·</span>
                <span style={{ color: '#64748b' }}>{iv.role}</span>
                <span className="rec-round-tag">{iv.round}</span>
              </div>
              <div className="rec-interview-assignee">
                <span className="profile-bubble" style={{ width: 26, height: 26, fontSize: 10, background: '#e7eeff', color: '#2563eb' }}>
                  {iv.interviewer.split(' ').map(w => w[0]).join('')}
                </span>
                <span style={{ fontSize: 12, color: '#475569' }}>{iv.interviewer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
