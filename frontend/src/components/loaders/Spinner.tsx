import type { FC } from 'react';

interface SpinnerProps {
  className?: string;
}

const Spinner: FC<SpinnerProps> = ({ className }) => {
  return (
    <div
      className={`h-6 w-6 animate-spin rounded-full border-2 border-green border-t-transparent ${className ?? ''}`}
    />
  );
};

export default Spinner;
