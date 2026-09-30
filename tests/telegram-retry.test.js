import test from 'node:test';
import assert from 'node:assert/strict';
import { retryDelayForTelegramError } from '../src/shared/telegram-retry.js';

test('retry jaringan Telegram memakai jeda bertahap dan tidak retry error permanen', () => {
  assert.equal(retryDelayForTelegramError({ code: 'ETIMEDOUT' }, 1), 2000);
  assert.equal(retryDelayForTelegramError({ code: 'ETIMEDOUT' }, 2), 5000);
  assert.equal(retryDelayForTelegramError({ code: 'ETIMEDOUT' }, 3), 10000);
  assert.equal(retryDelayForTelegramError({ parameters: { retry_after: 8 } }, 1), 8000);
  assert.equal(retryDelayForTelegramError({ code: 403 }, 1), null);
});
