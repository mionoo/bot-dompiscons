import test from 'node:test';
import assert from 'node:assert/strict';
import { splitTelegramMessage } from '../src/shared/telegram-message.js';

test('splitTelegramMessage membagi pesan yang melebihi batas aman Telegram', () => {
  const text = `${'A'.repeat(2000)}\n${'B'.repeat(2000)}\n${'C'.repeat(2000)}`;
  const parts = splitTelegramMessage(text);
  assert.equal(parts.length, 2);
  assert.ok(parts.every((part) => part.length <= 3800));
});
