import React from 'react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div
      className="card card-pad"
      style={{
        margin: 32,
        borderColor: '#F2C6BF',
        background: 'var(--danger-100)',
        color: 'var(--danger-800)',
      }}
    >
      <b style={{ display: 'block', marginBottom: 4 }}>Something went wrong</b>
      <span>{message}</span>
      {onRetry && (
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-sm" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
