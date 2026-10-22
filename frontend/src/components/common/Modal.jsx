import React, { useEffect } from 'react';
import Icon from './Icon';

/** Accessible Modal dialog with backdrop click, ESC key listener, head, body, footer */
export default function Modal({ title, subtitle, width = 520, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}>
      <div className="modal" style={{ maxWidth: width }} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{subtitle}</div>}
          </div>
          {onClose && (
            <button className="icon-btn" onClick={onClose} aria-label="Close">
              <Icon name="i-x" size={18} />
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
