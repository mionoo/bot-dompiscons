import test from 'node:test';
import assert from 'node:assert/strict';
import { extractProjectAssigned, formatProjectAssignedMessage } from '../src/modules/webhook/project-assigned.mapping.js';

test('project_assigned mengambil penerima dan membentuk pesan teks polos', () => {
  const event = extractProjectAssigned({
    id: 11199,
    project_id: 2957,
    payload: {
      pid: 'TIF-16677/2026', is_reassign: true, project_name: 'PT3_2500*335',
      recipient_nik: '19970227', recipient_username: '19970227', recipient_name: 'AMBANG RAMADHAN', role_assigned_as: 'waspang',
    },
  });
  assert.deepEqual(event.recipient, { nik: '19970227', username: '19970227', name: 'AMBANG RAMADHAN', assignedRole: 'waspang' });
  assert.match(formatProjectAssignedMessage(event), /PROJECT DI-ASSIGN ULANG/);
  assert.match(formatProjectAssignedMessage(event), /PT3_2500\*335/);
  assert.match(formatProjectAssignedMessage(event), /Posisi: WASPANG/);
});
