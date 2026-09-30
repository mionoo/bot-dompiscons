import { User } from '../../modules/users/user.model.js';
import { setSession } from '../flows/session.store.js';

export async function startCommand(ctx) {
  const chatId = String(ctx.chat.id);
  const existing = await User.findOne({ telegramChatId: chatId });
  if (existing) return ctx.reply(`Akun sudah terhubung ke NIK ${existing.nik}. Gunakan /akun untuk melihat atau mengubah data.`);
  setSession(chatId, { flow: 'binding-nik' });
  return ctx.reply('Selamat datang. Kirim NIK atau username DOMPISCONS Anda untuk menghubungkan akun Telegram.');
}
