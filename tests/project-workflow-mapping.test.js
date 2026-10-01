import test from 'node:test';
import assert from 'node:assert/strict';
import { extractProjectWorkflow, formatProjectWorkflowMessage } from '../src/modules/webhook/project-workflow.mapping.js';
import { getEventMapping } from '../src/config/event-mappings.js';

test('review tahap menggunakan judul dan pesan webhook serta label tahap', () => {
  const event = extractProjectWorkflow({
    id: 40192, project_id: 7392, recipient_type: 'user',
    title: 'Review Finishing PT3',
    message: 'Hendri Syahputra telah menyelesaikan Finishing. Mohon lakukan review.',
    payload: {
      pid: 'PID0324', project_name: '3DMO-LOP-Dummy', lop_name: '3DMO-LOP-Dummy',
      stage_code: 'finishing', stage_label: 'Finishing',
      recipient_nik: '12345678', recipient_name: 'Admin', recipient_username: 'admin', recipient_role: 'admin',
    },
  }, 'stage_review_requested');
  assert.equal(event.eventId, '40192');
  assert.equal(event.projectId, '7392');
  assert.equal(event.recipient.nik, '12345678');
  assert.equal(formatProjectWorkflowMessage(event), [
    '🔍 Review Finishing PT3', '', 'PID: PID0324', 'Project: 3DMO-LOP-Dummy',
    'LOP: 3DMO-LOP-Dummy', 'Tahap: Finishing', '',
    'Hendri Syahputra telah menyelesaikan Finishing. Mohon lakukan review.',
  ].join('\n'));
});

test('judul baru dan pesan Golive mengikuti webhook tanpa mengunci flow PT3', () => {
  const event = extractProjectWorkflow({
    title: ' Project PT4 Sudah Golive ', message: ' Project berhasil Golive. ',
    payload: { stage_code: 'golive' },
  }, 'project_golive');
  assert.equal(formatProjectWorkflowMessage(event),
    '✅ Project PT4 Sudah Golive\n\nTahap: golive\n\nProject berhasil Golive.');
});

test('verifikasi SDI memiliki fallback judul dan pesan, tanpa field kosong', () => {
  const event = extractProjectWorkflow({ title: ' ', message: null }, 'sdi_verification_requested');
  assert.equal(formatProjectWorkflowMessage(event),
    '📋 Verifikasi Golive\n\nMohon upload eviden UIM agar project segera Golive.');
});

test('ketiga event baru memiliki mapping aktif', () => {
  for (const eventType of ['stage_review_requested', 'sdi_verification_requested', 'project_golive']) {
    assert.equal(getEventMapping(eventType).status, 'active');
    assert.equal(getEventMapping(eventType).internalType, eventType.toUpperCase());
  }
});
