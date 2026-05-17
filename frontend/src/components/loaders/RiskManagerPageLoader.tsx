export default function RiskManagerPageLoader() {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg bg-surface2 p-5">
          <div className="mb-3 h-4 w-36 bg-surface1 rounded" />
          <div className="h-3 w-full bg-surface1 rounded" />
        </div>
      ))}
    </div>
  );
}
