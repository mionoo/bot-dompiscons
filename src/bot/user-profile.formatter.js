const statusDisplay = {
  active: '🟢 ACTIVE',
  needConfirm: '🟡 NEED CONFIRM',
  inactive: '🔴 INACTIVE',
};

const value = (input) => input || '-';

export function formatUserProfile(user, { title = '👤 INFORMASI AKUN', footer } = {}) {
  const role = user.role ? String(user.role).toUpperCase() : '-';
  const status = statusDisplay[user.status] ?? `⚪ ${String(user.status ?? '-').toUpperCase()}`;
  return [
    title,
    '━━━━━━━━━━━━━━━━━━━━',
    `👤 NAMA\n${value(user.name)}`,
    `🪪 NIK\n${value(user.nik)}`,
    `🔖 USERNAME\n${value(user.username)}`,
    `🏢 BRANCH\n${value(user.branch)}`,
    `💼 POSISI\n${role}`,
    `STATUS\n${status}`,
    footer,
  ].filter(Boolean).join('\n\n');
}

export function formatPendingConfirmation(user, number) {
  const role = user.role ? String(user.role).toUpperCase() : '-';
  const accountKey = user.nik ?? user.username;
  return [
    `${number}. ${value(user.name)}`,
    `   NIK: ${value(user.nik)}`,
    `   Branch: ${value(user.branch)}`,
    `   Posisi: ${role}`,
    `   Telegram ID: ${value(user.telegramChatId)}`,
    '',
    `   /acc_${accountKey}_${user.telegramChatId}`,
  ].join('\n');
}
