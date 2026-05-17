import { useNavigate } from 'react-router-dom';
import { ShieldBan } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface UnauthorizedPageProps {
  message?: string;
  onBack?: () => void;
}

const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  message = "You don't have permission to access this resource. Please contact your space administrator if you believe this is a mistake.",
  onBack,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-surface border border-border rounded-xl p-8 text-center max-w-sm animate-fade-in">
        <div className="relative inline-flex mb-4">
          <ShieldBan className="w-12 h-12 text-orange mx-auto opacity-60" />
          <span className="absolute -top-2 -right-3 bg-orange text-[10px] font-bold text-black px-1.5 py-0.5 rounded leading-none">
            403
          </span>
        </div>
        <h2
          className="text-lg font-semibold text-text mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Access Denied
        </h2>
        <p className="text-xs text-gray-500 mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3">
          {onBack ? (
            <Button variant="outline" size="sm" onClick={onBack}>
              Go Back
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          )}
          <Button variant="default" size="sm" onClick={() => navigate('/')}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
