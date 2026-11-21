import React, { useState } from 'react';
import {
  Users, FileText, TrendingUp, Bell, Calendar, CheckCircle2,
  Clock, AlertCircle, Plus, ChevronRight, Sparkles, MessageSquare,
  BookOpen, Settings, Star, Zap, BarChart3, Target
} from 'lucide-react';
import { initials } from '../utils';

const TEAM_MEMBERS = [
  { id: 1, name: 'Sarah Chen', role: 'Senior Recruiter', status: 'active', tasks: 12, avatar: 'SC' },
  { id: 2, name: 'Marcus Johnson', role: 'HR Manager', status: 'active', tasks: 8, avatar: 'MJ' },
  { id: 3, name: 'Priya Nair', role: 'Talent Acquisition', status: 'away', tasks: 5, avatar: 'PN' },
  { id: 4, name: 'Liam Torres', role: 'Recruiter', status: 'active', tasks: 15, avatar: 'LT' },
  { id: 5, name: 'Aisha Okonkwo', role: 'HR Coordinator', status: 'offline', tasks: 3, avatar: 'AO' },
];

const RECENT_ACTIVITY = [
  { id: 1, type: 'decision', message: 'Marcus advanced Priya Nair to interview round', time: '2 min ago', icon: 'check' },
  { id: 2, type: 'upload', message: 'Sarah uploaded 4 resumes for Backend Engineer', time: '18 min ago', icon: 'file' },
  { id: 3, type: 'requisition', message: 'New requisition REQ-2026-041 created by Liam', time: '1 hr ago', icon: 'plus' },
  { id: 4, type: 'decision', message: 'Aisha moved David Kim to offer stage', time: '3 hr ago', icon: 'check' },
  { id: 5, type: 'note', message: 'Sarah added a note to candidate Ana Ruiz', time: '5 hr ago', icon: 'note' },
];

const QUICK_TASKS = [
  { id: 1, title: 'Review shortlist for Data Analyst role', priority: 'high', due: 'Today', done: false },
  { id: 2, title: 'Send offer letter to James Park', priority: 'high', due: 'Today', done: false },
  { id: 3, title: 'Schedule panel interviews — DevOps lead', priority: 'medium', due: 'Tomorrow', done: false },
  { id: 4, title: 'Update hiring rubric for Product Manager', priority: 'low', due: 'Nov 22', done: true },
  { id: 5, title: 'Approve new requisition from Finance team', priority: 'medium', due: 'Nov 23', done: false },
];

const KPI_CARDS = [
  { label: 'Active Requisitions', value: '14', delta: '+2 this week', icon: FileText, color: 'blue' },
  { label: 'Total Candidates', value: '238', delta: '+31 this month', icon: Users, color: 'purple' },
  { label: 'Avg. Time-to-Screen', value: '2.4d', delta: '↓ 0.3d vs last month', icon: TrendingUp, color: 'green' },
  { label: 'Offers Extended', value: '7', delta: '3 pending response', icon: Star, color: 'amber' },
];

function statusColor(status) {
  if (status === 'active') return '#22c55e';
  if (status === 'away') return '#f59e0b';
  return '#94a3b8';
}

function priorityClass(p) {
  if (p === 'high') return 'ws-priority-high';
  if (p === 'medium') return 'ws-priority-med';
  return 'ws-priority-low';
}

function ActivityIcon({ type }) {
  if (type === 'check') return <CheckCircle2 size={15} color="#059669"/>;
  if (type === 'file') return <FileText size={15} color="#2563eb"/>;
  if (type === 'plus') return <Plus size={15} color="#7c3aed"/>;
  return <MessageSquare size={15} color="#64748b"/>;
}

export default function WorkspacePage({ user }) {
  const [tasks, setTasks] = useState(QUICK_TASKS);
  const [activeSection, setActiveSection] = useState('overview');

  const toggleTask = id => setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x));

  return (
    <div className="ws-page">
      {/* Page header */}
      <div className="ws-page-header">
        <div>
          <h1 className="ws-page-title">Workspace</h1>
          <p className="ws-page-sub">Good day, {user?.name?.split(' ')[0] || 'there'} — here's your team's hiring snapshot.</p>
        </div>
        <div className="ws-header-actions">
          <button className="outline-button"><Calendar size={15}/> Schedule</button>
          <button className="primary-button"><Plus size={15}/> New Task</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="ws-tabs">
        {['overview', 'team', 'tasks'].map(tab => (
          <button key={tab} className={`ws-tab ${activeSection === tab ? 'ws-tab-active' : ''}`}
            onClick={() => setActiveSection(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeSection === 'overview' && (
        <>
          {/* KPI Row */}
          <div className="ws-kpi-row">
            {KPI_CARDS.map(k => (
              <div key={k.label} className={`ws-kpi-card ws-kpi-${k.color}`}>
                <div className="ws-kpi-icon"><k.icon size={22}/></div>
                <div className="ws-kpi-body">
                  <div className="ws-kpi-value">{k.value}</div>
                  <div className="ws-kpi-label">{k.label}</div>
                  <div className="ws-kpi-delta">{k.delta}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Two-col layout */}
          <div className="ws-two-col">
            {/* Activity feed */}
            <div className="card ws-feed-card">
              <div className="ws-card-head">
                <span><Bell size={16}/> Recent Activity</span>
                <button className="ws-link-btn">View all <ChevronRight size={13}/></button>
              </div>
              <div className="ws-feed">
                {RECENT_ACTIVITY.map(a => (
                  <div key={a.id} className="ws-feed-item">
                    <span className="ws-feed-icon"><ActivityIcon type={a.icon}/></span>
                    <div className="ws-feed-body">
                      <p>{a.message}</p>
                      <small>{a.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="card ws-task-card">
              <div className="ws-card-head">
                <span><CheckCircle2 size={16}/> My Tasks</span>
                <span className="ws-badge">{tasks.filter(t => !t.done).length} open</span>
              </div>
              <div className="ws-task-list">
                {tasks.map(t => (
                  <label key={t.id} className={`ws-task-row ${t.done ? 'ws-task-done' : ''}`}>
                    <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)}/>
                    <div className="ws-task-body">
                      <span>{t.title}</span>
                      <div className="ws-task-meta">
                        <span className={`ws-priority-pill ${priorityClass(t.priority)}`}>{t.priority}</span>
                        <span className="ws-task-due"><Clock size={11}/> {t.due}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeSection === 'team' && (
        <div className="card ws-team-card">
          <div className="ws-card-head">
            <span><Users size={16}/> Team Members</span>
            <button className="outline-button" style={{ fontSize: 12, padding: '7px 11px' }}><Plus size={13}/> Invite</button>
          </div>
          <table className="ws-team-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th>Open Tasks</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {TEAM_MEMBERS.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className="ws-member-cell">
                      <span className="profile-bubble" style={{ width: 32, height: 32, fontSize: 11, background: '#e7eeff', color: '#2563eb' }}>{m.avatar}</span>
                      <strong>{m.name}</strong>
                    </div>
                  </td>
                  <td className="ws-role-cell">{m.role}</td>
                  <td>
                    <span className="ws-status-dot" style={{ background: statusColor(m.status) }}/>
                    <span style={{ textTransform: 'capitalize', fontSize: 12 }}>{m.status}</span>
                  </td>
                  <td><span className="ws-task-count">{m.tasks}</span></td>
                  <td><button className="ws-link-btn" style={{ fontSize: 12 }}>View <ChevronRight size={12}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSection === 'tasks' && (
        <div className="card ws-task-card" style={{ maxWidth: 760 }}>
          <div className="ws-card-head">
            <span><CheckCircle2 size={16}/> All Tasks</span>
            <button className="primary-button" style={{ fontSize: 12, padding: '7px 11px' }}><Plus size={13}/> New Task</button>
          </div>
          <div className="ws-task-list">
            {tasks.map(t => (
              <label key={t.id} className={`ws-task-row ${t.done ? 'ws-task-done' : ''}`}>
                <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)}/>
                <div className="ws-task-body">
                  <span>{t.title}</span>
                  <div className="ws-task-meta">
                    <span className={`ws-priority-pill ${priorityClass(t.priority)}`}>{t.priority}</span>
                    <span className="ws-task-due"><Clock size={11}/> {t.due}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
