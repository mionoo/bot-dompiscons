import mongoose from 'mongoose';

const incomingWebhookSchema = new mongoose.Schema({
  receivedAt: { type: Date, default: Date.now, index: true },
  sourceIp: { type: String, index: true },
  eventTypeRaw: { type: String, default: 'UNKNOWN', index: true },
  externalEventId: { type: String, index: true },
  externalProjectId: { type: String, index: true },
  sourceCreatedAt: Date,
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  mappingStatus: {
    type: String,
    enum: ['unmapped', 'draft', 'mapped', 'invalid'],
    default: 'unmapped',
    index: true,
  },
  processingStatus: {
    type: String,
    enum: ['captured', 'processed', 'skipped', 'failed'],
    default: 'captured',
    index: true,
  },
  notes: String,
}, { timestamps: true, collection: 'incoming_webhooks' });

export const IncomingWebhook = mongoose.model('IncomingWebhook', incomingWebhookSchema);
