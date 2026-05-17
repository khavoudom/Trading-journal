export default function SettingsPageLoader() {
  return (
    <div className="space-y-6 p-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg bg-surface2 p-6">
          <div className="mb-4 h-5 w-36 bg-surface1 rounded" />
          <div className="space-y-3">
            <div className="h-9 bg-surface1 rounded" />
            <div className="h-9 bg-surface1 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
