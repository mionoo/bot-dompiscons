import { env } from '../config/env.js';
import { logger } from '../shared/logger.js';
import { retryDelayForTelegramError } from '../shared/telegram-retry.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pending = [];
const lastSentByChat = new Map();
let running = false;
let telegram;

export function configureTelegramSender(bot) { telegram = bot.telegram; }

export function enqueueTelegramMessage(payload) {
  return new Promise((resolve, reject) => {
    pending.push({ ...payload, attempts: 0, retryCount: 0, resolve, reject });
    void processQueue();
  });
}

async function processQueue() {
  if (running || !telegram) return;
  running = true;
  while (pending.length) {
    const task = pending.shift();
    const lastSent = lastSentByChat.get(task.chatId) ?? 0;
    const waitForChat = Math.max(0, env.TELEGRAM_GROUP_DELAY_MS - (Date.now() - lastSent));
    if (waitForChat) await sleep(waitForChat);
    try {
      task.attempts += 1;
      const result = await telegram.sendMessage(task.chatId, task.message, task.options);
      lastSentByChat.set(task.chatId, Date.now());
      task.resolve({ result, attempts: task.attempts });
    } catch (error) {
      const nextRetry = task.retryCount + 1;
      const retryDelay = retryDelayForTelegramError(error, nextRetry);
      if (retryDelay && task.retryCount < 3) {
        task.retryCount = nextRetry;
        logger.warn({ err: error, chatId: task.chatId, retry: nextRetry, retryDelay }, 'Telegram send will retry');
        pending.unshift(task);
        await sleep(retryDelay);
      } else {
        logger.error({ err: error, chatId: task.chatId }, 'Telegram send failed');
        error.deliveryAttempts = task.attempts;
        task.reject(error);
      }
    }
    await sleep(env.TELEGRAM_GLOBAL_DELAY_MS);
  }
  running = false;
}
