import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NavigationBridge } from './hooks/useHQ';
import AppRoutes from './routes/AppRoutes';
import IconSprite from './components/common/IconSprite';
import Toasts from './components/common/Toasts';

export default function App() {
  return (
    <BrowserRouter>
      <NavigationBridge />
      <AuthProvider>
        <AppProvider>
          <IconSprite />
          <AppRoutes />
          <Toasts />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
