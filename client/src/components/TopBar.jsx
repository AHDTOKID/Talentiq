import React, { useState } from 'react';
import { Bell, Search, ShieldCheck, LogOut, ChevronDown, Sparkles, Clock3 } from 'lucide-react';
import { initials } from '../utils';

const NAV_ITEMS = [
  { key: 'workspace', label: 'Workspace' },
  { key: 'recruitment', label: 'Recruitment' },
  { key: 'screening', label: 'Screening Hub' },
];

export default function TopBar({ user, search, onSearch, onAudit, onLogout, activePage, onNavigate }) {
  const [accountOpen, setAccountOpen] = useState(false);
  return <header className="topbar">
    <div className="topbar-inner">
      <div className="topbar-left">
        <div className="brand"><div className="brand-mark"><Sparkles size={18} strokeWidth={2.6}/></div><span>Talentiq<span className="brand-dot">.</span></span></div>
        <nav className="top-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              type="button"
              className={`nav-btn ${activePage === item.key ? 'nav-active' : 'nav-text'}`}
              onClick={() => onNavigate && onNavigate(item.key)}
              aria-current={activePage === item.key ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="topbar-right">
        <label className="global-search"><Search size={17}/><input aria-label="Search candidates" placeholder="Search candidates, skills..." value={search} onChange={e => onSearch(e.target.value)}/><kbd>⌘ K</kbd></label>
        <button className="icon-button notif-button" onClick={onAudit} aria-label="View activity log" title="Activity log"><Bell size={19}/><span className="notif-dot"/></button>
        <button className="outline-button audit-shortcut" onClick={onAudit}><Clock3 size={15}/> Activity</button>
        <div className="account-area">
          <button className="account-trigger" aria-expanded={accountOpen} onClick={() => setAccountOpen(v => !v)}><span className="profile-bubble">{initials(user?.name)}</span><span className="account-copy"><strong>{user?.name}</strong><small>{user?.role === 'admin' ? 'Administrator' : user?.role === 'reviewer' ? 'Reviewer' : 'Recruiter'}</small></span><ChevronDown size={14}/></button>
          {accountOpen && <div className="account-popover"><div className="account-detail"><strong>{user?.name}</strong><span>{user?.email}</span><small><ShieldCheck size={12}/> {user?.role}</small></div><button onClick={onLogout}><LogOut size={16}/> Sign out</button></div>}
        </div>
      </div>
    </div>
  </header>;
}
