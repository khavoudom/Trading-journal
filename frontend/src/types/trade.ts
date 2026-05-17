// Keep in sync with server/src/types/space.ts and server/src/types/trade.ts
export interface Space {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface TemplateTradeItem {
  itemId: string;
  label: string;
  type: 'checkbox' | 'text' | 'number';
  checked: boolean;
  value: string | null;
}

export interface TemplateTradeAttachment {
  templateId: string;
  templateName: string;
  typeName: string;
  items: TemplateTradeItem[];
}

// Keep in sync with server/src/types/trade.ts
export interface Trade {
  id: string;
  instrument: string;
  side: 'Long' | 'Short';
  strategy: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTime: string;
  exitTime: string;
  profitLoss: number;
  profitLossPercent: number;
  tags: string[];
  notes?: string;
  screenshots?: string[];
  emotion?: string;
  planData?: TemplateTradeAttachment[];
  setupData?: TemplateTradeAttachment[];
  spaceId: string;
  status?: 'pending' | 'running' | 'closed';
}

// Keep in sync with server/src/types/trade.ts
export interface TradeFormValues {
  instrument: string;
  side: 'Long' | 'Short';
  strategy: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTime: string;
  exitTime: string;
  tags: string[];
  notes?: string;
  screenshots?: string[];
  emotion?: string;
  planData?: TemplateTradeAttachment[];
  setupData?: TemplateTradeAttachment[];
  spaceId: string;
  status?: 'pending' | 'running' | 'closed';
}

// Keep in sync with server/src/types/plan.ts
export interface PlanData {
  checklist: string[];
  coreRules: string[];
  tradingSetup: string[];
  mistakes: string[];
  identity: string[];
}

export const DEFAULT_SETUP_STEPS = [
  'Follow the trend first — trade with the trend',
  'Find the key level — support/resistance zone',
  'Watch CVD at the key level for reaction',
  'Wait for FVG confirmation before entry',
  'Supply & demand zone adds extra confirmation',
  'All required parts present: Trend + Key Level + CVD + FVG',
];

// Keep in sync with server/src/types/event.ts
export interface DayEvent {
  id: string;
  userId: string;
  spaceId: string;
  date: string; // yyyy-MM-dd
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Keep in sync with server/src/types/trade.ts
export interface AnalyticsSummary {
  totalTrades: number;
  winRate: number;
  winningTrades: number;
  losingTrades: number;
  totalProfitLoss: number;
  averageProfitLoss: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
}
