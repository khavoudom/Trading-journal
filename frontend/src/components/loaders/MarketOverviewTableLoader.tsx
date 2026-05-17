export function MarketOverviewTableLoader() {
  return (
    <div className="space-y-2 mt-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <div className="h-4 bg-border rounded w-16 animate-pulse" />
          <div className="h-4 bg-border rounded w-20 flex-1 animate-pulse" />
          <div className="h-4 bg-border rounded w-10 animate-pulse" />
          <div className="h-4 bg-border rounded w-12 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
