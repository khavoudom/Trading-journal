import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import { Button } from '@/components/ui/Button';
import { useTemplateStore } from '@/store/templateStore';
import type { TemplateItemType } from '@/types/template';
import { TypeCard } from './components/TypeCard';
import { TemplateCard } from './components/TemplateCard';
import { NewTypeDialog } from './components/NewTypeDialog';
import { NewTemplateDialog } from './components/NewTemplateDialog';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';

interface TradePlanPageProps {
  spaceId?: string;
}

const TradePlanPage: React.FC<TradePlanPageProps> = ({ spaceId }) => {
  const navigate = useNavigate();
  const {
    types,
    templates,
    loading,
    error,
    fetchTypes,
    createType,
    deleteType,
    updateType,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    addItem,
    deleteItem,
  } = useTemplateStore();

  // UI state
  const [showNewTypeDialog, setShowNewTypeDialog] = useState(false);
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<{
    type: 'type' | 'template';
    id: string;
    name: string;
    templateCount?: number;
  } | null>(null);

  // Edit type state
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editTypeName, setEditTypeName] = useState('');
  const [editTypeColor, setEditTypeColor] = useState('');

  // Edit template name state
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editTemplateName, setEditTemplateName] = useState('');

  // New type form
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#22c55e');
  const [creatingType, setCreatingType] = useState(false);

  // New template form
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateTypeId, setNewTemplateTypeId] = useState('');
  const [newTemplateItems, setNewTemplateItems] = useState<
    { type: TemplateItemType; label: string }[]
  >([{ type: 'checkbox', label: '' }]);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  const [savingType, setSavingType] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!spaceId) return;
    fetchTypes(spaceId);
    fetchTemplates(spaceId);
  }, [spaceId, fetchTypes, fetchTemplates]);

  const filteredTemplates = selectedTypeFilter
    ? templates.filter((t) => t.typeId === selectedTypeFilter)
    : templates;

  const getTemplatesForType = (typeId: string) => templates.filter((t) => t.typeId === typeId);
  const getTypeColor = (typeId: string) => types.find((t) => t.id === typeId)?.color || '#22c55e';
  const getTypeName = (typeId: string) => types.find((t) => t.id === typeId)?.name || 'Unknown';

  // Loading state
  if (loading && types.length === 0 && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-green animate-spin" />
      </div>
    );
  }

  // Empty state
  if (!loading && types.length === 0 && templates.length === 0) {
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
          <p className="text-xs text-gray-500 mt-1 mb-4">Create a template type to get started</p>
          <Button
            onClick={() => setShowNewTypeDialog(true)}
            className="bg-green text-black hover:bg-green/90 font-bold"
          >
            <Plus className="w-4 h-4" /> New Type
          </Button>
        </div>
        <NewTypeDialog
          open={showNewTypeDialog}
          onOpenChange={setShowNewTypeDialog}
          name={newTypeName}
          onNameChange={setNewTypeName}
          color={newTypeColor}
          onColorChange={setNewTypeColor}
          onSave={async () => {
            if (!spaceId || !newTypeName.trim()) return;
            setCreatingType(true);
            try {
              await createType({ spaceId, name: newTypeName.trim(), color: newTypeColor });
              setShowNewTypeDialog(false);
              setNewTypeName('');
              setNewTypeColor('#22c55e');
            } catch {
              /* silent */
            } finally {
              setCreatingType(false);
            }
          }}
          saving={creatingType}
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

      {/* Template Types Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] font-bold text-text">Template Types</div>
          <Button onClick={() => setShowNewTypeDialog(true)} variant="ghost" size="sm">
            <Plus className="w-3.5 h-3.5" /> New Type
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {types.map((type) => (
            <TypeCard
              key={type.id}
              type={type}
              templateCount={getTemplatesForType(type.id).length}
              isEditing={editingTypeId === type.id}
              editName={editTypeName}
              editColor={editTypeColor}
              saving={savingType}
              onStartEdit={() => {
                setEditingTypeId(type.id);
                setEditTypeName(type.name);
                setEditTypeColor(type.color);
              }}
              onSaveEdit={async () => {
                if (!editingTypeId || !editTypeName.trim()) return;
                setSavingType(true);
                try {
                  await updateType(editingTypeId, {
                    name: editTypeName.trim(),
                    color: editTypeColor,
                  });
                  setEditingTypeId(null);
                } catch {
                  /* silent */
                } finally {
                  setSavingType(false);
                }
              }}
              onCancelEdit={() => setEditingTypeId(null)}
              onEditNameChange={setEditTypeName}
              onEditColorChange={setEditTypeColor}
              onDelete={() => {
                const count = getTemplatesForType(type.id).length;
                setConfirmingDelete({
                  type: 'type',
                  id: type.id,
                  name: type.name,
                  templateCount: count,
                });
              }}
            />
          ))}
        </div>
      </div>

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
          {/* Type filter tabs */}
          {types.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedTypeFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${selectedTypeFilter === null ? 'bg-green text-black' : 'bg-surface2 text-text2 hover:text-text'}`}
              >
                All ({templates.length})
              </button>
              {types.map((type) => {
                const count = getTemplatesForType(type.id).length;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedTypeFilter(type.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${selectedTypeFilter === type.id ? 'bg-green text-black' : 'bg-surface2 text-text2 hover:text-text'}`}
                  >
                    {type.name} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {filteredTemplates.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border rounded-lg">
              <LayoutTemplate className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-30" />
              <p className="text-xs text-gray-500">No templates in this category</p>
              <p className="text-[11px] text-gray-500 mt-1 opacity-60">
                Create your first template to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  typeName={getTypeName(template.typeId)}
                  typeColor={getTypeColor(template.typeId)}
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
                  onDelete={() =>
                    setConfirmingDelete({ type: 'template', id: template.id, name: template.name })
                  }
                  onAttach={() => navigate(`?newTrade&attach=${template.id}`, { replace: true })}
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
                />
              ))}
            </div>
          )}
        </PanelBody>
      </Panel>

      {/* Dialogs */}
      <NewTypeDialog
        open={showNewTypeDialog}
        onOpenChange={setShowNewTypeDialog}
        name={newTypeName}
        onNameChange={setNewTypeName}
        color={newTypeColor}
        onColorChange={setNewTypeColor}
        onSave={async () => {
          if (!spaceId || !newTypeName.trim()) return;
          setCreatingType(true);
          try {
            await createType({ spaceId, name: newTypeName.trim(), color: newTypeColor });
            setShowNewTypeDialog(false);
            setNewTypeName('');
            setNewTypeColor('#22c55e');
          } catch {
            /* silent */
          } finally {
            setCreatingType(false);
          }
        }}
        saving={creatingType}
      />

      <NewTemplateDialog
        open={showNewTemplateDialog}
        onOpenChange={setShowNewTemplateDialog}
        types={types}
        name={newTemplateName}
        onNameChange={setNewTemplateName}
        typeId={newTemplateTypeId}
        onTypeIdChange={setNewTemplateTypeId}
        items={newTemplateItems}
        onItemsChange={setNewTemplateItems}
        onCreateNewType={async (name) => {
          const newType = await createType({ spaceId: spaceId!, name, color: '#22c55e' });
          return newType;
        }}
        onSave={async () => {
          if (!spaceId || !newTemplateName.trim() || !newTemplateTypeId) return;
          const validItems = newTemplateItems.filter((i) => i.label.trim());
          if (validItems.length === 0) return;
          setCreatingTemplate(true);
          try {
            await createTemplate({
              spaceId,
              name: newTemplateName.trim(),
              typeId: newTemplateTypeId,
              items: validItems.map((item, idx) => ({
                type: item.type,
                label: item.label.trim(),
                order: idx,
              })),
            });
            setShowNewTemplateDialog(false);
            setNewTemplateName('');
            setNewTemplateTypeId('');
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
        title={`Delete ${confirmingDelete?.type === 'type' ? 'Type' : 'Template'}`}
        description={
          confirmingDelete?.type === 'type'
            ? `Are you sure you want to delete "${confirmingDelete?.name}"?${(confirmingDelete?.templateCount ?? 0) > 0 ? ` This type has ${confirmingDelete?.templateCount} template(s). You must delete them first.` : ''}`
            : `Are you sure you want to delete "${confirmingDelete?.name}"? This action cannot be undone.`
        }
        onConfirm={async () => {
          if (!confirmingDelete) return;
          setDeleting(true);
          try {
            if (confirmingDelete.type === 'type') {
              await deleteType(confirmingDelete.id);
              if (selectedTypeFilter === confirmingDelete.id) setSelectedTypeFilter(null);
            } else {
              await deleteTemplate(confirmingDelete.id);
              if (expandedTemplateId === confirmingDelete.id) setExpandedTemplateId(null);
            }
            setConfirmingDelete(null);
          } catch {
            /* silent */
          } finally {
            setDeleting(false);
          }
        }}
        deleting={deleting}
        deleteDisabled={
          confirmingDelete?.type === 'type' && (confirmingDelete?.templateCount ?? 0) > 0
        }
      />
    </div>
  );
};

export default TradePlanPage;
