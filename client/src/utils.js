export function initials(name = '') { return name.split(/\s+/).slice(0, 2).map(s => s[0] || '').join('').toUpperCase() || '??'; }
export function statusLabel(status) {
  return ({ new: 'New', review: 'In review', shortlisted: 'Shortlisted', interview: 'Interview', rejected: 'Rejected' })[status] || 'New';
}
export function scoreLabel(score) { return score >= 90 ? 'Exceptional Fit' : score >= 85 ? 'Strong Fit' : score >= 70 ? 'Good Match' : score >= 60 ? 'Potential Fit' : 'Needs Review'; }
export function scoreTone(score) { return score >= 85 ? 'green' : score >= 70 ? 'blue' : 'slate'; }
export function fmtDate(date) { return date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
