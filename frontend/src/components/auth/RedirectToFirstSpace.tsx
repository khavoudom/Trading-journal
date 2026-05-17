import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSpaceStore } from '@/store/spaceStore';

export default function RedirectToFirstSpace() {
  const { spaces, fetchSpaces } = useSpaceStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSpaces();
    }
  }, [user, fetchSpaces]);

  useEffect(() => {
    if (spaces.length > 0) {
      navigate(`/space/${spaces[0].id}/dashboard`, { replace: true });
    }
  }, [spaces, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg">
      <div className="text-sm text-(--text-gray-500) animate-pulse">Loading...</div>
    </div>
  );
}
