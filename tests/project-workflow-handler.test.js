import test from 'node:test';
import assert from 'node:assert/strict';

// Dependencies are replaced below; tests never connect to MongoDB or Telegram.
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test';
process.env.TELEGRAM_BOT_TOKEN = 'test-token';
const { handleStageReviewRequested, handleSdiVerificationRequested, handleProjectGolive } =
  await import('../src/modules/webhook/project-workflow.handler.js');
const { Notification } = await import('../src/modules/notifications/notification.model.js');

function incoming(payload = {}) {
  return {
    id: 'webhook-40193',
    payload: {
      id: 40193, project_id: 7392, recipient_type: 'role', recipient_role: 'sdi',
      title: 'Verifikasi Golive PT3', message: 'Mohon upload eviden UIM.',
      payload: { pid: 'PID0324' },
      ...payload,
    },
  };
}

function services(overrides = {}) {
  return {
    resolveRecipient: async () => { throw new Error('Pencarian user tidak diharapkan'); },
    findUsers: async () => { throw new Error('Pencarian role tidak diharapkan'); },
    recordNotification: async () => { throw new Error('Pencatatan penerima tidak diharapkan'); },
    sendNotification: async () => { throw new Error('Pengiriman tidak diharapkan'); },
    ...overrides,
  };
}

test('SDI mencari seluruh user aktif ber-role sdi dengan Telegram dan mengirim lintas branch', async () => {
  const sent = [];
  const result = await handleSdiVerificationRequested(incoming(), services({
    findUsers: async (query) => {
      assert.deepEqual(query, {
        role: 'sdi', status: 'active', telegramChatId: { $exists: true, $nin: [null, ''] },
      });
      return [
        { id: 'sdi-1', telegramChatId: '111', branch: 'MATARAM' },
        { id: 'sdi-2', telegramChatId: '222', branch: 'SURABAYA' },
        { id: 'sdi-empty', telegramChatId: '   ' },
      ];
    },
    sendNotification: async (notification) => { sent.push(notification); },
  }));
  assert.deepEqual(result, { delivered: true, status: 'sent', sent: 2 });
  assert.deepEqual(sent.map((notification) => notification.chatId), ['111', '222']);
  assert.deepEqual(sent.map((notification) => notification.metadata.resolvedUserId), ['sdi-1', 'sdi-2']);
  for (const notification of sent) {
    assert.equal(notification.metadata.resolvedBy, 'role');
    assert.equal(notification.metadata.incomingWebhookId, 'webhook-40193');
    assert.equal(notification.metadata.eventType, 'sdi_verification_requested');
    assert.equal(notification.jobId, '7392');
  }
});

test('kegagalan kirim pertama tidak menghentikan penerima SDI berikutnya', async () => {
  const attempts = [];
  await assert.rejects(handleSdiVerificationRequested(incoming(), services({
    findUsers: async () => [{ id: 'one', telegramChatId: '111' }, { id: 'two', telegramChatId: '222' }],
    sendNotification: async ({ chatId }) => {
      attempts.push(chatId);
      if (chatId === '111') throw new Error('Telegram gagal');
    },
  })), (error) => error instanceof AggregateError && /1 berhasil, 1 gagal/.test(error.message));
  assert.deepEqual(attempts, ['111', '222']);
});

test('tidak ada SDI yang memenuhi syarat dicatat tanpa mengirim pesan', async () => {
  const records = [];
  const result = await handleSdiVerificationRequested(incoming(), services({
    findUsers: async () => [],
    recordNotification: async (record) => { records.push(record); },
  }));
  assert.equal(result.status, 'recipientNotFound');
  assert.equal(result.delivered, false);
  assert.equal(records[0].status, 'recipientNotFound');
  assert.equal(records[0].resolvedBy, 'role');
});

test('payload verifikasi yang bukan target role sdi tidak melakukan broadcast', async () => {
  for (const payload of [{ recipient_role: 'admin' }, { recipient_type: 'user' }]) {
    await assert.rejects(handleSdiVerificationRequested(incoming(payload), services()), /recipient_role sdi/);
  }
});

test('review dan Golive hanya dikirim kepada user yang berhasil di-resolve', async () => {
  for (const handler of [handleStageReviewRequested, handleProjectGolive]) {
    const sent = [];
    await handler(incoming({
      recipient_type: 'user', recipient_role: null,
      payload: { recipient_nik: '20971111', recipient_username: '20971111', recipient_name: 'Hendri' },
    }), services({
      resolveRecipient: async (recipient) => {
        assert.equal(recipient.nik, '20971111');
        return { status: 'resolved', resolvedBy: 'nik', user: { id: 'hendri', telegramChatId: '333' } };
      },
      sendNotification: async (notification) => { sent.push(notification); },
    }));
    assert.equal(sent.length, 1);
    assert.equal(sent[0].chatId, '333');
    assert.equal(sent[0].metadata.resolvedBy, 'nik');
  }
});

test('penerima user yang ambigu dicatat tanpa mengirim notifikasi', async () => {
  const records = [];
  await handleStageReviewRequested(incoming({ recipient_type: 'user' }), services({
    resolveRecipient: async () => ({ status: 'recipientAmbiguous', resolvedBy: 'name' }),
    recordNotification: async (record) => { records.push(record); },
  }));
  assert.equal(records[0].status, 'recipientAmbiguous');
});

test('schema notifikasi menerima hasil pencarian berdasarkan role', () => {
  const notification = new Notification({ resolvedBy: 'role', status: 'recipientNotFound' });
  assert.equal(notification.validateSync(), undefined);
});
