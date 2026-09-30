import { Notification } from '../notifications/notification.model.js';
import { resolveRecipient } from '../notifications/recipient.resolver.js';
import { sendNotification } from '../notifications/notification.service.js';
import { extractProjectAssigned, formatProjectAssignedMessage } from './project-assigned.mapping.js';

// Handler ini belum dipanggil ketika mapping masih draft. Ia menjadi jalur kirim
// ketika project_assigned sudah diset active setelah format event diverifikasi.
export async function handleProjectAssigned(incomingWebhook) {
  const event = extractProjectAssigned(incomingWebhook.payload);
  const resolution = await resolveRecipient(event.recipient);
  const metadata = {
    incomingWebhookId: incomingWebhook.id,
    eventId: event.eventId,
    eventType: 'project_assigned',
    projectCode: event.projectCode,
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
    message: formatProjectAssignedMessage(event),
    eventId: event.eventId,
    jobId: event.projectId,
    metadata,
  });
  return { delivered: true, status: 'sent' };
}
