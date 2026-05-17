import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, WifiOff, ServerCrash, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/* ── Status-aware error card ── */

type ErrorVariant = 'network' | 'server' | 'client' | 'generic';

interface ErrorPageProps {
  variant?: ErrorVariant;
  title?: string;
  message?: string;
  statusCode?: number;
  onRetry?: () => void;
  onBack?: () => void;
}

const variantConfig: Record<ErrorVariant, { icon: typeof AlertTriangle; color: string }> = {
  network: { icon: WifiOff, color: 'text-gray-500' },
  server: { icon: ServerCrash, color: 'text-orange' },
  client: { icon: AlertTriangle, color: 'text-warning' },
  generic: { icon: AlertTriangle, color: 'text-orange' },
};

const defaultMessages: Record<ErrorVariant, { title: string; message: string }> = {
  network: {
    title: 'Connection Lost',
    message: 'Unable to reach the server. Please check your internet connection and try again.',
  },
  server: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
  },
  client: {
    title: 'Request Failed',
    message: 'The request could not be completed. Please review your input and try again.',
  },
  generic: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again later.',
  },
};

const ErrorCard: React.FC<ErrorPageProps> = ({
  variant = 'generic',
  title,
  message,
  onRetry,
  onBack,
}) => {
  const navigate = useNavigate();
  const config = variantConfig[variant];
  const defaults = defaultMessages[variant];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-surface border border-border rounded-xl p-8 text-center max-w-sm animate-fade-in">
        <Icon className={`w-12 h-12 mx-auto mb-4 opacity-50 ${config.color}`} />
        <h2
          className="text-lg font-semibold text-text mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title ?? defaults.title}
        </h2>
        <p className="text-xs text-gray-500 mb-6">{message ?? defaults.message}</p>
        <div className="flex items-center justify-center gap-3">
          {(onBack || window.history.length > 1) && (
            <Button variant="outline" size="sm" onClick={onBack ?? (() => navigate(-1))}>
              Go Back
            </Button>
          )}
          {onRetry && (
            <Button variant="default" size="sm" onClick={onRetry}>
              <RefreshCw className="size-3.5" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Error boundary ── */

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorPageFallback
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

/** Standalone fallback rendered when ErrorBoundary catches an error. */
const ErrorPageFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-surface border border-border rounded-xl p-8 text-center max-w-sm animate-fade-in">
        <AlertTriangle className="w-12 h-12 text-orange mx-auto mb-4 opacity-50" />
        <h2
          className="text-lg font-semibold text-text mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Something went wrong
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          A rendering error occurred. This might be a temporary issue.
        </p>
        {onRetry && (
          <Button variant="default" size="sm" onClick={onRetry}>
            <RefreshCw className="size-3.5" />
            Reload
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorCard;
export { ErrorBoundary, ErrorPageFallback };
