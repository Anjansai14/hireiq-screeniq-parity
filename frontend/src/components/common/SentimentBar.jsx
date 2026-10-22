import React from 'react';

export default function SentimentBar({ pos = 0, neu = 0, neg = 0, height = 8 }) {
  const total = (pos || 0) + (neu || 0) + (neg || 0);
  const pPos = total > 0 ? ((pos / total) * 100).toFixed(0) : 0;
  const pNeu = total > 0 ? ((neu / total) * 100).toFixed(0) : 0;
  const pNeg = total > 0 ? (100 - pPos - pNeu) : 0;

  return (
    <span
      className="bar"
      style={{ height }}
      title={`Positive: ${pos} (${pPos}%), Neutral: ${neu} (${pNeu}%), Negative: ${neg} (${pNeg}%)`}
    >
      <span style={{ width: `${pPos}%`, background: 'var(--success-600)' }} />
      <span style={{ width: `${pNeu}%`, background: 'var(--ink-300)' }} />
      <span style={{ width: `${pNeg}%`, background: 'var(--danger-600)' }} />
    </span>
  );
}
