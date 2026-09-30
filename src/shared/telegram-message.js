const MAX_TELEGRAM_TEXT_LENGTH = 3800;

export function splitTelegramMessage(text) {
  const parts = [];
  let remaining = text;
  while (remaining.length > MAX_TELEGRAM_TEXT_LENGTH) {
    let at = remaining.lastIndexOf('\n', MAX_TELEGRAM_TEXT_LENGTH);
    if (at < MAX_TELEGRAM_TEXT_LENGTH * 0.6) at = remaining.lastIndexOf(' ', MAX_TELEGRAM_TEXT_LENGTH);
    if (at < 1) at = MAX_TELEGRAM_TEXT_LENGTH;
    parts.push(remaining.slice(0, at).trim());
    remaining = remaining.slice(at).trim();
  }
  if (remaining) parts.push(remaining);
  return parts;
}
