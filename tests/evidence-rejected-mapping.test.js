import test from 'node:test';
import assert from 'node:assert/strict';
import { extractEvidenceRejected, formatEvidenceRejectedMessage } from '../src/modules/webhook/evidence-rejected.mapping.js';
import { getEventMapping } from '../src/config/event-mappings.js';

test('evidence_rejected PT2 mengambil penerima dan menampilkan LOP, tipe eviden, serta catatan', () => {
  const event = extractEvidenceRejected({
    id: 23493, project_id: 6, title: 'Eviden PT2 Ditolak',
    payload: {
      stage: 'finishing', is_pt2: true, lop_name: 'LOP-12733', evidence_id: 5779,
      project_name: 'ODP-GER-FAF-08', evidence_type: 'splitter_1_4',
      review_note: 'ada bongkar passif 1:4 buat dikembalikan ke gudang ?',
      recipient_nik: '16964266', recipient_username: '16964266',
      recipient_name: 'SAHWAN', recipient_role: 'teknisi',
    },
  });
  assert.equal(event.eventId, '23493');
  assert.equal(event.projectId, '6');
  assert.equal(event.evidenceId, '5779');
  assert.deepEqual(event.recipient, {
    nik: '16964266', username: '16964266', name: 'SAHWAN', assignedRole: 'teknisi',
  });
  assert.equal(formatEvidenceRejectedMessage(event), [
    '❌ Eviden PT2 Ditolak', '', 'Project: ODP-GER-FAF-08', 'LOP: LOP-12733',
    'Tahap: Finishing', 'Eviden: splitter_1_4', '', 'Catatan:',
    'ada bongkar passif 1:4 buat dikembalikan ke gudang ?',
  ].join('\n'));
});

test('eviden biasa mengutamakan label dan menghilangkan LOP yang tidak tersedia', () => {
  const event = extractEvidenceRejected({
    title: 'Eviden Ditolak', lop_id: null,
    payload: {
      stage: 'persiapan', project_name: 'LMG122', evidence_type: 'perizinan',
      evidence_label: 'Persiapan | Perizinan',
      review_note: 'upload BA prelim dan foto bersama pihak ketiga',
    },
  });
  assert.equal(formatEvidenceRejectedMessage(event), [
    '❌ Eviden Ditolak', '', 'Project: LMG122', 'Tahap: Persiapan',
    'Eviden: Persiapan | Perizinan', '', 'Catatan:',
    'upload BA prelim dan foto bersama pihak ketiga',
  ].join('\n'));
});

test('judul baru dari webhook dipakai meskipun is_pt2 bernilai true', () => {
  const event = extractEvidenceRejected({
    title: ' Eviden PT3 Ditolak ', payload: { is_pt2: true },
  });
  assert.equal(formatEvidenceRejectedMessage(event), '❌ Eviden PT3 Ditolak');
});

test('judul kosong atau tidak tersedia menggunakan fallback dengan boolean PT2 yang ketat', () => {
  for (const title of [undefined, null, '', '   ']) {
    for (const isPt2 of [true, false, undefined, 'false']) {
      const event = extractEvidenceRejected({ title, payload: { is_pt2: isPt2 } });
      assert.equal(formatEvidenceRejectedMessage(event),
        isPt2 === true ? '❌ Eviden PT2 Ditolak' : '❌ Eviden Ditolak');
    }
  }
  assert.equal(formatEvidenceRejectedMessage(extractEvidenceRejected({})), '❌ Eviden Ditolak');
});

test('evidence_rejected memiliki mapping aktif', () => {
  assert.equal(getEventMapping('evidence_rejected').status, 'active');
  assert.equal(getEventMapping('EVIDENCE_REJECTED').internalType, 'EVIDENCE_REJECTED');
});
