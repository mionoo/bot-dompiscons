import { Notification } from '../notifications/notification.model.js';
import { resolveRecipient } from '../notifications/recipient.resolver.js';
import { sendNotification } from '../notifications/notification.service.js';
import { extractEvidenceRejected, formatEvidenceRejectedMessage } from './evidence-rejected.mapping.js';

export async function handleEvidenceRejected(incomingWebhook) {
  const event = extractEvidenceRejected(incomingWebhook.payload);
  const resolution = await resolveRecipient(event.recipient);
  const metadata = {
    incomingWebhookId: incomingWebhook.id,
    eventId: event.eventId,
    eventType: 'evidence_rejected',
    recipientInput: event.recipient,
    resolvedUserId: resolution.user?.id,
    resolvedBy: resolution.resolvedBy,
  };
  if (resolution.status !== 'resolved') {
    await Notification.create({
      ...metadata,
      status: resolution.status,
      lastError: `Penerima tidak dapat dipilih dengan pencarian ${resolution.resolvedBy}.`,
    });
    return { delivered: false, status: resolution.status };
  }
  await sendNotification({
    chatId: resolution.user.telegramChatId,
    message: formatEvidenceRejectedMessage(event),
    eventId: event.eventId,
    jobId: event.projectId,
    metadata,
  });
  return { delivered: true, status: 'sent' };
}
