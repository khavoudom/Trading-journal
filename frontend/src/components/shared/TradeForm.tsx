import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  X,
  Save,
  Trash2,
  TrendingUp,
  CheckCircle2,
  Circle,
  LayoutTemplate,
  CheckSquare,
  Type,
  Hash,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import type { TradeFormValues, TemplateTradeAttachment, TemplateTradeItem } from '@/types/trade';
import { INSTRUMENTS, INSTRUMENT_PRICE_RANGES, CONTRACT_SIZES } from '@/constants/instruments';
import { useTemplateStore } from '@/store/templateStore';
import { formatUSD } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface TradeFormProps {
  spaceId: string;
  onSubmit: (data: TradeFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialData?: Partial<TradeFormValues>;
  title?: string;
  prefillDate?: string;
}

const formatDateForInput = (dateString?: string) => {
  if (!dateString) {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
  try {
    const date = new Date(dateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  } catch {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
};

const EMOTIONS = [
  {
    value: 'confident',
    label: 'Confident',
    activeClass: 'bg-green text-black',
    inactiveClass: 'text-text2 border-border hover:border-green hover:text-green',
  },
  {
    value: 'neutral',
    label: 'Neutral',
    activeClass: 'bg-surface2 text-text',
    inactiveClass: 'text-text2 border-border',
  },
  {
    value: 'focused',
    label: 'Focused',
    activeClass: 'bg-blue text-white',
    inactiveClass: 'text-text2 border-border hover:border-blue hover:text-blue',
  },
  {
    value: 'patient',
    label: 'Patient',
    activeClass: 'bg-purple text-white',
    inactiveClass: 'text-text2 border-border hover:border-purple hover:text-purple',
  },
  {
    value: 'anxious',
    label: 'Anxious',
    activeClass: 'bg-orange text-white',
    inactiveClass: 'text-text2 border-border hover:border-orange hover:text-orange',
  },
  {
    value: 'tired',
    label: 'Tired',
    activeClass: 'bg-muted text-text',
    inactiveClass: 'text-text2 border-border',
  },
  {
    value: 'rushed',
    label: 'Rushed',
    activeClass: 'bg-orange text-white',
    inactiveClass: 'text-text2 border-border hover:border-orange hover:text-orange',
  },
  {
    value: 'impulsive',
    label: 'Impulsive',
    activeClass: 'bg-orange text-white',
    inactiveClass: 'text-text2 border-border hover:border-orange hover:text-orange',
  },
];

const ITEM_TYPE_ICONS: Record<string, React.ReactNode> = {
  checkbox: <CheckSquare className="w-3.5 h-3.5" />,
  text: <Type className="w-3.5 h-3.5" />,
  number: <Hash className="w-3.5 h-3.5" />,
};

const TradeForm: React.FC<TradeFormProps> = ({
  spaceId,
  onSubmit,
  onCancel,
  onDelete,
  initialData,
  title = 'New Trade',
  prefillDate,
}) => {
  const defaultEntryTime = prefillDate
    ? formatDateForInput(prefillDate + 'T09:00:00')
    : formatDateForInput(initialData?.entryTime);

  const defaultExitTime = prefillDate
    ? formatDateForInput(prefillDate + 'T17:00:00')
    : formatDateForInput(initialData?.exitTime);

  // Template state — fetch all templates and show only attached
  const { templates, loading: templatesLoading, fetchTemplates } = useTemplateStore();
  const [templateAttachments, setTemplateAttachments] = useState<TemplateTradeAttachment[]>([]);
  const [collapsedTemplates, setCollapsedTemplates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTemplates(spaceId);
  }, [spaceId, fetchTemplates]);

  // Build template attachments from attached templates + existing checked state
  useEffect(() => {
    const existing = (initialData?.planData as TemplateTradeAttachment[]) || [];
    const existingByTemplateId = new Map(existing.map((e) => [e.templateId, e]));

    // Show templates that are attached (in DB) OR already attached to this trade
    const visibleIds = new Set([
      ...templates.filter((t) => t.isAttached).map((t) => t.id),
      ...existing.map((e) => e.templateId),
    ]);

    const attachments: TemplateTradeAttachment[] = templates
      .filter((tmpl) => visibleIds.has(tmpl.id))
      .map((tmpl) => {
        const existingAttachment = existingByTemplateId.get(tmpl.id);
        return {
          templateId: tmpl.id,
          templateName: tmpl.name,
          items: tmpl.items.map((item) => {
            const existingItem = existingAttachment?.items.find((i) => i.itemId === item.id);
            return {
              itemId: item.id,
              label: item.label,
              type: item.type as 'checkbox' | 'text' | 'number',
              checked: existingItem?.checked ?? false,
              value: item.value ?? null,
            };
          }),
        };
      });

    setTemplateAttachments(attachments);
  }, [templates]); // eslint-disable-line react-hooks/exhaustive-deps

  const allCheckboxesChecked = (items: TemplateTradeItem[]) => {
    const checkboxes = items.filter((i) => i.type === 'checkbox');
    return checkboxes.length > 0 && checkboxes.every((i) => i.checked);
  };

  const checkboxProgress = (items: TemplateTradeItem[]) => {
    const checkboxes = items.filter((i) => i.type === 'checkbox');
    if (checkboxes.length === 0) return 100;
    return Math.round((checkboxes.filter((i) => i.checked).length / checkboxes.length) * 100);
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TradeFormValues>({
    defaultValues: {
      instrument: '',
      side: 'Long',
      strategy: 'Swing Trading',
      entryPrice: 0,
      exitPrice: 0,
      quantity: 0,
      entryTime: defaultEntryTime,
      exitTime: defaultExitTime,
      tags: [],
      notes: '',
      emotion: 'neutral',
      planData: [],
      status: 'pending',
      ...initialData,
    },
  });

  const entryPrice = watch('entryPrice');
  const exitPrice = watch('exitPrice');
  const quantity = watch('quantity');
  const side = watch('side');
  const emotion = watch('emotion');
  const instrument = watch('instrument');
  const strategy = watch('strategy');
  const entryTime = watch('entryTime');
  const exitTime = watch('exitTime');
  const status = watch('status');

  const priceRange = instrument ? INSTRUMENT_PRICE_RANGES[instrument] : null;
  const contractSize = instrument ? CONTRACT_SIZES[instrument] : 1;

  const validatePrice = (value: number) => {
    if (!instrument) return 'Select an instrument first';
    const range = INSTRUMENT_PRICE_RANGES[instrument];
    if (!range) return true;
    if (value <= 0) return 'Price must be positive';
    if (value < range.min) return `Minimum ${range.label} price is ${range.min}`;
    if (value > range.max) return `Maximum ${range.label} price is ${range.max}`;
    return true;
  };

  const isFutureTrade = exitTime ? new Date(exitTime) > new Date() : false;

  // Auto-select pending for future trades
  useEffect(() => {
    if (isFutureTrade && status !== 'pending') {
      setValue('status', 'pending');
    }
  }, [isFutureTrade]); // eslint-disable-line react-hooks/exhaustive-deps

  const priceDiff = side === 'Long' ? exitPrice - entryPrice : entryPrice - exitPrice;
  const profitLoss = priceDiff * quantity * contractSize;
  const profitLossPercent = entryPrice > 0 ? (priceDiff / entryPrice) * 100 : 0;
  const isWin = profitLoss > 0;

  const handleFormSubmit = (data: TradeFormValues) => {
    const status = data.status === 'closed' && isFutureTrade ? 'pending' : data.status || 'pending';
    onSubmit({ ...data, planData: templateAttachments, status });
  };

  const inputErrorClass =
    'border-orange/50 focus-visible:border-orange focus-visible:ring-orange/30';

  return (
    <Card className="animate-fade-in bg-surface/10 border-border/60 shadow-lg shadow-black/10">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-green" />
            <span className="text-base font-semibold">{title}</span>
          </CardTitle>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-md text-text2 hover:text-text hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-5 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instrument */}
            <div className="space-y-1.5">
              <Label>Instrument</Label>
              <Select
                value={instrument || undefined}
                onValueChange={(v) => v && setValue('instrument', v, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select instrument..." />
                </SelectTrigger>
                <SelectContent>
                  {INSTRUMENTS.map((inst) => (
                    <SelectItem key={inst} value={inst}>
                      {inst} — {INSTRUMENT_PRICE_RANGES[inst].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.instrument && (
                <p className="text-[11px] text-orange">{errors.instrument.message}</p>
              )}
              {instrument && (
                <p className="text-[10px] text-text2">
                  Price range: {priceRange?.min.toLocaleString()} –{' '}
                  {priceRange?.max.toLocaleString()}
                </p>
              )}
            </div>

            {/* Side Toggle */}
            <div className="space-y-1.5">
              <Label>Side</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('side', 'Long')}
                  className={`h-9 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    side === 'Long'
                      ? 'bg-green text-black'
                      : 'border border-border text-text2 hover:border-green hover:text-green'
                  }`}
                >
                  Long
                </button>
                <button
                  type="button"
                  onClick={() => setValue('side', 'Short')}
                  className={`h-9 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    side === 'Short'
                      ? 'bg-orange text-white'
                      : 'border border-border text-text2 hover:border-orange hover:text-orange'
                  }`}
                >
                  Short
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('status', 'pending')}
                  className={`h-9 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    (status || 'pending') === 'pending'
                      ? 'bg-blue text-white'
                      : 'border border-border text-text2 hover:border-blue hover:text-blue'
                  }`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => !isFutureTrade && setValue('status', 'running')}
                  className={`h-9 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    isFutureTrade
                      ? 'border border-border/40 text-text2/40 cursor-not-allowed'
                      : status === 'running'
                        ? 'bg-purple text-white'
                        : 'border border-border text-text2 hover:border-purple hover:text-purple'
                  }`}
                  title={isFutureTrade ? 'Set exit time to present to mark running' : ''}
                >
                  Running
                </button>
                <button
                  type="button"
                  onClick={() => !isFutureTrade && setValue('status', 'closed')}
                  className={`h-9 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    isFutureTrade
                      ? 'border border-border/40 text-text2/40 cursor-not-allowed'
                      : status === 'closed'
                        ? 'bg-green text-black'
                        : 'border border-border text-text2 hover:border-green hover:text-green'
                  }`}
                  title={isFutureTrade ? 'Cannot close a future trade' : ''}
                >
                  Closed
                </button>
              </div>
            </div>

            {/* Strategy */}
            <div className="space-y-1.5">
              <Label>Strategy</Label>
              <Select value={strategy} onValueChange={(v) => v && setValue('strategy', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Swing Trading', 'Day Trading', 'Scalping', 'Position Trading'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label>Quantity (lots)</Label>
              <Input
                type="number"
                step="any"
                min="0.01"
                className={errors.quantity ? inputErrorClass : ''}
                {...register('quantity', {
                  valueAsNumber: true,
                  required: 'Required',
                  min: { value: 0.01, message: 'Minimum 0.01' },
                })}
              />
              {errors.quantity && (
                <p className="text-[11px] text-orange">{errors.quantity.message}</p>
              )}
            </div>

            {/* Entry Price */}
            <div className="space-y-1.5">
              <Label>Entry Price</Label>
              <Input
                type="number"
                step="any"
                min="0"
                className={`font-mono ${errors.entryPrice ? inputErrorClass : ''}`}
                {...register('entryPrice', {
                  valueAsNumber: true,
                  required: 'Required',
                  validate: (v) => validatePrice(v),
                })}
              />
              {errors.entryPrice && (
                <p className="text-[11px] text-orange">{errors.entryPrice.message as string}</p>
              )}
            </div>

            {/* Exit Price */}
            <div className="space-y-1.5">
              <Label>Exit Price</Label>
              <Input
                type="number"
                step="any"
                min="0"
                className={`font-mono ${errors.exitPrice ? inputErrorClass : ''}`}
                {...register('exitPrice', {
                  valueAsNumber: true,
                  required: 'Required',
                  validate: (v) => validatePrice(v),
                })}
              />
              {errors.exitPrice && (
                <p className="text-[11px] text-orange">{errors.exitPrice.message as string}</p>
              )}
            </div>

            {/* Entry Time */}
            <div className="space-y-1.5">
              <Label>Entry Time</Label>
              <Input
                type="datetime-local"
                value={entryTime}
                onChange={(e) => setValue('entryTime', e.target.value)}
              />
            </div>

            {/* Exit Time */}
            <div className="space-y-1.5">
              <Label>Exit Time</Label>
              <Input
                type="datetime-local"
                value={exitTime}
                onChange={(e) => setValue('exitTime', e.target.value)}
              />
            </div>
          </div>

          {/* ---- Template Checklists Section ---- */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-green" />
              <span className="text-xs font-medium text-text2">
                Trade Plan ({templateAttachments.length} templates)
              </span>
            </div>

            {templatesLoading && templateAttachments.length === 0 ? (
              <div className="flex items-center justify-center h-16">
                <Loader2 className="w-4 h-4 text-green animate-spin" />
              </div>
            ) : templateAttachments.length === 0 ? (
              <div className="flex items-center justify-center h-16 border border-dashed border-border rounded-lg">
                <span className="text-[11px] text-gray-500">
                  No templates defined. Create templates on the Templates page.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {templateAttachments.map((attachment) => {
                  const progress = checkboxProgress(attachment.items);
                  const allChecked = allCheckboxesChecked(attachment.items);
                  const checkboxCount = attachment.items.filter(
                    (i) => i.type === 'checkbox',
                  ).length;
                  const checkedCount = attachment.items.filter(
                    (i) => i.type === 'checkbox' && i.checked,
                  ).length;
                  const isCollapsed = collapsedTemplates[attachment.templateId] ?? false;

                  return (
                    <div
                      key={attachment.templateId}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      {/* Template header */}
                      <div className="flex items-center justify-between px-3 py-2.5 bg-surface2">
                        <button
                          type="button"
                          onClick={() =>
                            setCollapsedTemplates((prev) => ({
                              ...prev,
                              [attachment.templateId]: !(prev[attachment.templateId] ?? false),
                            }))
                          }
                          className="flex items-center gap-2 min-w-0 flex-1"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-text2 transition-transform ${
                              isCollapsed ? '-rotate-90' : ''
                            }`}
                          />
                          <span className="text-xs font-semibold text-text">
                            {attachment.templateName}
                          </span>
                          {checkboxCount > 0 && (
                            <span
                              className={`text-[10px] font-mono shrink-0 ${
                                allChecked ? 'text-green' : 'text-text2'
                              }`}
                            >
                              {checkedCount}/{checkboxCount}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Items */}
                      {!isCollapsed && (
                        <div className="px-3 py-2 bg-surface">
                          <div className="space-y-0.5">
                            {attachment.items.map((item) => (
                              <div
                                key={item.itemId}
                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-surface2 transition-colors"
                              >
                                {item.type === 'checkbox' ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setTemplateAttachments((prev) =>
                                          prev.map((at) =>
                                            at.templateId === attachment.templateId
                                              ? {
                                                  ...at,
                                                  items: at.items.map((i) =>
                                                    i.itemId === item.itemId
                                                      ? { ...i, checked: !i.checked }
                                                      : i,
                                                  ),
                                                }
                                              : at,
                                          ),
                                        )
                                      }
                                      className="shrink-0 cursor-pointer"
                                    >
                                      {item.checked ? (
                                        <CheckCircle2 className="w-4 h-4 text-green" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-text2" />
                                      )}
                                    </button>
                                    <span
                                      className={`text-xs prose prose-invert max-w-none [&_*]:!text-xs ${
                                        item.checked
                                          ? 'text-green line-through opacity-80'
                                          : 'text-text2'
                                      }`}
                                      dangerouslySetInnerHTML={{ __html: item.label }}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <span className="text-gray-500 shrink-0">
                                      {ITEM_TYPE_ICONS[item.type]}
                                    </span>
                                    <span
                                      className="text-xs text-text2 prose prose-invert max-w-none [&_*]:!text-xs"
                                      dangerouslySetInnerHTML={{ __html: item.label }}
                                    />
                                    {item.value && (
                                      <span className="text-[10px] text-gray-500 font-mono ml-auto">
                                        {item.value}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          {checkboxCount > 0 && (
                            <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all bg-green`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Emotion / Mindset */}
          <div className="space-y-1.5">
            <Label>Mindset</Label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((em) => (
                <button
                  key={em.value}
                  type="button"
                  onClick={() => setValue('emotion', em.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    emotion === em.value
                      ? em.activeClass + ' ring-2 ring-ring/50'
                      : em.inactiveClass
                  }`}
                >
                  {em.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <textarea
              {...register('notes')}
              className="h-24 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-gray-500-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none dark:bg-input/30"
              placeholder="Describe your reasoning, emotions, and lessons learned..."
            />
          </div>
        </CardContent>

        {/* P&L Preview + Actions */}
        <CardFooter className="flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-border mt-2">
          <div>
            <span className="text-[11px] text-text2 block">Estimated P&L</span>
            {status === 'closed' || (!status && !initialData?.status) ? (
              <span
                className={`text-lg font-semibold font-mono ${isWin ? 'text-green' : 'text-orange'}`}
              >
                {formatUSD(profitLoss, { showSign: true, decimals: 2 })}
                <span className="text-xs ml-2 opacity-70">({profitLossPercent.toFixed(2)}%)</span>
              </span>
            ) : (
              <span className="text-lg font-semibold font-mono text-text2">—</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-end">
            {onDelete && (
              <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-green text-black hover:bg-green/90 font-bold"
            >
              <Save className="w-3.5 h-3.5" />
              {onDelete ? 'Update' : 'Save'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TradeForm;
