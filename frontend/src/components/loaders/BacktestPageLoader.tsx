export default function BacktestPageLoader() {
  return (
    <div className="space-y-6 p-6">
      <div className="animate-pulse rounded-lg bg-surface2 p-6">
        <div className="mb-4 h-4 w-32 bg-surface1 rounded" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-surface1 rounded" />
          ))}
        </div>
      </div>
      <div className="h-48 animate-pulse rounded-lg bg-surface2" />
    </div>
  );
}
