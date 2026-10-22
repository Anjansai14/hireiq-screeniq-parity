import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HQ } from '../data/hireData';
import { urlForRoute } from '../routes/routeMapping';

let _globalNavigate = null;

export function setGlobalNavigate(fn) {
  _globalNavigate = fn;
}

export function getGlobalNavigate() {
  return _globalNavigate;
}

// Hook Store.prototype.go into global navigation
HQ._onGo = (name, params) => {
  if (typeof _globalNavigate === 'function') {
    const url = urlForRoute(name, params);
    if (url) {
      _globalNavigate(url);
    }
  }
};

/**
 * Component mounted inside BrowserRouter to register React Router's navigate function.
 */
export function NavigationBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    setGlobalNavigate(navigate);
    return () => setGlobalNavigate(null);
  }, [navigate]);

  return null;
}

export function useHQ() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = HQ.sub(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  return {
    s: HQ.s,
    state: HQ.s,
    HQ,
    currentCourse: HQ.film(),
    currentRoute: HQ.s?.route || { name: 'dashboard' },
    go: (name, params) => {
      HQ.go(name, params);
    },
    set: (fn) => HQ.set(fn),
    toast: (msg, type) => HQ.toast(msg, type)
  };
}
