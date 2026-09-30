import { Job } from '../jobs/job.model.js';
import { User } from '../users/user.model.js';
import { formatEventMessage } from '../../templates/event.template.js';
import { sendNotification } from '../notifications/notification.service.js';

export async function processWebhook(event) {
  if (event.eventId && await Job.exists({ eventId: event.eventId })) {
    return { duplicate: true };
  }

  const job = await Job.findOneAndUpdate(
    { externalId: event.ticketId },
    { $set: event, $setOnInsert: { externalId: event.ticketId } },
    { new: true, upsert: true },
  );

  if (!event.assignedNik) return { job, notified: false };
  const user = await User.findOne({ nik: event.assignedNik, status: 'active' });
  if (!user?.telegramChatId) return { job, notified: false, reason: 'Penerima belum binding Telegram' };

  await sendNotification({
    chatId: user.telegramChatId,
    message: formatEventMessage(job),
    eventId: event.eventId,
    jobId: job.externalId,
  });
  return { job, notified: true };
}
