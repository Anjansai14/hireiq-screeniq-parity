import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { HQ } from '../data/hireData';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);
const COURSE_KEY = 'hireiq_course';

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [films, setFilms] = useState(() => HQ.s?.films || []);
  const [filmId, setFilmIdState] = useState(() => {
    try {
      return localStorage.getItem(COURSE_KEY) || HQ.s?.filmId || null;
    } catch {
      return HQ.s?.filmId || null;
    }
  });
  const [toasts, setToasts] = useState(() => HQ.s?.toasts || []);
  const [newFilmOpen, setNewFilmOpen] = useState(false);
  const [config, setConfig] = useState({ lookups: {}, brief: { sections: [], fields: [] } });
  const seq = useRef(0);

  // Subscribe to HQ store changes for real-time synchronization
  useEffect(() => {
    const unsub = HQ.sub((state) => {
      setFilms(state.films ? [...state.films] : []);
      if (state.filmId) setFilmIdState(state.filmId);
      if (state.toasts) setToasts([...state.toasts]);
    });
    return unsub;
  }, []);

  const setFilmId = useCallback((id) => {
    setFilmIdState(id);
    try {
      localStorage.setItem(COURSE_KEY, id);
    } catch {
      // ignore in private mode
    }
    HQ.set((z) => {
      z.filmId = id;
    });
  }, []);

  const refreshFilms = useCallback(async () => {
    try {
      const list = await api.get('/courses');
      if (Array.isArray(list) && list.length > 0) {
        HQ.set((z) => {
          list.forEach((c) => {
            const ex = (z.films || []).find((f) => f.id === c.id);
            if (ex) {
              ex.title = c.title;
              ex.batch = c.batch;
              ex.release = c.batch_start || ex.release;
              ex.provider = c.provider;
              ex.readiness = c.readiness;
              if (c.target != null) ex.target = c.target;
              if (c.ceiling != null) ex.ceiling = c.ceiling;
              if (c.form) ex.form = c.form;
              if (c.form_src) ex.form_src = c.form_src;
              if (c.flags) ex.flags = c.flags;
            } else {
              z.films.push({
                id: c.id,
                title: c.title,
                batch: c.batch || 'Batch 1',
                language: 'Telugu',
                release: c.batch_start || '2026-11-16',
                provider: c.provider || 'Nexa Skills Foundation',
                target: c.target,
                ceiling: c.ceiling,
                form: c.form || {},
                form_src: c.form_src || {},
                brief: {
                  courseName: c.title,
                  courseLink: '',
                  domain: '',
                  level: 'Beginner',
                  eligibility: '',
                  stipend: '',
                  fee: '',
                  mode: '',
                  duration: ''
                },
                flags: c.flags || [],
                reads: [],
                claims: [],
                files: [],
                readiness: c.readiness
              });
            }
          });
          if (!z.films.some((f) => f.id === z.filmId)) {
            z.filmId = list[0].id;
          }
        });
        setFilms([...HQ.s.films]);
        setFilmIdState(HQ.s.filmId);
      }
      return list;
    } catch {
      return HQ.s?.films || [];
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshFilms().catch(() => {});
    api.get('/config').then(setConfig).catch(() => {});
  }, [user, refreshFilms]);

  const options = useCallback(
    (category) => config?.lookups?.[category] || [],
    [config]
  );

  const dismissToast = useCallback((id) => {
    HQ.dismissToast(id);
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (text, kind = 'ok') => {
      HQ.toast(text, kind);
      const id = ++seq.current;
      setToasts((t) => [...t, { id, text, kind }]);
      setTimeout(() => dismissToast(id), kind === 'error' ? 7000 : 4000);
    },
    [dismissToast]
  );

  const film = films.find((f) => f.id === filmId) || films[0] || null;

  return (
    <AppContext.Provider
      value={{
        films,
        film,
        filmId,
        courses: films,
        currentCourse: film,
        courseId: filmId,
        setFilmId,
        setCourseId: setFilmId,
        refreshFilms,
        refreshCourses: refreshFilms,
        config,
        options,
        newFilmOpen,
        openNewFilm: () => setNewFilmOpen(true),
        closeNewFilm: () => setNewFilmOpen(false),
        newCourseOpen: newFilmOpen,
        openNewCourse: () => setNewFilmOpen(true),
        closeNewCourse: () => setNewFilmOpen(false),
        toast,
        toasts,
        dismissToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
