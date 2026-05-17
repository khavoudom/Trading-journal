import { useState } from 'react';
import { Plus } from 'lucide-react';

export function AddSymbolForm({ onAdd }: { onAdd: (symbol: string) => void }) {
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (!value.trim()) return;
    onAdd(value.toUpperCase());
    setValue('');
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd();
        }}
        placeholder="Add symbol..."
        className="h-9 px-3 text-xs bg-surface2 border border-border rounded-lg text-text placeholder:text-gray-500 outline-none focus:border-blue transition-colors flex-1"
        style={{ fontFamily: 'var(--font-mono)' }}
      />
      <button
        onClick={handleAdd}
        disabled={!value.trim()}
        className="h-9 px-3 text-xs font-bold bg-blue text-white rounded-lg hover:bg-blue/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> Add
      </button>
    </div>
  );
}
