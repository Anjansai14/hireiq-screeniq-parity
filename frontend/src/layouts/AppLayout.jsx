import React, { createContext, useContext, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import NewCourseModal from '../screens/Courses/NewCourseModal';
import { useApp } from '../context/AppContext';
import { useHQ } from '../hooks/useHQ';
import Icon from '../components/common/Icon';

const CrumbContext = createContext(() => {});

/** Screens call useCrumbs()([{label, to?}, ...]) inside an effect to set the breadcrumb trail. */
export const useCrumbs = () => useContext(CrumbContext);

export default function AppLayout() {
  const [crumbs, setCrumbs] = useState([]);
  const { newFilmOpen, closeNewFilm } = useApp();
  const { state, HQ, currentCourse } = useHQ();
  const location = useLocation();

  const isCopilotPage = location.pathname.startsWith('/copilot');
  const showCopilotDrawer = state.copilotOpen && !isCopilotPage;

  return (
    <CrumbContext.Provider value={setCrumbs}>
      <div className="shell">
        <Sidebar />
        <div className="col" style={{ minWidth: 0, minHeight: 0 }}>
          <Topbar crumbs={crumbs} />
          <div className="row" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <main className="main" data-main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
              <Outlet />
            </main>

            {/* Slide-in Copilot drawer when activated via trigger */}
            {showCopilotDrawer && (
              <aside
                style={{
                  width: 380,
                  flex: 'none',
                  borderLeft: '1px solid var(--ink-100)',
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  boxShadow: 'var(--e-1)'
                }}
              >
                <div
                  style={{
                    height: 48,
                    borderBottom: '1px solid var(--ink-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    flexShrink: 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                    <Icon name="i-spark" size={18} style={{ color: 'var(--teal-600)' }} />
                    <span>Copilot</span>
                  </div>
                  <button
                    onClick={() => HQ.set((z) => { z.copilotOpen = false; })}
                    aria-label="Close Copilot"
                    style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--ink-500)', padding: 4 }}
                  >
                    <Icon name="i-x" size={16} />
                  </button>
                </div>
                <DrawerCopilot film={currentCourse} />
              </aside>
            )}
          </div>
        </div>
      </div>

      {newFilmOpen && <NewCourseModal onClose={closeNewFilm} />}
    </CrumbContext.Provider>
  );
}

function DrawerCopilot({ film }) {
  const { state, HQ } = useHQ();
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const thread = (state.threads || [])[0] || { messages: [] };

  const handleSend = () => {
    if (!input.trim() || thinking) return;
    const q = input.trim();
    setInput('');
    HQ.set((x) => {
      if (!x.threads) x.threads = [{ id: 'th1', title: 'Main thread', messages: [] }];
      x.threads[0].messages.push({ role: 'user', text: q });
    });
    setThinking(true);
    setTimeout(() => {
      HQ.set((x) => {
        x.threads[0].messages.push({
          role: 'assistant',
          text: `Analysis for ${film?.title || 'Course'}: Enrolment metrics and source performance are currently within expected confidence boundaries. For deeper verification, inspect the Campaign Insights tab.`,
          citations: ['Course Brief · Target', 'Resolence counts · 6 Oct 08:00']
        });
      });
      setThinking(false);
    }, 1000);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div
        style={{
          padding: '8px 16px',
          background: 'var(--ink-25)',
          borderBottom: '1px solid var(--ink-100)',
          fontSize: 12,
          color: 'var(--ink-500)'
        }}
      >
        Scoped to {film?.title || 'Active course'}
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        {thread.messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '88%',
                padding: '10px 12px',
                borderRadius: 10,
                background: m.role === 'user' ? 'var(--teal-700)' : 'var(--ink-50)',
                color: m.role === 'user' ? '#fff' : 'var(--ink-900)',
                fontSize: 13,
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap'
              }}
            >
              {m.text}
            </div>
            {m.citations && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {m.citations.map((c, j) => (
                  <span
                    key={j}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'var(--teal-50)',
                      color: 'var(--teal-800)',
                      fontSize: 11
                    }}
                  >
                    <Icon name="i-link" size={11} /> {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {thinking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-500)', fontSize: 12 }}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid var(--teal-200)',
                borderTopColor: 'var(--teal-700)',
                animation: 'spin .8s linear infinite'
              }}
            />
            Analyzing signals…
          </div>
        )}
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--ink-100)', display: 'flex', gap: 8 }}>
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Copilot..."
          style={{ flex: 1, height: 36, fontSize: 13 }}
        />
        <button
          className="btn primary"
          onClick={handleSend}
          style={{ width: 36, height: 36, padding: 0, display: 'grid', placeItems: 'center' }}
        >
          <Icon name="i-send" size={16} />
        </button>
      </div>
    </div>
  );
}
