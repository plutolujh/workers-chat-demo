import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickInitialPage } from '../src/backlog.mjs';

// Entries are ordered newest-first, like Durable Object storage.list({reverse: true}).
function makeEntries(count) {
  // count = 3 -> ["msg3", "msg2", "msg1"] (newest first)
  return Array.from({ length: count }, (_, i) => `msg${count - i}`);
}

test('keeps every message when the room has fewer than a page', () => {
  const { page, hasMore } = pickInitialPage(makeEntries(5), 30);
  assert.equal(hasMore, false);
  assert.deepEqual(page, ['msg5', 'msg4', 'msg3', 'msg2', 'msg1']);
});

test('keeps exactly a page when the room has exactly a page', () => {
  const { page, hasMore } = pickInitialPage(makeEntries(30), 30);
  assert.equal(hasMore, false);
  assert.equal(page.length, 30);
  assert.ok(page.includes('msg30'), 'newest message must be kept');
});

test('keeps the NEWEST page and reports that older messages exist', () => {
  const { page, hasMore } = pickInitialPage(makeEntries(31), 30);
  assert.equal(hasMore, true);
  assert.equal(page.length, 30);
  assert.ok(page.includes('msg31'), 'newest message must be kept');
  assert.ok(!page.includes('msg1'), 'oldest message is the one that gets paged out');
});

test('keeps the NEWEST page for a large room', () => {
  const { page, hasMore } = pickInitialPage(makeEntries(500), 30);
  assert.equal(hasMore, true);
  assert.equal(page.length, 30);
  assert.equal(page[0], 'msg500', 'first entry must be the newest message');
});
