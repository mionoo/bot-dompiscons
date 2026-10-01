import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  incomingWebhookId: { type: mongoose.Schema.Types.ObjectId, index: true },
  eventId: { type: String, index: true },
  eventType: { type: String, index: true },
  jobId: { type: String, index: true },
  projectCode: { type: String, index: true },
  recipientInput: mongoose.Schema.Types.Mixed,
  resolvedUserId: { type: mongoose.Schema.Types.ObjectId, index: true },
  resolvedBy: { type: String, enum: ['nik', 'username', 'name', 'role', 'none'] },
  chatId: { type: String, index: true },
  message: String,
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'recipientNotFound', 'recipientAmbiguous', 'recipientInactive', 'recipientNoTelegram'],
    default: 'pending',
    index: true,
  },
  attempts: { type: Number, default: 0 },
  telegramMessageId: String,
  sentAt: Date,
  lastError: String,
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
