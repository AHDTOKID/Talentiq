import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ notice, onClose }) {
  useEffect(() => { if (!notice) return; const t = setTimeout(onClose, 4800); return () => clearTimeout(t); }, [notice, onClose]);
  if (!notice) return null;
  return <div className={`toast ${notice.type === 'error' ? 'toast-error' : ''}`} role="status">{notice.type === 'error' ? <AlertCircle size={19}/> : <CheckCircle2 size={19}/>}<span>{notice.message}</span><button onClick={onClose} aria-label="Dismiss notification"><X size={15}/></button></div>;
}
