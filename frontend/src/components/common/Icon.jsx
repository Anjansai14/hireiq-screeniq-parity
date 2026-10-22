import React from 'react';

/** <Icon name="i-home" size={20} /> — renders an SVG symbol from the sprite. */
export default function Icon({ name, size = 16, width, height, style = {}, className = '', ...props }) {
  const href = name?.startsWith('#') ? name : '#' + (name || '');
  return (
    <svg
      width={width || size}
      height={height || size}
      style={{ flex: 'none', ...style }}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <use href={href} />
    </svg>
  );
}
