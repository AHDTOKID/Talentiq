import React, { useState } from 'react';
import {
  FileText, Download, GraduationCap, Braces, Link2, ShieldCheck,
  AlertTriangle, AlignLeft, BriefcaseBusiness, Award, Layers3, Trophy, BookCheck
} from 'lucide-react';
import { downloadProtected } from '../api';

function EvidenceSection({ title, icon: Icon, entries, empty = 'Not identified in the extracted text.' }) {
  return <div className="extracted-section">
    <div className="resume-section-title"><Icon size={16}/>{title}<span className="section-count">{entries?.length || 0}</span></div>
    {entries?.length ? <ul className="evidence-entries">{entries.map((entry, index) => <li key={`${index}-${entry.slice(0, 30)}`}>{entry}</li>)}</ul>
      : <p className="muted section-empty">{empty}</p>}
  </div>;
}

export default function ResumeInspector({ candidate, onError }) {
  const [tab, setTab] = useState('parsed');
  const handleDownload = async () => {
    try { await downloadProtected(`/candidates/${candidate._id}/resume`, candidate.resumeName || `${candidate.name}-resume.txt`); }
    catch (error) { onError(error.message); }
  };
  const links = candidate.links || [];
  return <section className="resume-inspector card">
    <div className="resume-toolbar">
      <div className="resume-tabs"><button type="button" className={tab === 'parsed' ? 'active' : ''} onClick={() => setTab('parsed')}>Structured Resume</button><button type="button" className={tab === 'text' ? 'active' : ''} onClick={() => setTab('text')}>Full Extracted Text</button></div>
      <div className="resume-toolbar-right"><span><ShieldCheck size={13}/> Private candidate data</span>{candidate.resumeName && <button type="button" className="download-mini" onClick={handleDownload}><Download size={14}/> Original File</button>}</div>
    </div>
    {tab === 'parsed' ? <div className="resume-content structured-resume">
      <div className="extraction-summary"><FileText size={16}/><div><strong>Information extracted from resume text</strong><p>Only explicitly detected details are displayed. Check the original document before making decisions.</p></div></div>
      {candidate.summary && <div className="extracted-section"><div className="resume-section-title"><AlignLeft size={16}/> Professional summary</div><p className="resume-summary">{candidate.summary}</p></div>}
      <div className="extracted-section"><div className="resume-section-title"><Braces size={16}/> Skills & technologies <span className="section-count">{candidate.skills?.length || 0}</span></div>
        {candidate.skills?.length ? <div className="skill-row resume-skills">{candidate.skills.map(skill => <span key={skill}>{skill}</span>)}</div> : <p className="muted section-empty">No recognizable skill terms found.</p>}
      </div>
      <div className="structured-columns">
        <EvidenceSection title="Projects" icon={Layers3} entries={candidate.projects}/>
        <EvidenceSection title="Work experience" icon={BriefcaseBusiness} entries={candidate.experience}/>
        <EvidenceSection title="Internships & training" icon={BookCheck} entries={candidate.internships}/>
        <EvidenceSection title="Education" icon={GraduationCap} entries={candidate.education}/>
        <EvidenceSection title="Certifications" icon={Award} entries={candidate.certifications}/>
        <EvidenceSection title="Achievements" icon={Trophy} entries={candidate.achievements}/>
      </div>
      {!!links.length && <div className="extracted-section"><div className="resume-section-title"><Link2 size={16}/> Portfolio & links</div><div className="extracted-links">{links.map(link => {
        const url = /^https?:\/\//i.test(link) ? link : `https://${link}`;
        return <a target="_blank" rel="noopener noreferrer" key={link} href={url}>{link}</a>;
      })}</div></div>}
      {!!candidate.parseWarnings?.length && <div className="parse-warning"><AlertTriangle size={15}/><span>{candidate.parseWarnings.join(' ')}</span></div>}
      {candidate.profileVersion < 2 && <div className="parse-warning"><AlertTriangle size={15}/><span>This candidate was analyzed with the old parser. Use Re-analyze Resume above to populate the new sections.</span></div>}
    </div> : <div className="raw-resume"><div className="raw-heading"><FileText size={17}/> Original extracted document text</div><pre>{candidate.resumeText || 'No extracted text available.'}</pre></div>}
  </section>;
}
