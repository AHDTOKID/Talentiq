import React from 'react';
import { BrainCircuit, CheckCircle2, CircleHelp, MessageSquareText, Sparkles } from 'lucide-react';

export default function Synthesis({ candidate }) {
  return <section className="synthesis card"><div className="section-head synthesis-head"><div><h3><BrainCircuit size={18}/> Talentiq Screening Synthesis</h3><p>Job-specific keyword evidence notes to support recruiter review</p></div><span className="analysis-chip"><Sparkles size={12}/> Rule-based analysis</span></div>
    <div className="insight-block strengths"><h4><CheckCircle2 size={16}/> Matched terms & supporting evidence</h4>
      {(candidate.strengths?.length ? candidate.strengths : ['No criteria matched explicitly. Review the resume manually.']).map((s, i) => <div className="insight-line" key={i}><CheckCircle2 size={14}/><p>{s}</p></div>)}
    </div>
    <div className="insight-block nuances"><h4><CircleHelp size={16}/> Nuances & potential discussion areas</h4>
      {(candidate.gaps?.length ? candidate.gaps : ['The current rubric has no explicit keyword gaps in the resume text.']).map((s, i) => <p key={i}>{s}</p>)}
    </div>
    <div className="insight-block interviews"><div className="interview-head"><h4><MessageSquareText size={16}/> Suggested screen interview questions</h4><span>Tailored to role evidence</span></div>
      {(candidate.interviewQuestions || []).map((s, i) => <div className="interview-question" key={i}><strong>{i + 1}.</strong> {s}</div>)}
    </div>
  </section>;
}
