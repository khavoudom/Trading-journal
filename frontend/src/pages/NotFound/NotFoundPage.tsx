import { useNavigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-surface border border-border rounded-xl p-8 text-center max-w-sm animate-fade-in">
        <SearchX className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-30" />
        <h2
          className="text-lg font-semibold text-text mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Page Not Found
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button variant="default" size="sm" onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
