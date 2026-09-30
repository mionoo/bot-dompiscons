import test from 'node:test';
import assert from 'node:assert/strict';
import { describeIncomingWebhook } from '../src/modules/webhook/webhook.capture.js';

test('describeIncomingWebhook menjaga payload asli dan mengambil metadata umum', () => {
  const payload = { id: 8931, event_type: 'project_assigned', project_id: 2957, created_at: '2026-09-04T17:17:13+07:00', payload: { recipient_nik: '19970227' } };
  const record = describeIncomingWebhook(payload, '192.168.88.4');
  assert.equal(record.eventTypeRaw, 'project_assigned');
  assert.equal(record.externalEventId, '8931');
  assert.equal(record.externalProjectId, '2957');
  assert.equal(record.sourceIp, '192.168.88.4');
  assert.deepEqual(record.payload, payload);
});
