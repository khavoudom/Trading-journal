export default function TradePlanPageLoader() {
  return (
    <div className="space-y-6 p-6">
      <div className="mb-4 h-5 w-28 animate-pulse rounded bg-surface2" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-surface2 p-5">
            <div className="mb-3 h-4 w-32 bg-surface1 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-surface1 rounded" />
              <div className="h-3 w-3/4 bg-surface1 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
