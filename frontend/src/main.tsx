import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { useAuthStore } from './store/authStore';
import NotificationSocket from './components/notifications/NotificationSocket';

function Boot() {
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <NotificationSocket />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boot />
  </StrictMode>,
);
