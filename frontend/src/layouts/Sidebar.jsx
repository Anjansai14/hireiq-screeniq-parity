import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useHQ } from '../hooks/useHQ';
import { api } from '../lib/api';

const DEFAULT_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'i-home' },
  { to: '/brief', label: 'Course brief', icon: 'i-sparkle' },
  { to: '/campaigns', label: 'Campaigns', icon: 'i-mega', badge: 'live_campaigns' },
  { to: '/copilot', label: 'Copilot', icon: 'i-chat' },
  { to: '/artifacts', label: 'Artifacts', icon: 'i-folder' }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { film, toast, options } = useApp();
  const { state } = useHQ();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [meta, setMeta] = useState({});

  const fromDb = options('nav')
    .filter((o) => o.meta && o.meta.to)
    .map((o) => ({
      to: o.meta.to,
      label: o.label,
      icon: o.meta.icon || 'i-right',
      badge: o.meta.badge
    }));
  const navItems = fromDb.length ? fromDb : DEFAULT_NAV;

  const initials = (user?.name || 'A R')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');

  // Live counts for account menu
  useEffect(() => {
    if (!open) return;
    Promise.allSettled([api.get('/ai/connectors'), api.get('/creators')]).then(([c, cr]) => {
      const conn = c.status === 'fulfilled' ? c.value : null;
      const attention = conn
        ? ['meta', 'youtube', 'youtube_oauth']
            .map((k) => conn[k])
            .filter((x) => x && ['expiring', 'expired', 'failing', 'refresh_failing'].includes(x.state))
        : (state.connectors || []).filter((x) => x.status === 'Expiring' || x.status === 'Disconnected');
      const creatorsCount =
        cr.status === 'fulfilled' && Array.isArray(cr.value)
          ? cr.value.length
          : (state.creators || []).length;
      setMeta({
        connectors: attention.length ? `${attention.length} need attention` : '',
        creators: creatorsCount ? String(creatorsCount) : ''
      });
    });
  }, [open, state.connectors, state.creators]);

  const go = (to) => () => {
    setOpen(false);
    navigate(to);
  };

  const handleSignOut = () => {
    setOpen(false);
    logout();
    navigate('/login');
    toast('Signed out');
  };

  // Live campaigns count for badge
  const liveCount = (state.campaigns || []).filter(
    (c) => (c.filmId === film?.id || c.course_id === film?.id) && c.status === 'Live'
  ).length;

  const menuItems = [
    { label: 'Connectors', icon: 'i-plug', go: go('/settings/connectors'), meta: meta.connectors },
    { label: 'Creator Bank', icon: 'i-users', go: go('/creators'), meta: meta.creators },
    { label: 'Rate card', icon: 'i-tag', go: go('/settings/ratecard') },
    { label: 'Profile', icon: 'i-user', go: go('/settings/profile') },
    { label: 'Sign out', icon: 'i-logout', color: 'var(--danger-600)', go: handleSignOut }
  ];

  return (
    <aside className="sidebar">
      {/* Brand logo */}
      <div className="brand">
        <svg width="28" height="28" viewBox="0 0 28 28">
          <use href="#logo-mark" />
        </svg>
        <span>
          Influence<span style={{ color: 'var(--teal-600)' }}>IQ</span>
        </span>
      </div>

      {/* Hire IQ Module Chip */}
      <div
        className="module-chip"
        style={{
          background: 'var(--hire-tint, #FFF7ED)',
          color: '#7A4F0F'
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            background: 'var(--hire, #B7791F)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center'
          }}
        >
          <Icon name="i-brief" size={13} />
        </span>
        Hire IQ
      </div>

      {/* Navigation items */}
      <nav className="col" style={{ gap: 2 }}>
        {navItems.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          >
            <Icon name={it.icon} size={20} />
            <span className="grow">{it.label}</span>
            {it.badge === 'live_campaigns' && liveCount > 0 && (
              <span
                className="pill"
                style={{
                  height: 20,
                  fontSize: 11,
                  background: 'var(--hire-tint, #FFF7ED)',
                  color: 'var(--hire, #B7791F)',
                  fontWeight: 600
                }}
              >
                {liveCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="grow" />

      {/* Account Profile and Menu Dropdown */}
      <div style={{ position: 'relative' }}>
        {open && (
          <>
            <div className="menu-backdrop" onClick={() => setOpen(false)} />
            <div className="menu" style={{ bottom: 'calc(100% + 6px)', left: 0, right: 0 }}>
              <div
                style={{
                  padding: '8px 10px 10px',
                  borderBottom: '1px solid var(--ink-100)',
                  marginBottom: 6
                }}
              >
                <div className="strong">{user?.name || 'Anika Rao'}</div>
                <div className="subtle">{user?.email || 'anika.rao@peopletech.com'}</div>
              </div>
              <div className="subtle" style={{ padding: '6px 10px 4px', fontWeight: 600 }}>
                Settings
              </div>
              {menuItems.map((m) => (
                <button
                  key={m.label}
                  className="menu-item"
                  style={{ color: m.color }}
                  onClick={m.go}
                >
                  <Icon name={m.icon} size={18} />
                  {m.label}
                  {m.meta && (
                    <span className="subtle" style={{ marginLeft: 'auto', fontSize: 12 }}>
                      {m.meta}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
        <button className="account-btn" onClick={() => setOpen((o) => !o)}>
          <span
            className="avatar"
            style={{
              width: 32,
              height: 32,
              background: 'var(--teal-100)',
              color: 'var(--teal-800)',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            {initials}
          </span>
          <span className="grow" style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 600, fontSize: 13 }}>
              {user?.name || 'Anika Rao'}
            </span>
            <span className="subtle" style={{ display: 'block', fontSize: 12 }}>
              {user?.title || 'Campaign manager'}
            </span>
          </span>
          <Icon name="i-settings" style={{ color: 'var(--ink-500)' }} />
        </button>
      </div>
    </aside>
  );
}
