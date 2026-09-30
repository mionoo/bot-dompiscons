import cron from 'node-cron';
import { env } from '../config/env.js';
import { Job } from '../modules/jobs/job.model.js';
import { User } from '../modules/users/user.model.js';
import { sendNotification } from '../modules/notifications/notification.service.js';
import { logger } from '../shared/logger.js';

export function startSlaCron() {
  cron.schedule(env.SLA_CRON, async () => {
    const threshold = new Date(Date.now() + 30 * 60_000);
    const lastAlertLimit = new Date(Date.now() - 30 * 60_000);
    const jobs = await Job.find({ slaDueAt: { $lte: threshold }, status: { $nin: ['closed', 'done'] }, $or: [{ lastSlaAlertAt: null }, { lastSlaAlertAt: { $lt: lastAlertLimit } }] });
    for (const job of jobs) {
      const user = await User.findOne({ nik: job.assignedNik, status: 'active' });
      if (!user?.telegramChatId) continue;
      await sendNotification({ chatId: user.telegramChatId, jobId: job.externalId, message: `⏰ PERINGATAN SLA\n\nTiket: ${job.externalId}\nBatas SLA: ${job.slaDueAt.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}` });
      await Job.findByIdAndUpdate(job.id, { lastSlaAlertAt: new Date() });
    }
  });
  logger.info({ cron: env.SLA_CRON }, 'SLA cron started');
}
