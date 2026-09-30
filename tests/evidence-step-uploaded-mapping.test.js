import test from 'node:test';
import assert from 'node:assert/strict';
import { extractEvidenceStepUploaded, formatEvidenceStepUploadedMessage } from '../src/modules/webhook/evidence-step-uploaded.mapping.js';

test('evidence_step_uploaded mengambil data eviden dan membentuk pesan review', () => {
  const event = extractEvidenceStepUploaded({
    id: 11208,
    project_id: 2802,
    payload: {
      pid: 'TIF-15520/2026', stage: 'persiapan', project_name: '3NTT HEM 2026 SMA GARUDA SOE',
      uploader_name: 'SIMEON PEHI', uploader_role: 'waspang', recipient_nik: '25000112',
      recipient_username: '25000112', recipient_name: 'SOPHIA LAURENZA W. WERANG', recipient_role: 'admin',
    },
  });
  assert.equal(event.recipient.nik, '25000112');
  const message = formatEvidenceStepUploadedMessage(event);
  assert.match(message, /EVIDEN TAHAP DIUPLOAD/);
  assert.match(message, /PERSIAPAN/);
  assert.match(message, /SIMEON PEHI/);
  assert.match(message, /menunggu review Anda/);
});
