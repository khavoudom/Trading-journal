import { Pencil, Trash2, FolderOpen, X, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { TemplateType } from '@/types/template';

const PRESET_COLORS = [
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Yellow', value: '#eab308' },
];

export function TypeCard({
  type,
  templateCount,
  isEditing,
  editName,
  editColor,
  saving,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditNameChange,
  onEditColorChange,
  onDelete,
}: {
  type: TemplateType;
  templateCount: number;
  isEditing: boolean;
  editName: string;
  editColor: string;
  saving: boolean;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditNameChange: (v: string) => void;
  onEditColorChange: (v: string) => void;
  onDelete: () => void;
}) {
  if (isEditing) {
    return (
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: editColor }} />
          <Input
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            className="h-7 text-xs flex-1"
            autoFocus
          />
        </div>
        <div className="flex gap-1 mt-2">
          <button
            onClick={onSaveEdit}
            disabled={saving}
            className="w-6 h-6 rounded flex items-center justify-center text-green hover:bg-green-subtle transition-colors cursor-pointer"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          </button>
          <button
            onClick={onCancelEdit}
            className="w-6 h-6 rounded flex items-center justify-center text-text2 hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => onEditColorChange(c.value)}
              className={`w-4 h-4 rounded-full border-2 transition-all cursor-pointer ${editColor === c.value ? 'border-text scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-surface border border-border rounded-xl p-4 hover:border-l-4 transition-all cursor-pointer group"
      style={{ borderLeftColor: type.color }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-3 h-3 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: type.color }}
          />
          <span className="text-sm font-semibold text-text truncate">{type.name}</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            className="w-6 h-6 rounded flex items-center justify-center text-text2 hover:bg-surface2 transition-colors cursor-pointer"
            title="Edit"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-6 h-6 rounded flex items-center justify-center text-text2 hover:bg-orange-subtle hover:text-orange transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <FolderOpen className="w-3 h-3 text-gray-500" />
        <span className="text-[11px] text-gray-500">
          {templateCount} {templateCount === 1 ? 'template' : 'templates'}
        </span>
      </div>
    </div>
  );
}
