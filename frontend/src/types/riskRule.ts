export type RiskRuleName =
  | 'daily_drawdown'
  | 'max_position_size'
  | 'max_leverage'
  | 'correlated_exposure';

export type RiskRuleUnit = 'USD' | '%' | 'lots';

export interface RiskRule {
  id: string;
  userId: string;
  spaceId: string;
  name: RiskRuleName;
  value: number;
  unit: RiskRuleUnit;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRiskRulePayload {
  spaceId: string;
  name: RiskRuleName;
  value: number;
  unit?: RiskRuleUnit;
  enabled?: boolean;
}

export interface UpdateRiskRulePayload {
  name?: RiskRuleName;
  value?: number;
  unit?: RiskRuleUnit;
  enabled?: boolean;
}

export const RISK_RULE_META: Record<
  RiskRuleName,
  { label: string; description: string; defaultUnit: RiskRuleUnit }
> = {
  daily_drawdown: {
    label: 'Daily Drawdown Limit',
    description: 'Maximum acceptable loss in a single trading day',
    defaultUnit: 'USD',
  },
  max_position_size: {
    label: 'Max Position Size',
    description: 'Maximum size for any single position',
    defaultUnit: 'lots',
  },
  max_leverage: {
    label: 'Max Leverage',
    description: 'Maximum leverage allowed on any position',
    defaultUnit: '%',
  },
  correlated_exposure: {
    label: 'Correlated Exposure Limit',
    description: 'Maximum total exposure to correlated instruments',
    defaultUnit: 'USD',
  },
};
