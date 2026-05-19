import { useState, useEffect } from 'react';
import { LayoutTemplate, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import { Button } from '@/components/ui/Button';
import { useTemplateStore } from '@/store/templateStore';
import type { TemplateItemType } from '@/types/template';
import { TemplateCard } from './components/TemplateCard';
import { NewTemplateDialog } from './components/NewTemplateDialog';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';

interface TradePlanPageProps {
  spaceId?: string;
}

const TradePlanPage: React.FC<TradePlanPageProps> = ({ spaceId }) => {
  const {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    addItem,
    deleteItem,
    updateItem,
    toggleAttach,
  } = useTemplateStore();

  // UI state
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Edit template name state
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editTemplateName, setEditTemplateName] = useState('');

  // New template form
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateItems, setNewTemplateItems] = useState<
    { type: TemplateItemType; label: string }[]
  >([{ type: 'checkbox', label: '' }]);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  const [savingTemplate, setSavingTemplate] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!spaceId) return;
    fetchTemplates(spaceId);
  }, [spaceId, fetchTemplates]);

  // Loading state
  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-green animate-spin" />
      </div>
    );
  }

  // Empty state
  if (!loading && templates.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-md bg-green-subtle flex items-center justify-center">
            <LayoutTemplate className="w-5 h-5 text-green" />
          </div>
          <div>
            <h2
              className="text-lg font-semibold text-text"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Templates
            </h2>
            <p className="text-xs text-gray-500">
              Create reusable templates for your trading process
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl">
          <LayoutTemplate className="w-12 h-12 text-gray-500 mb-3 opacity-30" />
          <p className="text-sm text-text2 font-medium">No templates yet</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Create your first template to get started
          </p>
          <Button
            onClick={() => setShowNewTemplateDialog(true)}
            className="bg-green text-black hover:bg-green/90 font-bold"
          >
            <Plus className="w-4 h-4" /> New Template
          </Button>
        </div>
        <NewTemplateDialog
          open={showNewTemplateDialog}
          onOpenChange={setShowNewTemplateDialog}
          name={newTemplateName}
          onNameChange={setNewTemplateName}
          items={newTemplateItems}
          onItemsChange={setNewTemplateItems}
          onSave={async () => {
            if (!spaceId || !newTemplateName.trim()) return;
            const validItems = newTemplateItems.filter((i) => i.label.trim());
            if (validItems.length === 0) return;
            setCreatingTemplate(true);
            try {
              await createTemplate({
                spaceId,
                name: newTemplateName.trim(),
                items: validItems.map((item, idx) => ({
                  type: item.type,
                  label: item.label.trim(),
                  order: idx,
                })),
              });
              setShowNewTemplateDialog(false);
              setNewTemplateName('');
              setNewTemplateItems([{ type: 'checkbox', label: '' }]);
            } catch {
              /* silent */
            } finally {
              setCreatingTemplate(false);
            }
          }}
          saving={creatingTemplate}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-md bg-green-subtle flex items-center justify-center">
          <LayoutTemplate className="w-5 h-5 text-green" />
        </div>
        <div className="flex-1">
          <h2
            className="text-lg font-semibold text-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Templates
          </h2>
          <p className="text-xs text-gray-500">
            Create reusable templates for your trading process
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-orange-subtle text-oranger text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Templates Section */}
      <Panel>
        <PanelHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="text-[13px] font-bold text-text">All Templates</div>
              <div className="text-[11px] text-text2">
                {templates.length} {templates.length === 1 ? 'template' : 'templates'} defined
              </div>
            </div>
            <Button
              onClick={() => setShowNewTemplateDialog(true)}
              size="sm"
              className="bg-green text-black hover:bg-green/90 font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> New Template
            </Button>
          </div>
        </PanelHeader>
        <PanelBody>
          {templates.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border rounded-lg">
              <LayoutTemplate className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-30" />
              <p className="text-xs text-gray-500">No templates yet</p>
              <p className="text-[11px] text-gray-500 mt-1 opacity-60">
                Create your first template to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isExpanded={expandedTemplateId === template.id}
                  isEditingName={editingTemplateId === template.id}
                  editName={editTemplateName}
                  saving={savingTemplate}
                  onToggleExpand={() =>
                    setExpandedTemplateId(expandedTemplateId === template.id ? null : template.id)
                  }
                  onStartEdit={() => {
                    setEditingTemplateId(template.id);
                    setEditTemplateName(template.name);
                  }}
                  onSaveEdit={async () => {
                    if (!editingTemplateId || !editTemplateName.trim()) return;
                    setSavingTemplate(true);
                    try {
                      await updateTemplate(editingTemplateId, { name: editTemplateName.trim() });
                      setEditingTemplateId(null);
                    } catch {
                      /* silent */
                    } finally {
                      setSavingTemplate(false);
                    }
                  }}
                  onCancelEdit={() => setEditingTemplateId(null)}
                  onEditNameChange={setEditTemplateName}
                  onDelete={() => setConfirmingDelete({ id: template.id, name: template.name })}
                  isAttached={template.isAttached}
                  onAttach={() => toggleAttach(template.id, template.isAttached)}
                  onDetach={() => toggleAttach(template.id, template.isAttached)}
                  onAddItem={async () => {
                    const order = template.items.length;
                    try {
                      await addItem(template.id, { type: 'checkbox', label: 'New item', order });
                    } catch {
                      /* silent */
                    }
                  }}
                  onDeleteItem={async (itemId) => {
                    try {
                      await deleteItem(itemId);
                    } catch {
                      /* silent */
                    }
                  }}
                  onEditItem={async (itemId, data) => {
                    try {
                      await updateItem(itemId, data);
                    } catch {
                      /* silent */
                    }
                  }}
                />
              ))}
            </div>
          )}
        </PanelBody>
      </Panel>

      {/* Dialogs */}
      <NewTemplateDialog
        open={showNewTemplateDialog}
        onOpenChange={setShowNewTemplateDialog}
        name={newTemplateName}
        onNameChange={setNewTemplateName}
        items={newTemplateItems}
        onItemsChange={setNewTemplateItems}
        onSave={async () => {
          if (!spaceId || !newTemplateName.trim()) return;
          const validItems = newTemplateItems.filter((i) => i.label.trim());
          if (validItems.length === 0) return;
          setCreatingTemplate(true);
          try {
            await createTemplate({
              spaceId,
              name: newTemplateName.trim(),
              items: validItems.map((item, idx) => ({
                type: item.type,
                label: item.label.trim(),
                order: idx,
              })),
            });
            setShowNewTemplateDialog(false);
            setNewTemplateName('');
            setNewTemplateItems([{ type: 'checkbox', label: '' }]);
          } catch {
            /* silent */
          } finally {
            setCreatingTemplate(false);
          }
        }}
        saving={creatingTemplate}
      />

      <DeleteConfirmDialog
        open={confirmingDelete !== null}
        onOpenChange={(open) => !open && setConfirmingDelete(null)}
        title="Delete Template"
        description={`Are you sure you want to delete "${confirmingDelete?.name}"? This action cannot be undone.`}
        onConfirm={async () => {
          if (!confirmingDelete) return;
          setDeleting(true);
          try {
            await deleteTemplate(confirmingDelete.id);
            if (expandedTemplateId === confirmingDelete.id) setExpandedTemplateId(null);
            setConfirmingDelete(null);
          } catch {
            /* silent */
          } finally {
            setDeleting(false);
          }
        }}
        deleting={deleting}
      />
    </div>
  );
};

export default TradePlanPage;
