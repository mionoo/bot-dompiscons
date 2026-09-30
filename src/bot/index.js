import { Telegraf } from "telegraf";
import { env } from "../config/env.js";
import { logger } from "../shared/logger.js";
import { startCommand } from "./commands/start.command.js";
import { registerCommand } from "./commands/register.command.js";
import { akunCommand } from "./commands/akun.command.js";
import {
  approveCommand,
  cekConfirmCommand,
} from "./commands/confirmation.command.js";
import { clearSession } from "./flows/session.store.js";
import { handleUserAction, handleUserText } from "./flows/user.flow.js";
import {
  isPrivateChat,
  privateOnly,
} from "./middleware/private-chat.middleware.js";
import { superadminOnly } from "./middleware/superadmin.middleware.js";

export function createBot() {
  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
  bot.command("start", privateOnly(startCommand));
  bot.command("register", privateOnly(registerCommand));
  bot.command("akun", privateOnly(akunCommand));
  bot.command("cekconfirm", privateOnly(superadminOnly(cekConfirmCommand)));
  bot.command("cekacc", privateOnly(superadminOnly(cekConfirmCommand)));
  bot.hears(/^\/acc_.+$/, privateOnly(superadminOnly(approveCommand)));
  bot.command(
    "cancel",
    privateOnly(async (ctx) => {
      clearSession(ctx.chat.id);
      await ctx.reply("Proses dibatalkan.");
    }),
  );
  bot.on("callback_query", async (ctx) => {
    if (!isPrivateChat(ctx))
      return ctx.answerCbQuery("Aksi ini hanya tersedia di chat pribadi.");
    if (!(await handleUserAction(ctx)))
      await ctx.answerCbQuery("Aksi sudah tidak berlaku");
  });
  bot.on("text", async (ctx) => {
    if (isPrivateChat(ctx)) await handleUserText(ctx);
  });
  bot.catch((error, ctx) =>
    logger.error(
      { err: error, updateId: ctx.update.update_id },
      "Telegram update failed",
    ),
  );
  return bot;
}
