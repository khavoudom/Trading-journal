import { useState } from 'react';
import type { RiskRuleName } from '@/types/riskRule';
import { RISK_RULE_META } from '@/types/riskRule';
import { Check, Loader2 } from 'lucide-react';
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

interface AddRuleFormProps {
  types: [RiskRuleName, (typeof RISK_RULE_META)[RiskRuleName]][];
  onSave: (name: RiskRuleName, value: number) => Promise<void>;
  onCancel: () => void;
}

export function AddRuleForm({ types, onSave, onCancel }: AddRuleFormProps) {
  const [ruleName, setRuleName] = useState<RiskRuleName>('daily_drawdown');
  const [ruleValue, setRuleValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!ruleValue || parseFloat(ruleValue) <= 0) return;
    setSubmitting(true);
    try {
      await onSave(ruleName, parseFloat(ruleValue));
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-surface2 mb-3 animate-fade-in">
      <div className="text-xs font-bold text-text mb-3">New Risk Rule</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div className="space-y-1.5">
          <Label className="text-[11px]">Rule Type</Label>
          <Select value={ruleName} onValueChange={(v) => setRuleName(v as RiskRuleName)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {types.map(([key, meta]) => (
                <SelectItem key={key} value={key}>
                  {meta.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px]">Value</Label>
          <Input
            type="number"
            step="any"
            min="0.01"
            placeholder="0.00"
            value={ruleValue}
            onChange={(e) => setRuleValue(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px]">Unit</Label>
          <div className="h-9 flex items-center text-xs text-text2 px-3 rounded-lg border border-border bg-surface">
            {RISK_RULE_META[ruleName].defaultUnit}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSave}
          disabled={submitting || !ruleValue || parseFloat(ruleValue) <= 0}
          size="sm"
          className="bg-green text-black hover:bg-green/90 font-bold"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
