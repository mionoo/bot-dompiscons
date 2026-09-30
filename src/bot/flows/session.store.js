const sessions = new Map();

export function getSession(chatId) {
  const session = sessions.get(String(chatId));
  if (session?.expiresAt && session.expiresAt <= Date.now()) {
    sessions.delete(String(chatId));
    return undefined;
  }
  return session;
}
export function setSession(chatId, value) { sessions.set(String(chatId), { ...value, expiresAt: Date.now() + 15 * 60_000 }); }
export function clearSession(chatId) { sessions.delete(String(chatId)); }
