import { setSession } from '../flows/session.store.js';

export async function registerCommand(ctx) {
  setSession(ctx.chat.id, { flow: 'register-nik' });
  return ctx.reply('Kirim NIK atau username DOMPISCONS.');
}
