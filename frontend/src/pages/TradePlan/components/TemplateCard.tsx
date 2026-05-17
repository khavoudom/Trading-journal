import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  ArrowRightToLine,
  CheckSquare,
  Type,
  Hash,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Template, TemplateItemType } from '@/types/template';
import { TEMPLATE_ITEM_TYPE_LABELS } from '@/types/template';

const ITEM_TYPE_ICONS: Record<TemplateItemType, React.ReactNode> = {
  checkbox: <CheckSquare className="w-3.5 h-3.5" />,
  text: <Type className="w-3.5 h-3.5" />,
  number: <Hash className="w-3.5 h-3.5" />,
};

export function TemplateCard({
  template,
  typeName,
  typeColor,
  isExpanded,
  isEditingName,
  editName,
  saving,
  onToggleExpand,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditNameChange,
  onDelete,
  onAttach,
  onAddItem,
  onDeleteItem,
}: {
  template: Template;
  typeName: string;
  typeColor: string;
  isExpanded: boolean;
  isEditingName: boolean;
  editName: string;
  saving: boolean;
  onToggleExpand: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditNameChange: (v: string) => void;
  onDelete: () => void;
  onAttach: () => void;
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
}) {
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
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: typeColor }}
          />
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
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
            style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
          >
            {typeName}
          </span>
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
              <button
                onClick={onAttach}
                className="flex items-center gap-1 px-2 h-6 rounded text-[10px] font-medium text-green hover:bg-green-subtle transition-colors cursor-pointer"
                title="Attach to trade"
              >
                <ArrowRightToLine className="w-3 h-3" /> Attach
              </button>
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
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-gray-500 shrink-0">{ITEM_TYPE_ICONS[item.type]}</span>
                    <span className="text-xs text-text2 truncate">{item.label}</span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider shrink-0">
                      {TEMPLATE_ITEM_TYPE_LABELS[item.type]}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="w-5 h-5 rounded flex items-center justify-center text-text2 opacity-0 group-hover/item:opacity-100 hover:text-orange hover:bg-orange-subtle transition-all cursor-pointer shrink-0"
                    title="Delete item"
                  >
                    <X className="w-3 h-3" />
                  </button>
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
