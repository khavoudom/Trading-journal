import { Layers, Edit3, Trash2, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';

export function SpaceManager({
  spaces,
  editingSpaceId,
  editingSpaceName,
  renamingSpace,
  newSpaceName,
  creatingSpace,
  isLastSpace,
  onStartEdit,
  onEditingNameChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onNewSpaceNameChange,
  onCreateSpace,
}: {
  spaces: Array<{ id: string; name: string; createdAt: string }>;
  editingSpaceId: string | null;
  editingSpaceName: string;
  renamingSpace: boolean;
  newSpaceName: string;
  creatingSpace: boolean;
  isLastSpace: boolean;
  onStartEdit: (id: string, name: string) => void;
  onEditingNameChange: (v: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (space: { id: string; name: string }) => void;
  onNewSpaceNameChange: (v: string) => void;
  onCreateSpace: () => void;
}) {
  return (
    <div className="space-y-3">
      {spaces.map((space) => (
        <div
          key={space.id}
          className="flex items-center justify-between p-3 rounded-md bg-surface2"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-md bg-green-subtle flex items-center justify-center">
              <Layers className="w-4 h-4 text-green" />
            </div>
            {editingSpaceId === space.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editingSpaceName}
                  onChange={(e) => onEditingNameChange(e.target.value)}
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSaveEdit(space.id);
                    if (e.key === 'Escape') onCancelEdit();
                  }}
                />
                <Button onClick={() => onSaveEdit(space.id)} disabled={renamingSpace} size="sm">
                  {renamingSpace ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                </Button>
                <Button onClick={onCancelEdit} variant="ghost" size="sm">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">{space.name}</p>
                <p className="text-[10px] text-gray-500">
                  Created {new Date(space.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          {editingSpaceId !== space.id && (
            <div className="flex items-center gap-1">
              <Button onClick={() => onStartEdit(space.id, space.name)} variant="ghost" size="sm">
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
              {!isLastSpace && (
                <Button onClick={() => onDelete(space)} variant="ghost" size="sm">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="pt-2">
        <div className="flex items-center gap-2">
          <Input
            value={newSpaceName}
            onChange={(e) => onNewSpaceNameChange(e.target.value)}
            placeholder="New space name..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCreateSpace();
            }}
          />
          <Button onClick={onCreateSpace} disabled={creatingSpace || !newSpaceName.trim()}>
            {creatingSpace ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Layers className="w-4 h-4" />
            )}
            Create Space
          </Button>
        </div>
      </div>
    </div>
  );
}
