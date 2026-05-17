export default function DrawingBoardPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green border-t-transparent" />
        <span className="text-sm text-text2">Loading drawing board...</span>
      </div>
    </div>
  );
}
