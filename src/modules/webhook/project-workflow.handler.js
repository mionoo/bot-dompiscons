import { User } from '../users/user.model.js';
import { Notification } from '../notifications/notification.model.js';
import { resolveRecipient } from '../notifications/recipient.resolver.js';
import { sendNotification } from '../notifications/notification.service.js';
import { extractProjectWorkflow, formatProjectWorkflowMessage } from './project-workflow.mapping.js';

const defaultServices = {
  resolveRecipient,
  findUsers: (query) => User.find(query),
  recordNotification: (record) => Notification.create(record),
  sendNotification,
};

async function handleProjectWorkflow(incomingWebhook, eventType, services) {
  const event = extractProjectWorkflow(incomingWebhook.payload, eventType);
  const metadata = {
    incomingWebhookId: incomingWebhook.id,
    eventId: event.eventId,
    eventType,
    jobId: event.projectId,
    projectCode: event.projectCode,
  };
  const message = formatProjectWorkflowMessage(event);

  if (eventType === 'sdi_verification_requested') {
    if (event.recipientType !== 'role' || event.recipientRole !== 'sdi') {
      throw new Error('Permintaan verifikasi SDI harus memiliki recipient_type role dan recipient_role sdi.');
    }
    const users = await services.findUsers({
      role: 'sdi',
      status: 'active',
      telegramChatId: { $exists: true, $nin: [null, ''] },
    });
    const recipients = users.filter((user) => String(user.telegramChatId ?? '').trim());
    const roleMetadata = { ...metadata, recipientInput: { role: 'sdi' }, resolvedBy: 'role' };
    if (!recipients.length) {
      await services.recordNotification({
        ...roleMetadata,
        status: 'recipientNotFound',
        lastError: 'Tidak ada user aktif ber-role sdi dengan Telegram terhubung.',
      });
      return { delivered: false, status: 'recipientNotFound' };
    }

    const errors = [];
    let sent = 0;
    for (const user of recipients) {
      try {
        await services.sendNotification({
          chatId: user.telegramChatId,
          message,
          eventId: event.eventId,
          jobId: event.projectId,
          metadata: { ...roleMetadata, resolvedUserId: user.id },
        });
        sent += 1;
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length) {
      throw new AggregateError(errors, `Notifikasi SDI: ${sent} berhasil, ${errors.length} gagal.`);
    }
    return { delivered: true, status: 'sent', sent };
  }

  if (event.recipientType !== 'user') {
    throw new Error(`Event ${eventType} harus memiliki recipient_type user.`);
  }
  const resolution = await services.resolveRecipient(event.recipient);
  const userMetadata = {
    ...metadata,
    recipientInput: event.recipient,
    resolvedUserId: resolution.user?.id,
    resolvedBy: resolution.resolvedBy,
  };
  if (resolution.status !== 'resolved') {
    await services.recordNotification({
      ...userMetadata,
      status: resolution.status,
      lastError: `Penerima tidak dapat dipilih dengan pencarian ${resolution.resolvedBy}.`,
    });
    return { delivered: false, status: resolution.status };
  }
  await services.sendNotification({
    chatId: resolution.user.telegramChatId,
    message,
    eventId: event.eventId,
    jobId: event.projectId,
    metadata: userMetadata,
  });
  return { delivered: true, status: 'sent' };
}

export function handleStageReviewRequested(incomingWebhook, services = defaultServices) {
  return handleProjectWorkflow(incomingWebhook, 'stage_review_requested', services);
}

export function handleSdiVerificationRequested(incomingWebhook, services = defaultServices) {
  return handleProjectWorkflow(incomingWebhook, 'sdi_verification_requested', services);
}

export function handleProjectGolive(incomingWebhook, services = defaultServices) {
  return handleProjectWorkflow(incomingWebhook, 'project_golive', services);
}
