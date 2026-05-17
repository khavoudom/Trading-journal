import TradeForm from './TradeForm';
import type { TradeFormValues } from '@/types/trade';

export function TradeModal({
  title,
  initialData,
  prefillDate,
  spaceId,
  onSubmit,
  onDelete,
  onClose,
}: {
  title: string;
  initialData?: Partial<TradeFormValues>;
  prefillDate?: string;
  spaceId: string;
  onSubmit: (data: TradeFormValues) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <TradeForm
          spaceId={spaceId}
          title={title}
          initialData={initialData}
          prefillDate={prefillDate}
          onSubmit={onSubmit}
          onDelete={onDelete}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
