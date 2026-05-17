import { useState, useEffect } from 'react';
import { Shield, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Panel, PanelHeader, PanelBody } from '@/components/ui/panel';
import { Button } from '@/components/ui/Button';
import { useRiskRuleStore } from '@/store/riskRuleStore';
import type { RiskRuleName, RiskRuleUnit } from '@/types/riskRule';
import { RISK_RULE_META } from '@/types/riskRule';
import { RiskOverviewCard } from './components/RiskOverviewCard';
import { RuleListItem } from './components/RuleListItem';
import { AddRuleForm } from './components/AddRuleForm';

interface RiskManagerPageProps {
  spaceId: string;
}

const ruleTypes = Object.entries(RISK_RULE_META) as [
  RiskRuleName,
  (typeof RISK_RULE_META)[RiskRuleName],
][];

const RiskManagerPage: React.FC<RiskManagerPageProps> = ({ spaceId }) => {
  const { rules, loading, fetchRules, addRule, updateRule, removeRule } = useRiskRuleStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchRules(spaceId).catch(() => setFetchError('Failed to load risk rules'));
  }, [spaceId, fetchRules]);

  const handleAddRule = async (name: RiskRuleName, value: number) => {
    const meta = RISK_RULE_META[name];
    await addRule({
      spaceId,
      name,
      value,
      unit: meta.defaultUnit,
      enabled: true,
    });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div
          className="text-[22px] font-extrabold tracking-[-0.5px] text-text flex items-center gap-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Risk Manager
          <span className="text-xs font-medium text-text2 bg-surface2 px-2.5 py-1 rounded-full">
            {rules.filter((r) => r.enabled).length} active rules
          </span>
        </div>
        <div className="text-[13px] text-text2 mt-0.5">
          Define risk parameters to monitor and control your trading exposure
        </div>
      </div>

      {/* Risk Overview */}
      <div>
        <div className="text-[13px] font-bold text-text mb-3">Risk Overview</div>
        {loading && rules.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="w-5 h-5 text-green animate-spin" />
          </div>
        ) : fetchError ? (
          <div className="flex items-center justify-center h-20 gap-2 text-xs text-orange">
            <AlertCircle className="w-4 h-4" />
            {fetchError}
          </div>
        ) : rules.length === 0 ? (
          <div className="flex items-center justify-center h-24 border border-dashed border-border rounded-lg">
            <span className="text-xs text-gray-500">
              No risk rules defined. Create one below to start monitoring.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {rules.map((rule) => (
              <RiskOverviewCard
                key={rule.id}
                name={rule.name as RiskRuleName}
                value={rule.value}
                unit={rule.unit as RiskRuleUnit}
                enabled={rule.enabled}
              />
            ))}
          </div>
        )}
      </div>

      {/* Risk Rules Management */}
      <Panel>
        <PanelHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="text-[13px] font-bold text-text">Risk Rules</div>
              <div className="text-[11px] text-text2">
                Define and manage your risk management parameters
              </div>
            </div>
            {!showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                size="sm"
                className="bg-green text-black hover:bg-green/90 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Rule
              </Button>
            )}
          </div>
        </PanelHeader>
        <PanelBody>
          {loading && rules.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-green animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {showAddForm && (
                <AddRuleForm
                  types={ruleTypes}
                  onSave={handleAddRule}
                  onCancel={() => setShowAddForm(false)}
                />
              )}

              {rules.length === 0 && !showAddForm ? (
                <div className="py-12 text-center border border-dashed border-border rounded-lg">
                  <Shield className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-30" />
                  <p className="text-xs text-gray-500">No risk rules defined</p>
                  <p className="text-[11px] text-gray-500 mt-1 opacity-60">
                    Create your first rule to start managing risk
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {rules.map((rule) => (
                    <RuleListItem
                      key={rule.id}
                      rule={rule}
                      onUpdate={(id, data) => updateRule(id, data)}
                      onDelete={(id) => removeRule(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </PanelBody>
      </Panel>
    </div>
  );
};

export default RiskManagerPage;
