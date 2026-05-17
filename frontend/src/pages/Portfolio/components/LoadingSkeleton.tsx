export function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse h-12 bg-surface2 rounded-lg" />
      ))}
    </div>
  );
}
