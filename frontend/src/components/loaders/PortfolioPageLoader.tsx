import { LoadingSkeleton } from '@/pages/Portfolio/components/LoadingSkeleton';

export default function PortfolioPageLoader() {
  return (
    <div className="p-6">
      <div className="mb-4 h-5 w-32 animate-pulse rounded bg-surface2" />
      <LoadingSkeleton />
    </div>
  );
}
