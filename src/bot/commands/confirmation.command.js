import { User } from '../../modules/users/user.model.js';
import { sendNotification } from '../../modules/notifications/notification.service.js';
import { formatPendingConfirmation, formatUserProfile } from '../user-profile.formatter.js';

const MAX_MESSAGE_LENGTH = 3500;

export function parseApprovalCommand(text) {
  const value = text.trim().replace(/^\/acc_/, '');
  const separator = value.lastIndexOf('_');
  if (separator < 1 || separator === value.length - 1) return null;
  return {
    accountKey: value.slice(0, separator),
    telegramChatId: value.slice(separator + 1),
  };
}

function chunkLines(lines) {
  const chunks = [];
  let current = '';
  for (const line of lines) {
    if (current && current.length + line.length + 1 > MAX_MESSAGE_LENGTH) {
      chunks.push(current);
      current = '';
    }
    current += `${current ? '\n' : ''}${line}`;
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function cekConfirmCommand(ctx) {
  const users = await User.find({ status: 'needConfirm' })
    .select('nik username name branch role telegramChatId')
    .sort({ createdAt: 1 })
    .lean();
  if (!users.length) return ctx.reply('Tidak ada akun dengan status needConfirm.');

  const lines = users.map((user, index) => formatPendingConfirmation(user, index + 1));
  const chunks = chunkLines(lines);
  for (const [index, chunk] of chunks.entries()) {
    const title = chunks.length > 1 ? `🟡 MENUNGGU KONFIRMASI (${index + 1}/${chunks.length})` : '🟡 MENUNGGU KONFIRMASI';
    await ctx.reply(`${title}\n\n${chunk}`);
  }
  await ctx.reply('Gunakan command di bawah setiap akun untuk mengaktifkannya.');
}

export async function approveCommand(ctx) {
  const target = parseApprovalCommand(ctx.message.text);
  if (!target) return ctx.reply('Format salah. Gunakan /acc_nik_telegramId\nContoh: /acc_19930270_68619032');

  const user = await User.findOneAndUpdate(
    {
      status: 'needConfirm',
      telegramChatId: target.telegramChatId,
      $or: [{ nik: target.accountKey }, { username: target.accountKey }],
    },
    { status: 'active' },
    { new: true },
  );
  if (!user) return ctx.reply('Akun needConfirm dengan NIK/username dan Telegram ID tersebut tidak ditemukan.');
  let notificationSent = true;
  try {
    await sendNotification({
      chatId: user.telegramChatId,
      message: formatUserProfile(user, {
        title: '✅ AKUN ANDA SUDAH AKTIF',
        footer: 'Akun Anda telah dikonfirmasi admin dan sudah dapat menerima notifikasi bot.',
      }),
      eventId: user.id,
      metadata: { eventType: 'ACCOUNT_ACTIVATED', resolvedUserId: user.id, resolvedBy: 'nik' },
    });
  } catch {
    notificationSent = false;
  }
  await ctx.reply(formatUserProfile(user, {
    title: '✅ AKUN BERHASIL DIAKTIFKAN',
    footer: notificationSent
      ? 'Notifikasi aktivasi telah dikirim kepada user.'
      : 'Akun sudah aktif, tetapi notifikasi ke user gagal dikirim. Periksa collection notifications.',
  }));
}
