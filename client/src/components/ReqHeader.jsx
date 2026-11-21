import React from 'react';
import { FolderKanban, ChevronDown, SlidersHorizontal, FilePlus2, ArrowLeftRight, Plus, MapPin, Users, UserRound } from 'lucide-react';

export default function ReqHeader({ requisitions, role, onSelect, onNewRole, onRubric, onUpload, onExport, canEdit, exporting }) {
  return <section className="req-header">
    <div className="req-main">
      <div className="req-label"><FolderKanban size={16}/><span>Active Requisition</span></div>
      <div className="req-content">
        <div className="req-heading-line">
          <div className="req-title-wrap"><select aria-label="Choose requisition" className="req-select" value={role?._id || ''} onChange={e => onSelect(e.target.value)}>
            {requisitions.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
          </select><ChevronDown className="req-dropdown" size={18}/></div>
          {role && <span className="req-code">{role.code}</span>}
          <span className={`req-live ${role?.status !== 'active' ? 'inactive' : ''}`}><i/>{role?.status === 'active' ? 'Live Pipeline Active' : role?.status || '—'}</span>
        </div>
        {role && <div className="req-meta"><span><Users size={13}/> Target Headcount: <strong>{role.targetHires} {role.targetHires === 1 ? 'hire' : 'hires'}</strong></span><b>·</b><span><UserRound size={13}/> Hiring Manager: <strong>{role.hiringManager || 'Unassigned'}</strong></span><b>·</b><span><MapPin size={13}/> {role.location}</span></div>}
      </div>
    </div>
    <div className="req-actions">
      {canEdit && <button className="soft-button" onClick={onNewRole}><Plus size={16}/> New Role</button>}
      {canEdit && <button className="soft-button" onClick={onRubric} disabled={!role}><SlidersHorizontal size={16}/> Adjust Rubric</button>}
      {canEdit && <button className="soft-button" onClick={onUpload} disabled={!role}><FilePlus2 size={16}/> Upload Resumes</button>}
      <button className="primary-button" disabled={!role || exporting} onClick={onExport}><ArrowLeftRight size={16}/> {exporting ? 'Exporting...' : 'Export Shortlist'}</button>
    </div>
  </section>;
}
