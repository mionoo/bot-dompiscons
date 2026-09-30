import { User } from "../../modules/users/user.model.js";
import { formatUserProfile } from "../user-profile.formatter.js";

export async function akunCommand(ctx) {
  const user = await User.findOne({ telegramChatId: String(ctx.chat.id) });
  if (!user)
    return ctx.reply("Akun belum terhubung. Gunakan /start terlebih dahulu.");
  return ctx.reply(formatUserProfile(user));
}
