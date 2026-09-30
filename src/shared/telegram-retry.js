const TRANSIENT_NETWORK_CODES = new Set([
  'ECONNRESET', 'ECONNREFUSED', 'EAI_AGAIN', 'ENETUNREACH', 'ENOTFOUND', 'ETIMEDOUT',
]);

export function retryDelayForTelegramError(error, retryNumber) {
  const retryAfter = error?.parameters?.retry_after;
  if (Number.isInteger(retryAfter) && retryAfter > 0) return retryAfter * 1000;
  if (!TRANSIENT_NETWORK_CODES.has(error?.code)) return null;
  return [2000, 5000, 10000][retryNumber - 1] ?? 10000;
}
