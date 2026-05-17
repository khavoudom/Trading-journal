export default function SchedulePageLoader() {
  return (
    <div className="space-y-4 p-6">
      <div className="mb-4 h-5 w-28 animate-pulse rounded bg-surface2" />
      <div className="flex gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 animate-pulse rounded-lg bg-surface2 p-3">
            <div className="mb-2 h-3 w-12 bg-surface1 rounded mx-auto" />
            <div className="space-y-2">
              <div className="h-8 bg-surface1 rounded" />
              <div className="h-8 bg-surface1 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
