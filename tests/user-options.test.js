import test from 'node:test';
import assert from 'node:assert/strict';
import { BRANCHES, ROLES } from '../src/config/user-options.js';
import { branchKeyboard, roleKeyboard } from '../src/bot/keyboards/user.keyboard.js';

test('branch dan role tersedia sebagai pilihan tombol', () => {
  assert.equal(BRANCHES.length, 16);
  assert.ok(ROLES.length > 0);
  assert.deepEqual(branchKeyboard().inline_keyboard.flat().map((button) => button.text), BRANCHES);
  assert.deepEqual(roleKeyboard().inline_keyboard.flat().map((button) => button.text), ROLES.map((role) => role.toUpperCase()));
});
