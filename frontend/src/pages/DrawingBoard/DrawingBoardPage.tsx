import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Excalidraw, serializeAsJSON, restore } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { Save, Plus, Loader2, PenTool } from 'lucide-react';
import { useDrawingStore } from '@/store/drawingStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';

interface DrawingBoardPageProps {
  spaceId: string;
}

export default function DrawingBoardPage({ spaceId }: DrawingBoardPageProps) {
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date');
  const drawingIdParam = searchParams.get('drawingId');
  const isDateFiltered = !!date;

  const excalidrawRef = useRef<any>(null);
  const {
    drawings,
    loading,
    error,
    fetchDrawings,
    fetchAllDrawings,
    addDrawing,
    editDrawing,
    clearDrawings,
  } = useDrawingStore();

  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [title, setTitle] = useState('Drawing');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [, setInitialized] = useState(false);

  const selectedDrawing = drawings.find((d) => d.id === selectedDrawingId);

  const defaultDate = date || format(new Date(), 'yyyy-MM-dd');

  // Prompt before leaving if unsaved
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Clear stale drawings from other pages, then fetch for this date or all drawings
  useEffect(() => {
    clearDrawings();
    if (spaceId) {
      if (date) {
        fetchDrawings(spaceId, date);
      } else {
        fetchAllDrawings(spaceId);
      }
    }
  }, [spaceId, date, fetchDrawings, fetchAllDrawings, clearDrawings]);

  // Select drawing — prefer drawingId param, then first drawing, then new
  useEffect(() => {
    if (loading) return;
    if (drawingIdParam && drawings.some((d) => d.id === drawingIdParam)) {
      setSelectedDrawingId(drawingIdParam);
      const d = drawings.find((x) => x.id === drawingIdParam);
      if (d) setTitle(d.title);
    } else if (drawings.length > 0 && !selectedDrawingId) {
      setSelectedDrawingId(drawings[0].id);
      setTitle(drawings[0].title);
    } else if (drawings.length === 0 && !selectedDrawingId) {
      setTitle('Drawing');
    }
    setInitialized(true);
  }, [drawings, drawingIdParam, loading]);

  const doSave = useCallback(
    async (sceneElements: any, appState: any, files: any, drawingId: string) => {
      if (!spaceId) return;
      setSaving(true);
      setSaved(false);
      try {
        const jsonStr = serializeAsJSON(sceneElements, appState, files, 'database');
        const sceneData = JSON.parse(jsonStr);
        await editDrawing(drawingId, { sceneData }, spaceId);
        setSaved(true);
        setDirty(false);
        setTimeout(() => setSaved(false), 2000);
      } catch (err: any) {
        console.error('Failed to save drawing:', err);
      } finally {
        setSaving(false);
      }
    },
    [spaceId, editDrawing],
  );

  const handleChange = useCallback(
    (elements: any, appState: any, files: any) => {
      if (!selectedDrawingId) return;
      setDirty(true);
      // Debounce auto-save — only save every 2s
      if ((window as any).__excalidrawAutoSaveTimer) {
        clearTimeout((window as any).__excalidrawAutoSaveTimer);
      }
      (window as any).__excalidrawAutoSaveTimer = setTimeout(() => {
        doSave(elements, appState, files, selectedDrawingId);
      }, 2000);
    },
    [selectedDrawingId, doSave],
  );

  const handleManualSave = async () => {
    const api = excalidrawRef.current;
    if (!api || !selectedDrawingId) return;
    await doSave(
      api.getSceneElementsIncludingDeleted(),
      api.getAppState(),
      api.getFiles(),
      selectedDrawingId,
    );
  };

  const handleNewDrawing = async () => {
    if (!spaceId || !defaultDate) return;
    try {
      const created = await addDrawing({
        spaceId,
        date: defaultDate,
        title: 'Drawing',
        sceneData: {},
      });
      setSelectedDrawingId(created.id);
      setTitle('Drawing');
      setDirty(false);
      const api = excalidrawRef.current;
      if (api) api.resetScene();
    } catch {
      // error handled by store
    }
  };

  const handleSwitchDrawing = (id: string) => {
    const d = drawings.find((x) => x.id === id);
    if (d) {
      setSelectedDrawingId(id);
      setTitle(d.title);
      setDirty(false);
      // Load scene into Excalidraw via updateScene
      const api = excalidrawRef.current;
      if (api && d.sceneData) {
        try {
          const restored = restore(d.sceneData as any, null, null);
          api.updateScene({
            elements: restored.elements as any,
            appState: restored.appState as any,
          });
        } catch {
          api.resetScene();
        }
      }
    }
  };

  const handleTitleBlur = async () => {
    if (!selectedDrawingId || !title.trim()) return;
    try {
      await editDrawing(selectedDrawingId, { title: title.trim() }, spaceId);
    } catch {
      // error handled by store
    }
  };

  const handleExcalidrawReady = useCallback((api: any) => {
    excalidrawRef.current = api;
  }, []);

  if (!spaceId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7rem)] text-gray-500">
        <div className="text-center space-y-3">
          <PenTool className="w-12 h-12 mx-auto opacity-40" />
          <p className="text-sm">Loading drawing board...</p>
        </div>
      </div>
    );
  }

  // Build initialData from selected drawing
  let initialData: { elements?: any; appState?: any; files?: any } | undefined;
  if (selectedDrawing && selectedDrawing.sceneData) {
    try {
      const restored = restore(selectedDrawing.sceneData as any, null, null);
      initialData = {
        elements: restored.elements,
        appState: restored.appState,
        files: restored.files,
      };
    } catch {
      initialData = undefined;
    }
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col rounded-lg overflow-hidden border border-border">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface shrink-0">
        <select
          value={selectedDrawingId || ''}
          onChange={(e) => handleSwitchDrawing(e.target.value)}
          className="bg-surface2 border border-border rounded-md px-2 py-1.5 text-xs text-text outline-none focus:border-green/50 max-w-50"
        >
          {drawings.length === 0 && <option value="">No drawings</option>}
          {drawings.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="h-7 w-48 text-xs"
          placeholder="Drawing title..."
          maxLength={200}
        />

        <div className="flex items-center gap-1.5 ml-auto">
          <Button variant="outline" size="sm" onClick={handleNewDrawing} className="gap-1">
            <Plus className="w-3.5 h-3.5" />
            New
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleManualSave}
            disabled={!selectedDrawingId || saving}
            className="gap-1"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
          </Button>
        </div>

        <span className="text-[10px] text-gray-500 flex items-center gap-1">
          {isDateFiltered ? <>{date}</> : <span className="italic">All drawings</span>}
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center flex-1 bg-bg">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading drawings...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex items-center justify-center flex-1 bg-bg">
          <div className="text-center space-y-2">
            <p className="text-sm text-orange">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                spaceId && (date ? fetchDrawings(spaceId, date) : fetchAllDrawings(spaceId))
              }
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Excalidraw canvas */}
      {!loading && (
        <div className="flex-1">
          <Excalidraw
            key={selectedDrawingId || 'new'}
            theme="dark"
            excalidrawAPI={handleExcalidrawReady}
            onChange={handleChange}
            initialData={initialData}
          />
        </div>
      )}
    </div>
  );
}
