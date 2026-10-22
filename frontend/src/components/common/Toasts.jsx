import React from 'react';
import { useApp } from '../../context/AppContext';
import Icon from './Icon';

export default function Toasts() {
  const { toasts = [], dismissToast } = useApp() || {};
  if (!toasts.length) return null;

  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={'toast' + (t.kind === 'error' ? ' error' : '')}>
          <Icon name={t.kind === 'error' ? 'i-alert' : 'i-check'} size={16} />
          <span>{t.text}</span>
          <button onClick={() => dismissToast && dismissToast(t.id)} aria-label="Dismiss">
            <Icon name="i-x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
