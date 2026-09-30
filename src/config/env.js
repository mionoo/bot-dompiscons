import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  ADMIN_CHAT_IDS: z.string().default(''),
  WEBHOOK_ALLOWED_IPS: z.string().default(''),
  TELEGRAM_GLOBAL_DELAY_MS: z.coerce.number().int().min(100).default(300),
  TELEGRAM_GROUP_DELAY_MS: z.coerce.number().int().min(1000).default(3500),
  SLA_CRON: z.string().default('*/5 * * * *'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) throw new Error(`Environment tidak valid: ${parsed.error.message}`);

export const env = {
  ...parsed.data,
  adminChatIds: parsed.data.ADMIN_CHAT_IDS.split(',').map((id) => id.trim()).filter(Boolean),
  allowedWebhookIps: parsed.data.WEBHOOK_ALLOWED_IPS.split(',').map((ip) => ip.trim()).filter(Boolean),
};
