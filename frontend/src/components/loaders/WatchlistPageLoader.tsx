export default function WatchlistPageLoader() {
  return (
    <div className="space-y-3 p-6">
      <div className="mb-4 h-5 w-24 animate-pulse rounded bg-surface2" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse rounded-lg bg-surface2 p-4">
          <div className="h-3 w-20 bg-surface1 rounded" />
          <div className="h-3 w-16 bg-surface1 rounded" />
          <div className="ml-auto h-3 w-12 bg-surface1 rounded" />
        </div>
      ))}
    </div>
  );
}
