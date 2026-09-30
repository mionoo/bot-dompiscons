import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPendingConfirmation, formatUserProfile } from '../src/bot/user-profile.formatter.js';

const user = { nik: '20971111', username: '20971111', name: 'Hendri Syahputra', branch: 'SURABAYA', role: 'waspang', status: 'active', telegramChatId: '68619032' };

test('formatter profil menampilkan status dan role dengan konsisten', () => {
  const profile = formatUserProfile(user);
  assert.match(profile, /💼 POSISI\nWASPANG/);
  assert.match(profile, /🟢 ACTIVE/);
  assert.match(formatPendingConfirmation(user, 1), /\/acc_20971111_68619032/);
});
