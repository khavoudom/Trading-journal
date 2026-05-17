import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GuestRoute from '@/components/auth/GuestRoute';
import SpaceRouter from './SpaceRouter';
import RedirectToFirstSpace from '@/components/auth/RedirectToFirstSpace';
import { useAuthStore } from '@/store/authStore';
import { LoadingFallback } from '@/components/loaders';

const LoginPage = lazy(() => import('@/pages/Login/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/Register/RegisterPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));

export default function AppRouter() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <LoadingFallback fullScreen />;
  }

  return (
    <Suspense fallback={<LoadingFallback fullScreen />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route path="/space/:spaceId/*" element={<SpaceRouter />} />
        <Route
          path="/"
          element={user ? <RedirectToFirstSpace /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={user ? <NotFoundPage /> : <Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
