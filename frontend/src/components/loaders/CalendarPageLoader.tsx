export default function CalendarPageLoader() {
  return (
    <div className="p-6">
      <div className="mb-6 h-5 w-40 animate-pulse rounded bg-surface2" />
      <div className="grid grid-cols-7 gap-px rounded-md overflow-hidden border border-border">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse bg-surface2" />
        ))}
      </div>
    </div>
  );
}
