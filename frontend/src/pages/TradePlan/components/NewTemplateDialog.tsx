import { X, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { TypeCombobox } from './TypeCombobox';
import type { TemplateType, TemplateItemType } from '@/types/template';
import { TEMPLATE_ITEM_TYPE_LABELS } from '@/types/template';

export function NewTemplateDialog({
  open,
  onOpenChange,
  types,
  name,
  onNameChange,
  typeId,
  onTypeIdChange,
  items,
  onItemsChange,
  onCreateNewType,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  types: TemplateType[];
  name: string;
  onNameChange: (v: string) => void;
  typeId: string;
  onTypeIdChange: (v: string) => void;
  items: { type: TemplateItemType; label: string }[];
  onItemsChange: (items: { type: TemplateItemType; label: string }[]) => void;
  onCreateNewType: (name: string) => Promise<TemplateType>;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Template</DialogTitle>
          <DialogDescription>Create a reusable template with typed items</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px]">Template Name</Label>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Pre-Trade Checklist"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Type</Label>
            <TypeCombobox
              types={types}
              selectedTypeId={typeId}
              onSelect={onTypeIdChange}
              onCreateNewType={onCreateNewType}
            />
          </div>

          {/* Items builder */}
          <div className="space-y-1.5">
            <Label className="text-[11px]">Items</Label>
            <div className="space-y-2 max-h-50 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
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
                  <Input
                    value={item.label}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx] = { ...updated[idx], label: e.target.value };
                      onItemsChange(updated);
                    }}
                    placeholder="Item label"
                    className="flex-1 h-7 text-xs"
                    autoFocus={idx === items.length - 1}
                  />
                  <button
                    onClick={() => onItemsChange(items.filter((_, i) => i !== idx))}
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-orange transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
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
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            onClick={onSave}
            disabled={
              saving || !name.trim() || !typeId || items.filter((i) => i.label.trim()).length === 0
            }
            className="bg-green text-black hover:bg-green/90 font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
