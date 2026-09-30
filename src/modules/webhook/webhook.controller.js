import { IncomingWebhook } from './incoming-webhook.model.js';
import { describeIncomingWebhook } from './webhook.capture.js';
import { getEventMapping } from '../../config/event-mappings.js';
import { dispatchMappedWebhook } from './webhook.dispatcher.js';

export async function receiveWebhook(req, res, next) {
  try {
    const document = describeIncomingWebhook(req.body, req.ip.replace('::ffff:', ''));
    const mapping = getEventMapping(document.eventTypeRaw);
    if (mapping?.status === 'draft') {
      document.mappingStatus = 'draft';
      document.processingStatus = 'skipped';
      document.notes = `Mapping ${mapping.internalType} masih berstatus draft; notifikasi belum dikirim.`;
    } else if (mapping?.status === 'active') {
      document.mappingStatus = 'mapped';
    }
    const record = await IncomingWebhook.create(document);
    res.status(202).json({ ok: true, status: 'captured', webhookId: record.id });
    if (mapping?.status === 'active') {
      void dispatchMappedWebhook(record, mapping)
        .then(() => IncomingWebhook.findByIdAndUpdate(record.id, { processingStatus: 'processed' }))
        .catch((error) => IncomingWebhook.findByIdAndUpdate(record.id, { processingStatus: 'failed', notes: error.message }));
    }
  } catch (error) { next(error); }
}
