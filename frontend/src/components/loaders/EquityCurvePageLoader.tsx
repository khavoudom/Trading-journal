export default function EquityCurvePageLoader() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-surface2 p-6">
            <div className="mb-2 h-3 w-16 bg-surface1 rounded" />
            <div className="h-8 w-24 bg-surface1 rounded" />
          </div>
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-lg bg-surface2" />
    </div>
  );
}
