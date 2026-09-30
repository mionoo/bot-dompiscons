import test from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateChat } from '../src/bot/middleware/private-chat.middleware.js';

test('isPrivateChat hanya menerima percakapan pribadi', () => {
  assert.equal(isPrivateChat({ chat: { type: 'private' } }), true);
  assert.equal(isPrivateChat({ chat: { type: 'group' } }), false);
  assert.equal(isPrivateChat({ chat: { type: 'supergroup' } }), false);
  assert.equal(isPrivateChat({ chat: { type: 'channel' } }), false);
});
