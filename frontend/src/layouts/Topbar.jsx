import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';
import { useApp } from '../context/AppContext';
import { useHQ } from '../hooks/useHQ';
import { d } from '../utils/format';

export default function Topbar({ crumbs = [] }) {
  const { films, film, setFilmId, toast, openNewFilm, options } = useApp();
  const { state, HQ } = useHQ();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [q, setQ] = useState('');

  const pickCourse = (f) => {
    setFilmId(f.id);
    setOpen(false);
    const path = location.pathname;
    if (path.startsWith('/campaigns/')) navigate('/campaigns');
    else if (path.startsWith('/copilot/')) navigate('/copilot');
    else if (
      options('nav').some((o) => o.meta && o.meta.keep_on_film_switch && path.startsWith(o.meta.to))
    ) {
      /* stay */
    } else if (!['/campaigns', '/copilot', '/artifacts', '/creators'].some((p) => path.startsWith(p))) {
      navigate('/dashboard');
    }
    toast('Switched to ' + f.title);
  };

  const list = films.filter((f) => f.title.toLowerCase().includes(q.toLowerCase()));

  // Dynamic educational governance alerts
  const alerts = [];
  const currentFilm = film || films[0];

  if (currentFilm) {
    const ar = HQ.readiness(currentFilm);
    if (ar && ar.missing && ar.missing.length) {
      alerts.push({
        title: `${currentFilm.title} brief is missing ${ar.missing.length} required field${ar.missing.length > 1 ? 's' : ''}`,
        sub: ar.missing.map((m) => m.label).join(', '),
        to: '/brief',
        lvl: 'danger'
      });
    }

    (currentFilm.flags || []).filter((f) => f.status === 'Refused').forEach((f) => {
      alerts.push({
        title: `${f.type} flag is Refused`,
        sub: 'Create campaign is blocked until resolved',
        to: '/brief',
        lvl: 'danger'
      });
    });

    (state.campaigns || [])
      .filter((c) => (c.filmId === currentFilm.id || c.course_id === currentFilm.id) && c.status === 'Live')
      .forEach((c) => {
        const cp = (c.checkpoints || []).filter((k) => k.verdict).slice(-1)[0];
        if (cp && cp.verdict === 'Behind') {
          alerts.push({
            title: `${c.name} is Behind`,
            sub: `${cp.label} checkpoint · ${cp.note}`,
            to: `/campaigns/${c.id}/insights`,
            lvl: 'danger'
          });
        }
        (c.alerts || []).filter((a) => a.rule === 'RR-H05' && !a.dismissed).forEach((a) => {
          alerts.push({
            title: 'Enrolment rate below floor',
            sub: `${c.name} · message and programme mismatch (RR-H05)`,
            to: `/campaigns/${c.id}/insights`,
            lvl: 'warning'
          });
        });
      });
  }

  (state.connectors || []).filter((c) => c.status === 'Expiring').forEach((c) => {
    alerts.push({
      title: `${c.name} token expires soon`,
      sub: 'Reconnect to keep telemetry and engagement metrics flowing',
      to: '/settings/connectors',
      lvl: 'warning'
    });
  });

  const resConn = (state.connectors || []).find((c) => c.id === 'res');
  if (resConn && (resConn.status !== 'Connected' || HQ.daysBetween(resConn.last?.slice(0, 10), HQ.TODAY) > 1)) {
    alerts.push({
      title: 'Resolence feed is stale',
      sub: 'Learner registrations and enrolments may be delayed',
      to: '/settings/connectors',
      lvl: 'warning'
    });
  }

  const staleCreators = (state.creators || []).filter(
    (c) => c.status === 'Failed' || c.status === 'Partial'
  ).length;
  if (staleCreators) {
    alerts.push({
      title: `${staleCreators} source profiles need a refresh`,
      sub: 'Failed or partial enrichment in Creator Bank',
      to: '/creators?filter=attention',
      lvl: 'warning'
    });
  }

  return (
    <header className="topbar">
      {/* Course switcher */}
      <div style={{ position: 'relative' }}>
        <button className="film-btn" onClick={() => { setNotifOpen(false); setOpen((o) => !o); }}>
          <span
            className="film-mark"
            style={{
              background: 'var(--ink-900)',
              color: '#fff',
              borderRadius: 6,
              fontWeight: 600
            }}
          >
            {currentFilm ? currentFilm.title[0] : '–'}
          </span>
          <span className="grow" style={{ textAlign: 'left', minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 600, lineHeight: 1.2 }}>
              {currentFilm ? currentFilm.title : 'No course'}
            </span>
            <span className="subtle" style={{ display: 'block', lineHeight: 1.2 }}>
              {currentFilm
                ? [currentFilm.batch || 'Batch 1', currentFilm.release ? 'starts ' + d(currentFilm.release) : null]
                    .filter(Boolean)
                    .join(' · ')
                : 'Select a course'}
            </span>
          </span>
          <Icon name="i-down" style={{ color: 'var(--ink-500)' }} />
        </button>

        {open && (
          <>
            <div className="menu-backdrop" onClick={() => setOpen(false)} />
            <div className="menu" style={{ top: 'calc(100% + 6px)', left: 0, width: 320, maxHeight: 440, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '2px 2px 6px', position: 'relative', flexShrink: 0 }}>
                <Icon
                  name="i-search"
                  style={{ position: 'absolute', left: 12, top: 10, color: 'var(--ink-500)' }}
                />
                <input
                  className="input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search courses"
                  style={{ height: 32, paddingLeft: 34, fontSize: 13 }}
                  autoFocus
                />
              </div>

              <div style={{ overflowY: 'auto', flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {list.map((f) => (
                  <button
                    key={f.id}
                    className="menu-item"
                    style={{
                      minHeight: 44,
                      background: currentFilm && f.id === currentFilm.id ? 'var(--teal-50)' : undefined
                    }}
                    onClick={() => pickCourse(f)}
                  >
                    <span className="film-mark" style={{ background: 'var(--ink-900)', color: '#fff', borderRadius: 6, flexShrink: 0 }}>
                      {f.title[0]}
                    </span>
                    <span className="grow" style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.title}
                      </span>
                      <span className="subtle" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {[f.batch || 'Batch 1', f.release ? 'starts ' + d(f.release) : null]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </span>
                    </span>
                    {currentFilm && f.id === currentFilm.id && (
                      <Icon name="i-check" style={{ color: 'var(--teal-700)', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
                {!list.length && (
                  <div className="subtle" style={{ padding: 14, textAlign: 'center' }}>
                    No courses match
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: 'var(--ink-100)', margin: '6px 0', flexShrink: 0 }} />
              <button
                className="menu-item"
                style={{ color: 'var(--teal-700)', fontWeight: 600, flexShrink: 0 }}
                onClick={() => {
                  setOpen(false);
                  openNewFilm();
                }}
              >
                <Icon name="i-plus" size={18} />
                New course
              </button>
            </div>
          </>
        )}
      </div>

      {/* Dynamic breadcrumbs */}
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <span key={i} className="row" style={{ gap: 6 }}>
            <Icon name="i-right" size={14} style={{ color: 'var(--ink-400)' }} />
            {c.to ? (
              <Link to={c.to} style={{ color: 'var(--ink-500)', textDecoration: 'none' }}>
                {c.label}
              </Link>
            ) : (
              <span
                style={{
                  color: i === crumbs.length - 1 ? 'var(--ink-900)' : 'var(--ink-500)',
                  fontWeight: i === crumbs.length - 1 ? 600 : 400
                }}
              >
                {c.label}
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="grow" />

      {/* Alerts notification bell */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn"
          aria-label="Alerts"
          onClick={() => { setOpen(false); setNotifOpen((o) => !o); }}
          style={{
            position: 'relative',
            width: 36,
            height: 36,
            padding: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-600)'
          }}
        >
          <Icon name="i-bell" size={20} />
          {alerts.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                borderRadius: 999,
                background: 'var(--danger-600)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
                lineHeight: 1
              }}
            >
              {alerts.length}
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div className="menu-backdrop" onClick={() => setNotifOpen(false)} />
            <div
              className="menu"
              style={{
                top: 'calc(100% + 6px)',
                right: 0,
                width: 360,
                maxHeight: 400,
                overflowY: 'auto'
              }}
            >
              <div style={{ padding: '8px 10px', fontWeight: 600, borderBottom: '1px solid var(--ink-100)' }}>
                Needs attention ({alerts.length})
              </div>
              {alerts.map((a, idx) => (
                <button
                  key={idx}
                  className="menu-item"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '8px 10px',
                    textAlign: 'left'
                  }}
                  onClick={() => {
                    setNotifOpen(false);
                    if (a.to) navigate(a.to);
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: a.lvl === 'danger' ? 'var(--danger-50)' : 'var(--warning-50)',
                      color: a.lvl === 'danger' ? 'var(--danger-800)' : 'var(--warning-800)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: 2
                    }}
                  >
                    <Icon name="i-alert" size={14} />
                  </span>
                  <span className="grow" style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
                      {a.title}
                    </span>
                    <span className="subtle" style={{ display: 'block', fontSize: 12, lineHeight: 1.3 }}>
                      {a.sub}
                    </span>
                  </span>
                  <Icon name="i-right" size={14} style={{ color: 'var(--ink-400)', marginTop: 4 }} />
                </button>
              ))}
              {!alerts.length && (
                <div className="subtle" style={{ padding: 16, textAlign: 'center' }}>
                  All signals in range. No open alerts.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Topbar Copilot quick link */}
      <Link to="/copilot" className="btn topbar-copilot" style={{ textDecoration: 'none', color: 'var(--ink-900)' }}>
        <Icon name="i-spark" size={18} style={{ color: 'var(--teal-700)' }} />
        <span>Copilot</span>
      </Link>
    </header>
  );
}
