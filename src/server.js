import { createApp } from './app.js';
import { createBot } from './bot/index.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { startSlaCron } from './cron/sla.cron.js';
import { configureTelegramSender } from './queues/telegram.sender.js';
import { logger } from './shared/logger.js';

await connectDatabase();
const bot = createBot();
configureTelegramSender(bot);
void bot.launch().catch((error) => logger.error({ err: error }, 'Telegram bot failed to launch'));
startSlaCron();
const server = createApp().listen(env.PORT, () => logger.info({ port: env.PORT }, 'Server started'));

async function shutdown(signal) {
  logger.info({ signal }, 'Shutting down');
  server.close();
  bot.stop(signal);
  process.exit(0);
}
process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
