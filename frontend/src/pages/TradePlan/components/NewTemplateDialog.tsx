import { X, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import TextEditor from '@/components/shared/TextEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import type { TemplateItemType } from '@/types/template';
import { TEMPLATE_ITEM_TYPE_LABELS } from '@/types/template';

export function NewTemplateDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  items,
  onItemsChange,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (v: string) => void;
  items: { type: TemplateItemType; label: string }[];
  onItemsChange: (items: { type: TemplateItemType; label: string }[]) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 flex flex-col"
        style={{
          resize: 'both',
          overflow: 'hidden',
          height: '600px',
          width: '500px',
          minWidth: '500px',
          minHeight: '450px',
          maxWidth: 'calc(100vw - 2rem)',
        }}
      >
        <div className="p-4 pb-0 shrink-0">
          <DialogHeader>
            <DialogTitle>New Template</DialogTitle>
            <DialogDescription>Create a reusable template with typed items</DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col min-h-0 flex-1 gap-4 p-4 overflow-hidden">
          <div className="space-y-1.5 shrink-0">
            <Label className="text-[11px]">Template Name</Label>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Pre-Trade Checklist"
            />
          </div>

          {/* Items builder */}
          <div className="space-y-1.5 flex flex-col min-h-0 flex-1">
            <Label className="text-[11px] shrink-0">Items</Label>
            <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
              {items.map((item, idx) => (
                <div key={idx} className="space-y-1 p-2 rounded-lg border border-border bg-surface">
                  <div className="flex items-center justify-between gap-2">
                    <Select
                      value={item.type}
                      onValueChange={(v) => {
                        const updated = [...items];
                        updated[idx] = { ...updated[idx], type: v as TemplateItemType };
                        onItemsChange(updated);
                      }}
                    >
                      <SelectTrigger className="w-27.5 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.entries(TEMPLATE_ITEM_TYPE_LABELS) as [TemplateItemType, string][]
                        ).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => onItemsChange(items.filter((_, i) => i !== idx))}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-orange hover:bg-orange-subtle transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <TextEditor
                    value={item.label}
                    onChange={(html) => {
                      const updated = [...items];
                      updated[idx] = { ...updated[idx], label: html };
                      onItemsChange(updated);
                    }}
                    minHeight={80}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => onItemsChange([...items, { type: 'checkbox', label: '' }])}
              className="text-xs text-green hover:underline cursor-pointer"
            >
              + Add item
            </button>
          </div>
        </div>

        <div className="border-t border-border bg-muted/50 p-4 shrink-0 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            onClick={onSave}
            disabled={saving || !name.trim() || items.filter((i) => i.label.trim()).length === 0}
            className="bg-green text-black hover:bg-green/90 font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
