import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  CheckSquare,
  Type,
  Hash,
  Link,
  Link2Off,
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import TextEditor from '@/components/shared/TextEditor';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { Template, TemplateItemType } from '@/types/template';
import { TEMPLATE_ITEM_TYPE_LABELS } from '@/types/template';

const ITEM_TYPE_ICONS: Record<TemplateItemType, React.ReactNode> = {
  checkbox: <CheckSquare className="w-3.5 h-3.5" />,
  text: <Type className="w-3.5 h-3.5" />,
  number: <Hash className="w-3.5 h-3.5" />,
};

export function TemplateCard({
  template,
  isExpanded,
  isEditingName,
  editName,
  saving,
  isAttached,
  onToggleExpand,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditNameChange,
  onDelete,
  onAttach,
  onDetach,
  onAddItem,
  onDeleteItem,
  onEditItem,
}: {
  template: Template;
  isExpanded: boolean;
  isEditingName: boolean;
  editName: string;
  saving: boolean;
  isAttached: boolean;
  onToggleExpand: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditNameChange: (v: string) => void;
  onDelete: () => void;
  onAttach: () => void;
  onDetach: () => void;
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
  onEditItem: (itemId: string, data: { type: TemplateItemType; label: string }) => void;
}) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemLabel, setEditItemLabel] = useState('');
  const [editItemType, setEditItemType] = useState<TemplateItemType>('checkbox');
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Template header row */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-surface2 cursor-pointer hover:bg-surface transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
          )}
          {isEditingName ? (
            <Input
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className="h-7 text-xs flex-1 max-w-50"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm font-semibold text-text truncate">{template.name}</span>
          )}
          <span className="text-[10px] text-gray-500 shrink-0">{template.items.length} items</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {isEditingName ? (
            <>
              <button
                onClick={onSaveEdit}
                disabled={saving}
                className="w-6 h-6 rounded flex items-center justify-center text-green hover:bg-green-subtle transition-colors cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={onCancelEdit}
                className="w-6 h-6 rounded flex items-center justify-center text-text2 hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <>
              {isAttached ? (
                <button
                  onClick={onDetach}
                  className="flex items-center gap-1 px-2 h-6 rounded text-[10px] font-medium text-orange hover:bg-orange-subtle transition-colors cursor-pointer"
                  title="Remove from trade"
                >
                  <Link2Off className="w-3 h-3" /> Remove
                </button>
              ) : (
                <button
                  onClick={onAttach}
                  className="flex items-center gap-1 px-2 h-6 rounded text-[10px] font-medium text-green hover:bg-green-subtle transition-colors cursor-pointer"
                  title="Attach to trade"
                >
                  <Link className="w-3 h-3" /> Attach
                </button>
              )}
              <button
                onClick={onStartEdit}
                className="w-6 h-6 rounded flex items-center justify-center text-text2 hover:bg-surface transition-colors cursor-pointer"
                title="Rename"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={onDelete}
                className="w-6 h-6 rounded flex items-center justify-center text-text2 hover:bg-orange-subtle hover:text-orange transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded items */}
      {isExpanded && (
        <div className="px-4 py-3 border-t border-border bg-surface">
          {template.items.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">
              No items yet. Add items to this template.
            </p>
          ) : (
            <div className="space-y-1">
              {template.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface2 transition-colors group/item"
                >
                  {editingItemId === item.id ? (
                    <div className="flex items-start gap-2 flex-1 min-w-0 w-full">
                      <div className="flex-1 min-w-0 space-y-2">
                        <Select
                          value={editItemType}
                          onValueChange={(v) => setEditItemType(v as TemplateItemType)}
                        >
                          <SelectTrigger className="w-[110px] h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checkbox">
                              <span className="flex items-center gap-1.5">
                                <CheckSquare className="w-3 h-3" /> Checkbox
                              </span>
                            </SelectItem>
                            <SelectItem value="text">
                              <span className="flex items-center gap-1.5">
                                <Type className="w-3 h-3" /> Text
                              </span>
                            </SelectItem>
                            <SelectItem value="number">
                              <span className="flex items-center gap-1.5">
                                <Hash className="w-3 h-3" /> Number
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <TextEditor
                          value={editItemLabel}
                          onChange={setEditItemLabel}
                          minHeight={80}
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <button
                          onClick={() => {
                            const stripped = editItemLabel.replace(/<[^>]+>/g, '').trim();
                            if (stripped) {
                              onEditItem(item.id, { type: editItemType, label: editItemLabel.trim() });
                              setEditingItemId(null);
                            }
                          }}
                          className="w-6 h-6 rounded flex items-center justify-center text-green hover:bg-green-subtle transition-colors cursor-pointer"
                          title="Save"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="w-6 h-6 rounded flex items-center justify-center text-text2 hover:bg-surface transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-gray-500 shrink-0">{ITEM_TYPE_ICONS[item.type]}</span>
                        <span className="text-xs text-text2 truncate [&_*]:!text-xs prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.label }} />
                        <span className="text-[9px] text-gray-500 uppercase tracking-wider shrink-0">
                          {TEMPLATE_ITEM_TYPE_LABELS[item.type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditItemLabel(item.label);
                            setEditItemType(item.type);
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center text-text2 opacity-0 group-hover/item:opacity-100 hover:text-green hover:bg-green-subtle transition-all cursor-pointer"
                          title="Edit item"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="w-5 h-5 rounded flex items-center justify-center text-text2 opacity-0 group-hover/item:opacity-100 hover:text-orange hover:bg-orange-subtle transition-all cursor-pointer"
                          title="Delete item"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          <button
            onClick={onAddItem}
            className="mt-2 text-xs text-green hover:underline cursor-pointer"
          >
            + Add item
          </button>
        </div>
      )}
    </div>
  );
}
