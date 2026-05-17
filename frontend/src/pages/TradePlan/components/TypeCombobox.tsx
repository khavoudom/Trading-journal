import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { TemplateType } from '@/types/template';

const PREDEFINED_TYPE_NAMES = [
  'Check List',
  'Core Rules',
  'Trading Setup',
  'Mistakes',
  'Identity',
  'Rules',
];

const PREDEFINED_TYPE_COLORS: Record<string, string> = {
  'Check List': '#22c55e',
  'Core Rules': '#3b82f6',
  'Trading Setup': '#f97316',
  Mistakes: '#ef4444',
  Identity: '#a855f7',
  Rules: '#14b8a6',
};

export function TypeCombobox({
  types,
  selectedTypeId,
  onSelect,
  onCreateNewType,
}: {
  types: TemplateType[];
  selectedTypeId: string;
  onSelect: (id: string) => void;
  onCreateNewType: (name: string) => Promise<TemplateType>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedType = types.find((t) => t.id === selectedTypeId);
  const existingTypes = search
    ? types.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : types;
  const existingNames = new Set(types.map((t) => t.name));
  const predefinedSuggestions = search
    ? PREDEFINED_TYPE_NAMES.filter(
        (n) => !existingNames.has(n) && n.toLowerCase().includes(search.toLowerCase()),
      )
    : PREDEFINED_TYPE_NAMES.filter((n) => !existingNames.has(n));
  const canCreateCustom =
    search.trim() &&
    !types.some((t) => t.name.toLowerCase() === search.trim().toLowerCase()) &&
    !PREDEFINED_TYPE_NAMES.some((n) => n.toLowerCase() === search.trim().toLowerCase());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (id: string) => {
    onSelect(id);
    setOpen(false);
    setSearch('');
  };

  const handleCreate = async (name: string) => {
    setCreating(true);
    try {
      await onCreateNewType(name);
      setOpen(false);
      setSearch('');
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex items-center gap-2 w-full h-9 rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors hover:border-ring"
      >
        {selectedType ? (
          <>
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedType.color }}
            />
            <span className="text-text flex-1 text-left">{selectedType.name}</span>
          </>
        ) : (
          <span className="text-gray-500 flex-1 text-left">Select or type a type...</span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-surface border border-border rounded-lg shadow-lg shadow-black/20 overflow-hidden">
          <div className="p-2 border-b border-border">
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or create type..."
              className="h-8 text-xs"
            />
          </div>
          <div className="max-h-50 overflow-y-auto">
            {existingTypes.length > 0 && (
              <div>
                {!search && (
                  <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Existing
                  </div>
                )}
                {existingTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleSelect(type.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-surface2 transition-colors cursor-pointer ${selectedTypeId === type.id ? 'bg-green/10 text-green font-medium' : 'text-text'}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: type.color }}
                    />
                    {type.name}
                    {selectedTypeId === type.id && <Check className="w-3 h-3 ml-auto text-green" />}
                  </button>
                ))}
              </div>
            )}
            {predefinedSuggestions.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Suggestions
                </div>
                {predefinedSuggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleCreate(name)}
                    disabled={creating}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-text hover:bg-surface2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: PREDEFINED_TYPE_COLORS[name] || '#22c55e' }}
                    />
                    {name}
                    <span className="text-[9px] text-green ml-auto">
                      {creating ? 'Creating...' : '+ Create'}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {canCreateCustom && (
              <button
                type="button"
                onClick={() => handleCreate(search.trim())}
                disabled={creating}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-text hover:bg-surface2 transition-colors cursor-pointer disabled:opacity-50 border-t border-border"
              >
                <Plus className="w-3 h-3 text-green" />
                Create "<span className="font-medium">{search.trim()}</span>"
                {creating && <Loader2 className="w-3 h-3 ml-auto animate-spin" />}
              </button>
            )}
            {existingTypes.length === 0 &&
              predefinedSuggestions.length === 0 &&
              !canCreateCustom && (
                <div className="px-3 py-4 text-xs text-gray-500 text-center">No types found</div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
