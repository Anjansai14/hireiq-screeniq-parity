import React from 'react';

export default function Loader({ label = 'Loading…' }) {
  return (
    <div style={{ padding: 60, display: 'grid', placeItems: 'center', gap: 12, color: 'var(--ink-500)' }}>
      <span className="spinner dark" />
      <span>{label}</span>
    </div>
  );
}
