import { useState } from 'react';
import type { RiskRuleName, RiskRuleUnit } from '@/types/riskRule';
import { RISK_RULE_META } from '@/types/riskRule';
import {
  TrendingDown,
  Maximize2,
  Sliders,
  PieChart,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from './Switch';
import { formatUSD } from '@/utils/format';

const RULE_ICONS: Record<RiskRuleName, React.ReactNode> = {
  daily_drawdown: <TrendingDown className="w-4 h-4" />,
  max_position_size: <Maximize2 className="w-4 h-4" />,
  max_leverage: <Sliders className="w-4 h-4" />,
  correlated_exposure: <PieChart className="w-4 h-4" />,
};

const RULE_COLORS: Record<RiskRuleName, string> = {
  daily_drawdown: 'orange',
  max_position_size: 'blue',
  max_leverage: 'purple',
  correlated_exposure: 'green',
};

const UNIT_OPTIONS: { value: RiskRuleUnit; label: string }[] = [
  { value: 'USD', label: 'USD' },
  { value: '%', label: 'Percent' },
  { value: 'lots', label: 'Lots' },
];

function formatUnitValue(value: number, unit: RiskRuleUnit): string {
  if (unit === '%') return `${value}%`;
  if (unit === 'USD') return formatUSD(value);
  return `${value} lots`;
}

interface Rule {
  id: string;
  name: string;
  value: number;
  unit: string;
  enabled: boolean;
}

export function RuleListItem({
  rule,
  onUpdate,
  onDelete,
}: {
  rule: Rule;
  onUpdate: (
    id: string,
    data: { value?: number; unit?: RiskRuleUnit; enabled?: boolean },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const ruleName = rule.name as RiskRuleName;
  const meta = RISK_RULE_META[ruleName];
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editValue, setEditValue] = useState(String(rule.value));
  const [editUnit, setEditUnit] = useState<RiskRuleUnit>(rule.unit as RiskRuleUnit);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const color = RULE_COLORS[ruleName];

  const colorMap: Record<string, string> = {
    green: 'text-green bg-green-subtle',
    blue: 'text-blue bg-blue-subtle',
    orange: 'text-orange bg-orange-subtle',
    purple: 'text-purple bg-purple-subtle',
  };

  const handleSaveEdit = async () => {
    if (!editValue || parseFloat(editValue) <= 0) return;
    setEditSubmitting(true);
    try {
      await onUpdate(rule.id, { value: parseFloat(editValue), unit: editUnit });
      setIsEditing(false);
    } catch {
      // silent
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteSubmitting(true);
    try {
      await onDelete(rule.id);
      setIsConfirmingDelete(false);
    } catch {
      // silent
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
        rule.enabled ? 'bg-surface2' : 'bg-surface2/50'
      } border border-border`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            colorMap[color]
          } ${!rule.enabled && 'opacity-40'}`}
        >
          {RULE_ICONS[ruleName]}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${rule.enabled ? 'text-text' : 'text-text2'}`}>
              {meta.label}
            </span>
            {!rule.enabled && <span className="text-[10px] text-gray-500">(paused)</span>}
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2 mt-1.5">
              <Input
                type="number"
                step="any"
                min="0.01"
                className="h-7 w-24 text-xs"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              <Select value={editUnit} onValueChange={(v) => setEditUnit(v as RiskRuleUnit)}>
                <SelectTrigger className="h-7 w-20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <span
              className={`text-[11px] font-mono font-bold mt-0.5 block ${
                rule.enabled ? 'text-text' : 'text-text2'
              }`}
            >
              {formatUnitValue(rule.value, rule.unit as RiskRuleUnit)}
              <span className="text-text2 font-normal ml-1 text-[10px]">{meta.description}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-orange whitespace-nowrap">Delete?</span>
            <button
              onClick={handleConfirmDelete}
              disabled={deleteSubmitting}
              className="w-6 h-6 rounded flex items-center justify-center text-orange hover:bg-orange-subtle transition-colors cursor-pointer"
            >
              {deleteSubmitting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={() => setIsConfirmingDelete(false)}
              className="w-6 h-6 rounded flex items-center justify-center text-text2 hover:bg-surface transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : isEditing ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSaveEdit}
              disabled={editSubmitting}
              className="w-6 h-6 rounded flex items-center justify-center text-green hover:bg-green-subtle transition-colors cursor-pointer"
            >
              {editSubmitting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="w-6 h-6 rounded flex items-center justify-center text-text2 hover:bg-surface transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="w-6 h-6 rounded flex items-center justify-center text-text2 hover:bg-surface transition-colors cursor-pointer"
              title="Edit"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="w-6 h-6 rounded flex items-center justify-center text-text2 hover:bg-orange-subtle hover:text-orange transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <Switch
              checked={rule.enabled}
              onCheckedChange={() => onUpdate(rule.id, { enabled: !rule.enabled })}
            />
          </>
        )}
      </div>
    </div>
  );
}
