import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiErrorMessage } from './apiErrors.js';

test('apiErrorMessage maps duplicate brand', () => {
  assert.equal(
    apiErrorMessage(new Error('UNIQUE constraint failed: brands.name'), 'x'),
    'A brand with this name already exists.',
  );
});

test('apiErrorMessage hides generic sqlite', () => {
  assert.equal(apiErrorMessage(new Error('SQLITE_ERROR: near foo'), 'Fallback'), 'Fallback');
});
