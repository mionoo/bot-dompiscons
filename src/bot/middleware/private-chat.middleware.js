export const isPrivateChat = (ctx) => ctx.chat?.type === 'private';

export function privateOnly(handler) {
  return async (ctx) => {
    if (!isPrivateChat(ctx)) {
      await ctx.reply('Command ini hanya dapat digunakan melalui chat pribadi dengan bot.');
      return;
    }
    await handler(ctx);
  };
}
