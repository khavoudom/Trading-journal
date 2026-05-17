import Spinner from './Spinner';
import type { FC } from 'react';

interface LoadingFallbackProps {
  className?: string;
  fullScreen?: boolean;
}

const LoadingFallback: FC<LoadingFallbackProps> = ({ className, fullScreen }) => {
  return (
    <div
      className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'h-64'} ${className ?? ''}`}
    >
      <Spinner />
    </div>
  );
};

export default LoadingFallback;
