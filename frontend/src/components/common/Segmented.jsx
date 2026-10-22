import React from 'react';
import Icon from './Icon';

/** Segmented control: options = [{ value, label, count?, icon? }] */
export default function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={value === o.value ? 'on' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Icon name={o.icon} size={15} />}
          <span>{o.label}</span>
          {o.count != null && <span className="count">({o.count})</span>}
        </button>
      ))}
    </div>
  );
}
