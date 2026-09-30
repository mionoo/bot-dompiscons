import test from 'node:test';
import assert from 'node:assert/strict';
import { parseApprovalCommand } from '../src/bot/commands/confirmation.command.js';

test('parseApprovalCommand membaca NIK dan Telegram ID dari command acc', () => {
  assert.deepEqual(parseApprovalCommand('/acc_19930270_68619032'), {
    accountKey: '19930270', telegramChatId: '68619032',
  });
  assert.deepEqual(parseApprovalCommand('/acc_username_dengan_garis_bawah_68619032'), {
    accountKey: 'username_dengan_garis_bawah', telegramChatId: '68619032',
  });
  assert.equal(parseApprovalCommand('/acc_tidaklengkap'), null);
});
