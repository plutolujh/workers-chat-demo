import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeMediaUrl, sanitizeQuote, byteLength } from '../src/sanitize.mjs';

const env = { SHOTSYNC_URL: 'https://shotsync.hao123456.cn' };

test('keeps URLs of our own upload service', () => {
  const url = 'https://shotsync.hao123456.cn/share/abc123?room=lobby';
  assert.equal(sanitizeMediaUrl(url, env), url);
});

test('keeps subdomains of the upload service', () => {
  const url = 'https://cdn.shotsync.hao123456.cn/pub/abc123';
  assert.equal(sanitizeMediaUrl(url, env), url);
});

test('drops URLs of other hosts', () => {
  assert.equal(sanitizeMediaUrl('https://evil.example.com/x.png', env), null);
  assert.equal(sanitizeMediaUrl('https://shotsync.hao123456.cn.evil.com/x.png', env), null);
});

test('drops non-http schemes', () => {
  assert.equal(sanitizeMediaUrl('javascript:alert(1)', env), null);
  assert.equal(sanitizeMediaUrl('data:text/html;base64,PHNjcmlwdD4=', env), null);
  assert.equal(sanitizeMediaUrl('"><img src=x onerror=alert(1)>', env), null);
});

test('drops a video message when one of the two URLs is foreign', () => {
  const ok = 'https://shotsync.hao123456.cn/pub/t.png::VIDEO::https://shotsync.hao123456.cn/pub/v.mp4';
  assert.equal(sanitizeMediaUrl(ok, env), ok);

  const bad = 'https://shotsync.hao123456.cn/pub/t.png::VIDEO::https://evil.example.com/v.mp4';
  assert.equal(sanitizeMediaUrl(bad, env), null);
});

test('drops empty and non-string values', () => {
  assert.equal(sanitizeMediaUrl('', env), null);
  assert.equal(sanitizeMediaUrl(null, env), null);
  assert.equal(sanitizeMediaUrl({toString: () => 'x'}, env), null);
});

test('quotes are capped and kept as text', () => {
  const quote = sanitizeQuote({ id: 5, name: 'bob', text: 'hello' });
  assert.deepEqual(quote, { id: 5, name: 'bob', text: 'hello' });

  const long = sanitizeQuote({ id: 1, name: 'x'.repeat(200), text: 'y'.repeat(5000) });
  assert.equal(long.name.length, 64);
  assert.equal(long.text.length, 500);
});

test('a quote without id keeps a null id', () => {
  const quote = sanitizeQuote({ name: 'bob', text: 'hi' });
  assert.equal(quote.id, null);
});

test('an empty quote is dropped', () => {
  assert.equal(sanitizeQuote(null), null);
  assert.equal(sanitizeQuote({}), null);
});

test('byteLength counts bytes, not characters', () => {
  assert.equal(byteLength('abc'), 3);
  assert.equal(byteLength('中'), 3);
});
