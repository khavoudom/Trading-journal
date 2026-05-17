export default function DashboardPageLoader() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-surface2 p-6">
            <div className="mb-2 h-3 w-20 bg-surface1 rounded" />
            <div className="h-6 w-32 bg-surface1 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-48 animate-pulse rounded-lg bg-surface2" />
        <div className="h-48 animate-pulse rounded-lg bg-surface2" />
      </div>
    </div>
  );
}
