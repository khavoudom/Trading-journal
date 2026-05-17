/** A single item in a template attached to a trade. */
export interface TemplateTradeItem {
  itemId: string;
  label: string;
  type: 'checkbox' | 'text' | 'number';
  checked: boolean;
  value: string | null;
}

/** A template attached to a trade with its check state. */
export interface TemplateTradeAttachment {
  templateId: string;
  templateName: string;
  typeName: string;
  items: TemplateTradeItem[];
}

/** A completed trade with computed profit and loss fields. */
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

/** Aggregated analytics computed from a set of trades. */
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
