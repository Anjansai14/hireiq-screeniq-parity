import React from 'react';
import { tone } from '../../utils/format';

/** Status pill badge. Color comes from the status name unless bg/fg are given. */
export default function Pill({ children, status, bg, fg, large, style = {} }) {
  const t = tone(status ?? children);
  return (
    <span
      className={'pill' + (large ? ' pill-lg' : '')}
      style={{ background: bg || t.bg, color: fg || t.fg, ...style }}
    >
      {children}
    </span>
  );
}
