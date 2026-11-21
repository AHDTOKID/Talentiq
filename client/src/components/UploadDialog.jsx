import React, { useRef, useState } from 'react';
import { X, UploadCloud, FileText, Trash2, FilePlus, CheckCircle2, AlertCircle, AlignLeft } from 'lucide-react';
import { api } from '../api';

export default function UploadDialog({ role, onClose, onSuccess }) {
  const [mode, setMode] = useState('file');
  const [files, setFiles] = useState([]);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const fileInput = useRef(null);
  const addFiles = incoming => {
    const list = [...incoming];
    const valid = list.filter(f => /\.(pdf|docx|txt)$/i.test(f.name) && f.size <= 5 * 1024 * 1024);
    if (valid.length !== list.length) setError('Only PDF, DOCX and TXT files up to 5 MB each are supported.'); else setError('');
    setFiles(current => [...current, ...valid].slice(0, 10));
    setResult(null);
  };
  const upload = async () => {
    setBusy(true); setError(''); setResult(null);
    try {
      if (mode === 'file') {
        if (!files.length) return setError('Select at least one resume.');
        const body = new FormData(); body.append('requisitionId', role._id);
        for (const file of files) body.append('resumes', file);
        const response = await api('/candidates/upload', { method: 'POST', body });
        setResult(response);
        if (response.created?.length) onSuccess(`${response.created.length} resume${response.created.length === 1 ? '' : 's'} analyzed and added.`);
        if (!response.errors?.length) onClose();
      } else {
        if (!name.trim() || !text.trim()) return setError('Enter a name and resume text.');
        await api('/candidates/manual', { method: 'POST', body: { requisitionId: role._id, name, resumeText: text } });
        onSuccess('Candidate added and screened.'); onClose();
      }
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget && !busy) onClose(); }}><div className="modal upload-dialog" role="dialog" aria-modal="true" aria-label="Upload resumes">
    <div className="modal-head"><div><h2>Import candidates</h2><p>Add resumes to <strong>{role.title}</strong></p></div><button className="icon-button" onClick={onClose} disabled={busy}><X size={19}/></button></div>
    <div className="modal-body"><div className="mode-tabs"><button className={mode === 'file' ? 'active' : ''} onClick={() => setMode('file')}><FilePlus size={16}/> Upload documents</button><button className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}><AlignLeft size={16}/> Paste resume text</button></div>
      {mode === 'file' ? <><div className={`dropzone ${drag ? 'dragging' : ''}`} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }} onClick={() => fileInput.current?.click()} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') fileInput.current?.click(); }}><input ref={fileInput} type="file" accept=".pdf,.docx,.txt" multiple hidden onChange={e => { addFiles(e.target.files); e.target.value = ''; }}/><div className="upload-icon"><UploadCloud size={28}/></div><strong>Drop resume files here, or browse</strong><span>PDF, DOCX or TXT · Up to 10 files · 5 MB each</span></div>
        {files.length > 0 && <div className="file-list">{files.map((f, i) => <div key={`${f.name}-${i}`}><FileText size={17}/><span>{f.name}<small>{(f.size / 1024).toFixed(0)} KB</small></span><button aria-label={`Remove ${f.name}`} onClick={() => setFiles(v => v.filter((_, n) => n !== i))}><Trash2 size={15}/></button></div>)}</div>}</> : <div className="manual-fields"><label className="field-label">Candidate name<input value={name} maxLength={140} onChange={e => setName(e.target.value)} placeholder="e.g. Taylor Smith"/></label><label className="field-label">Resume text<textarea rows={9} value={text} onChange={e => setText(e.target.value)} placeholder="Paste the candidate's resume text here. Skills, background, and experience will be extracted."/></label></div>}
      {error && <div className="upload-error"><AlertCircle size={16}/>{error}</div>}
      {result?.errors?.length > 0 && <div className="upload-error"><AlertCircle size={16}/><span>{result.errors.map(e => `${e.file}: ${e.message}`).join(' · ')}</span></div>}
      {result?.created?.length > 0 && <div className="upload-success"><CheckCircle2 size={16}/>{result.created.length} candidates imported.</div>}
      <p className="upload-disclaimer">Resume text and original documents are stored in MongoDB and accessible only to signed-in users. Scores are recommendations, not final hiring decisions.</p>
    </div>
    <div className="modal-foot"><button className="outline-button" onClick={onClose} disabled={busy}>Cancel</button><button className="primary-button" onClick={upload} disabled={busy || (mode === 'file' ? !files.length : !name.trim() || !text.trim())}><UploadCloud size={16}/>{busy ? 'Processing resumes...' : mode === 'file' ? `Analyze ${files.length || ''} Resume${files.length === 1 ? '' : 's'}` : 'Add & Analyze'}</button></div>
  </div></div>;
}
