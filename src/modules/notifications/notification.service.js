import { Notification } from './notification.model.js';
import { enqueueTelegramMessage } from '../../queues/telegram.sender.js';
import { splitTelegramMessage } from '../../shared/telegram-message.js';

export { splitTelegramMessage } from '../../shared/telegram-message.js';

export async function sendNotification({ chatId, message, eventId, jobId, metadata = {} }) {
  const parts = splitTelegramMessage(message);
  for (const [index, text] of parts.entries()) {
    const body = parts.length > 1 ? `Bagian ${index + 1}/${parts.length}\n\n${text}` : text;
    const notification = await Notification.create({ ...metadata, chatId, message: body, eventId, jobId, status: 'pending' });
    try {
      const delivery = await enqueueTelegramMessage({ chatId, message: body });
      await Notification.findByIdAndUpdate(notification.id, {
        status: 'sent',
        sentAt: new Date(),
        telegramMessageId: delivery.result.message_id ? String(delivery.result.message_id) : undefined,
        $inc: { attempts: delivery.attempts },
      });
    } catch (error) {
      await Notification.findByIdAndUpdate(notification.id, {
        status: 'failed',
        lastError: error.message,
        $inc: { attempts: error.deliveryAttempts ?? 1 },
      });
      throw error;
    }
  }
}
