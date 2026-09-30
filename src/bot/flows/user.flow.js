import { BRANCHES, ROLES } from "../../config/user-options.js";
import { User } from "../../modules/users/user.model.js";
import { branchKeyboard, roleKeyboard } from "../keyboards/user.keyboard.js";
import { clearSession, getSession, setSession } from "./session.store.js";
import { formatUserProfile } from "../user-profile.formatter.js";

const hasBranch = (user) =>
  typeof user.branch === "string" && user.branch.trim().length > 0;
const formatDraft = (draft) =>
  `NIK: ${draft.nik}\nNama: ${draft.name}\nBranch: ${draft.branch}\nPosisi: ${draft.role}`;

async function completeBinding(ctx, user) {
  const activeUser = await User.findByIdAndUpdate(user.id, {
    telegramChatId: String(ctx.chat.id),
    telegramUsername: ctx.from.username ?? "",
    status: "active",
  }, { new: true });
  clearSession(ctx.chat.id);
  await ctx.reply(formatUserProfile(activeUser, {
    title: "✅ AKUN BERHASIL TERHUBUNG",
    footer: "Akun Telegram Anda sudah siap menerima notifikasi.",
  }));
}

export async function handleUserText(ctx) {
  const chatId = String(ctx.chat.id);
  const session = getSession(chatId);
  if (!session || !ctx.message?.text || ctx.message.text.startsWith("/"))
    return false;
  const text = ctx.message.text.trim();

  if (session.flow === "binding-nik") {
    const user = await User.findOne({
      $or: [{ nik: text }, { username: text }],
    });
    if (!user)
      return ctx.reply(
        "NIK atau username belum terdaftar. Gunakan /register untuk membuat data baru.",
      );
    if (user.telegramChatId && user.telegramChatId !== chatId)
      return ctx.reply(
        "Data ini sudah terhubung ke akun Telegram lain. Hubungi admin bila perlu dipindahkan.",
      );
    if (!hasBranch(user)) {
      setSession(chatId, { flow: "binding-branch", userId: user.id });
      await ctx.reply("Data branch belum tersedia. Pilih branch Anda:", {
        reply_markup: branchKeyboard(),
      });
      return true;
    }
    await completeBinding(ctx, user);
    return true;
  }

  if (session.flow === "register-nik") {
    if (await User.exists({ $or: [{ nik: text }, { username: text }] }))
      return ctx.reply(
        "NIK atau username sudah terdaftar. Gunakan /start untuk menghubungkan akun.",
      );
    setSession(chatId, { flow: "register-name", nik: text });
    await ctx.reply("Masukkan nama lengkap Anda.");
    return true;
  }
  if (session.flow === "register-name") {
    setSession(chatId, { ...session, flow: "register-branch", name: text });
    await ctx.reply("Pilih branch Anda:", { reply_markup: branchKeyboard() });
    return true;
  }
  return false;
}

export async function handleUserAction(ctx) {
  const action = ctx.callbackQuery?.data;
  const chatId = String(ctx.chat.id);
  const session = getSession(chatId);
  if (action === "register:cancel") {
    clearSession(chatId);
    await ctx.answerCbQuery("Dibatalkan");
    await ctx.reply("Registrasi dibatalkan.");
    return true;
  }

  if (action?.startsWith("branch:")) {
    const branch = BRANCHES[Number(action.split(":")[1])];
    if (!branch || !session) return false;
    await ctx.answerCbQuery(`Branch: ${branch}`);
    if (session.flow === "binding-branch") {
      const user = await User.findByIdAndUpdate(
        session.userId,
        { branch },
        { new: true },
      );
      if (!user) {
        clearSession(chatId);
        await ctx.reply("Data user tidak ditemukan. Jalankan /start kembali.");
        return true;
      }
      await completeBinding(ctx, user);
      return true;
    }
    if (session.flow === "register-branch") {
      setSession(chatId, { ...session, flow: "register-role", branch });
      await ctx.reply("Pilih posisi Anda:", {
        reply_markup: roleKeyboard(),
      });
      return true;
    }
    return false;
  }

  if (action?.startsWith("role:") && session?.flow === "register-role") {
    const role = ROLES[Number(action.split(":")[1])];
    if (!role) return false;
    setSession(chatId, { ...session, flow: "register-confirm", role });
    await ctx.answerCbQuery(`Role: ${role}`);
    await ctx.reply(
      `Periksa data berikut:\n\n${formatDraft({ ...session, role })}\n\nSimpan data ini?`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Simpan", callback_data: "register:confirm" },
              { text: "Batal", callback_data: "register:cancel" },
            ],
          ],
        },
      },
    );
    return true;
  }

  if (action === "register:confirm" && session?.flow === "register-confirm") {
    await User.create({
      nik: session.nik,
      name: session.name,
      branch: session.branch,
      role: session.role,
      telegramChatId: chatId,
      telegramUsername: ctx.from.username ?? "",
      status: "needConfirm",
    });
    clearSession(chatId);
    await ctx.answerCbQuery("Tersimpan");
    await ctx.reply(
      "Registrasi berhasil disimpan. Admin akan melakukan konfirmasi sebelum akun diaktifkan.",
    );
    return true;
  }
  return false;
}
