export function formatUSD(
  value: number,
  options?: { showSign?: boolean; decimals?: number },
): string {
  const { showSign = false, decimals = 0 } = options ?? {};
  const sign = value >= 0 ? (showSign ? '+' : '') : '-';
  const abs = Math.abs(value);
  return `${sign}${abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} USD`;
}
