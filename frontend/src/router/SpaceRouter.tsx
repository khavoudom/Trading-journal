import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useSpaceStore } from '@/store/spaceStore';
import { useAuthStore } from '@/store/authStore';
import SpaceContent from '@/pages/Space/SpaceContent';

export default function SpaceRouter() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { user, loading } = useAuthStore();
  const { spaces, loading: spacesLoading, fetchSpaces, setCurrentSpace } = useSpaceStore();

  const isValidSpace = spaceId && spaces.some((s) => s.id === spaceId);

  // Fetch spaces on mount if user is logged in and spaces haven't been loaded
  useEffect(() => {
    if (user && spaces.length === 0) {
      fetchSpaces();
    }
  }, [user, spaces.length, fetchSpaces]);

  useEffect(() => {
    if (isValidSpace) {
      setCurrentSpace(spaceId);
    }
  }, [spaceId, isValidSpace, setCurrentSpace]);

  // If auth is still loading or spaces are being fetched, wait
  if (loading || (user && spacesLoading)) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-sm text-(--text-gray-500) animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isValidSpace && spaces.length > 0) {
    return <Navigate to={`/space/${spaces[0].id}/dashboard`} replace />;
  }

  if (!isValidSpace) {
    return null;
  }

  return <SpaceContent spaceId={spaceId} />;
}
