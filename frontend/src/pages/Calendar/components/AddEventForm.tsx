import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import TextEditor from '@/components/shared/TextEditor';

interface AddEventFormProps {
  onSave: (title: string, content: string) => Promise<void>;
  onCancel: () => void;
}

export default function AddEventForm({ onSave, onCancel }: AddEventFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(title.trim(), content);
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-text2 block mb-1.5">Title *</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title..."
          maxLength={200}
          autoFocus
        />
      </div>
      <div>
        <label className="text-xs font-medium text-text2 block mb-1.5">Content</label>
        <TextEditor value={content} onChange={setContent} placeholder="Optional notes..." />
      </div>

      {error && <p className="text-xs text-orange">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} size="sm" disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!title.trim() || saving} size="sm">
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              Saving...
            </>
          ) : (
            'Save Event'
          )}
        </Button>
      </div>
    </div>
  );
}
