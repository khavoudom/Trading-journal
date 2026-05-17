export default function AlertsPageLoader() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg bg-surface2 p-4">
          <div className="mb-2 h-3 w-48 bg-surface1 rounded" />
          <div className="h-3 w-32 bg-surface1 rounded" />
        </div>
      ))}
    </div>
  );
}
