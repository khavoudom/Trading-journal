/** Shape of the trading plan content stored per user per space. */
export interface PlanContent {
  checklist: string[];
  coreRules: string[];
  tradingSetup: string[];
  mistakes: string[];
  identity: string[];
}

export const PLAN_TEMPLATES = [
  'checklist',
  'coreRules',
  'tradingSetup',
  'mistakes',
  'identity',
] as const;
export type PlanTemplate = (typeof PLAN_TEMPLATES)[number];

/** Default trading plan used when a user has not customized their plan. */
export const DEFAULT_PLAN: PlanContent = {
  checklist: [
    'Is my setup valid?',
    'Am I guessing or following my system?',
    'Am I emotional right now?',
    'Did I check my risk?',
    'Do I know my stop loss?',
    'Do I know my take profit target?',
    'Am I trusting my system more than outside opinions?',
    'Would I still take this trade if nobody else talked about it?',
    'If the answer is unclear, skip the trade.',
  ],
  coreRules: [
    'Follow the Plan: Do not change your decision because of emotion.',
    "Don't Guess: Only trade when your setup appears.",
    'Trust Your System: Your system makes the final decision.',
    'Checklist Required: If any checklist item is missing, skip the trade.',
  ],
  tradingSetup: [
    'Follow the trend first. Trade with the trend.',
    'Find the key level. Mark important support/resistance.',
    'Watch CVD at the key level for confirmation.',
    'Wait for FVG confirmation before entry.',
    'Supply & demand zones add extra confirmation.',
    'Trend + key level + CVD + FVG = valid setup.',
  ],
  mistakes: [
    'Guessing market direction.',
    'Entering without a valid setup.',
    'Trusting others more than the system.',
    'Breaking the plan because of emotion.',
    'Ignoring the checklist.',
  ],
  identity: [
    'Follow the trading plan.',
    'Wait for your setup.',
    'Execute only when the system confirms.',
    'Respect risk management.',
    'Complete the checklist before every trade.',
    'Accept losses as part of the process.',
    'Protect your capital first.',
    'Stay disciplined even when the market is tempting.',
  ],
};
