// Number / date / status formatting utilities
export const n = (x) => {
  if (x == null || isNaN(x)) return '—';
  const a = Math.abs(x);
  if (a >= 1e7) return (x / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (a >= 1e6) return (x / 1e6).toFixed(2).replace(/0$/, '') + 'M';
  if (a >= 1e4) return Math.round(x / 1e3) + 'K';
  if (a >= 1e3) return (x / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return Number(x).toLocaleString('en-IN');
};

export const inr = (x) => (x == null ? '—' : '₹' + Math.round(x).toLocaleString('en-IN'));

export const inrL = (x) => {
  if (x == null) return '—';
  if (x >= 1e7) return '₹' + (x / 1e7).toFixed(2) + ' Cr';
  if (x >= 1e5) return '₹' + (x / 1e5).toFixed(1).replace(/\.0$/, '') + 'L';
  return inr(x);
};

const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const d = (s) => {
  if (!s) return '—';
  const [y, m, dd] = String(s).slice(0, 10).split('-');
  return m ? +dd + ' ' + MO[+m - 1] + ' ' + y : s;
};

export const ds = (s) => {
  if (!s) return '—';
  const [, m, dd] = String(s).slice(0, 10).split('-');
  return m ? +dd + ' ' + MO[+m - 1] : s;
};

export const dt = (s) => (!s ? '—' : ds(s) + (String(s).length > 10 ? ', ' + String(s).slice(11, 16) : ''));

export const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);

export const addDays = (s, k) => {
  const x = new Date(s + 'T12:00:00');
  x.setDate(x.getDate() + k);
  return x.toISOString().slice(0, 10);
};

const TONES = {
  success: ['#E6F5EC', '#14582F'],
  warning: ['#FDF3DC', '#7A4F0F'],
  danger: ['#FCE9E6', '#8A241A'],
  info: ['#E6EFFA', '#183F6E'],
  neutral: ['#EEF3F2', '#43565A'],
  teal: ['#F0FAF7', '#0F5C54'],
  hire: ['#FBF1DD', '#7A4F0F'],
};

const TMAP = {
  // Positive / Active states
  Live: 'success',
  Delivered: 'success',
  Ahead: 'success',
  'On track': 'success',
  Accepted: 'success',
  Positive: 'success',
  Pass: 'success',
  Approved: 'success',
  Cleared: 'success',
  Evidenced: 'success',
  Recorded: 'success',
  Enriched: 'success',
  Observed: 'success',

  // Informational / Pending confirmation
  Confirmed: 'info',
  Approached: 'info',
  'Content in review': 'info',
  Open: 'info',
  'Not started': 'info',
  Predicted: 'teal',
  Institutional: 'teal',

  // Caution / In progress / Warning
  Negotiating: 'warning',
  Warning: 'warning',
  Medium: 'warning',
  Inferred: 'warning',
  'Awaiting evidence': 'warning',
  'Needs attention': 'warning',
  'Needs review': 'warning',
  Partial: 'warning',
  Expiring: 'warning',
  Hold: 'warning',

  // Negative / Danger
  Behind: 'danger',
  Declined: 'danger',
  'Backed out': 'danger',
  Negative: 'danger',
  Failed: 'danger',
  Low: 'danger',
  Refused: 'danger',
  Missing: 'danger',
  Disconnected: 'danger',

  // Neutral
  Draft: 'neutral',
  Closed: 'neutral',
  Identified: 'neutral',
  Dismissed: 'neutral',
  Neutral: 'neutral',
  Upcoming: 'neutral',
  Queued: 'neutral',
  Individual: 'neutral',
  Stored: 'neutral',
  'Not required': 'neutral',
};

/** Status -> { bg, fg } colors for pills */
export const tone = (s) => {
  const key = TMAP[s] || (s && TMAP[String(s).trim()]) || 'neutral';
  const t = TONES[key] || TONES.neutral;
  return { bg: t[0], fg: t[1] };
};
