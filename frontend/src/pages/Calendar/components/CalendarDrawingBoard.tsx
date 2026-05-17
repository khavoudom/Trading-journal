import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Excalidraw, serializeAsJSON, restore } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { Save, X, Loader2 } from 'lucide-react';
import { useCalendarDrawingStore } from '@/store/calendarDrawingStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import type { CalendarDrawing } from '@/types/drawing';

interface CalendarDrawingBoardProps {
  spaceId: string;
  date: string;
  onClose: (hasDrawing?: boolean) => void;
  existingDrawing?: CalendarDrawing;
}

export default function CalendarDrawingBoard({
  spaceId,
  date,
  onClose,
  existingDrawing,
}: CalendarDrawingBoardProps) {
  const excalidrawRef = useRef<any>(null);
  const { addDrawing, editDrawing } = useCalendarDrawingStore();
  const [title, setTitle] = useState(existingDrawing?.title || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  let initialData: { elements?: any; appState?: any; files?: any } | undefined;
  if (existingDrawing && existingDrawing.sceneData) {
    try {
      const restored = restore(existingDrawing.sceneData as any, null, null);
      initialData = {
        elements: restored.elements,
        appState: restored.appState,
        files: restored.files,
      };
    } catch {
      initialData = undefined;
    }
  }

  const handleSave = async () => {
    const api = excalidrawRef.current;
    if (!api) return;
    setSaving(true);
    setSaved(false);
    try {
      const elements = api.getSceneElementsIncludingDeleted();
      const appState = api.getAppState();
      const files = api.getFiles();
      const jsonStr = serializeAsJSON(elements, appState, files, 'database');
      const sceneData = JSON.parse(jsonStr);

      if (existingDrawing) {
        await editDrawing(
          existingDrawing.id,
          { title: title.trim() || 'Drawing', sceneData },
          spaceId,
        );
      } else {
        await addDrawing({ spaceId, date, title: title.trim() || 'Drawing', sceneData });
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose(true);
      }, 800);
    } catch (err: any) {
      console.error('Failed to save drawing:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReady = useCallback((api: any) => {
    excalidrawRef.current = api;
  }, []);

  const isEdit = !!existingDrawing;

  const [portalContainer] = useState(() => {
    const el = document.createElement('div');
    return el;
  });

  useEffect(() => {
    document.body.appendChild(portalContainer);
    return () => {
      document.body.removeChild(portalContainer);
    };
  }, [portalContainer]);

  return createPortal(
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => onClose(!!existingDrawing)}
    >
      <div
        className="card w-full max-w-5xl mx-4 animate-fade-in flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ height: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface shrink-0">
          <span className="text-xs font-semibold text-text2 uppercase tracking-wider">
            {isEdit ? 'Edit' : 'Add'} Drawing Board
          </span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-7 w-56 text-xs"
            placeholder="Drawing title..."
            maxLength={200}
          />
          <span className="text-[10px] text-gray-500">{date}</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-1"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
            </Button>
            <button
              onClick={() => onClose(!!existingDrawing)}
              className="p-1.5 rounded-md text-gray-500 hover:text-text hover:bg-surface2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Excalidraw canvas */}
        <div className="flex-1">
          <Excalidraw
            key={existingDrawing?.id || 'new-drawing'}
            theme="dark"
            excalidrawAPI={handleReady}
            initialData={initialData}
          />
        </div>
      </div>
    </div>,
    portalContainer,
  );
}
