import { User } from '../../modules/users/user.model.js';

export function superadminOnly(handler) {
  return async (ctx) => {
    const user = await User.findOne({ telegramChatId: String(ctx.chat.id) });
    if (String(user?.role ?? '').toLowerCase() !== 'superadmin') {
      await ctx.reply('Command ini hanya dapat digunakan oleh superadmin.');
      return;
    }
    await handler(ctx);
  };
}
